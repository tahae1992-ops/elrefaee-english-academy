"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle, Flag, Send } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface TutorMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  flagged: boolean;
}

type ErrorKind = "unavailable" | "rateLimit" | "generic";

/**
 * doc 08 §3.11 AI Tutor Chat — docked panel/drawer over the Lesson
 * screen (Sheet gives us this responsively: full desktop docked panel,
 * ~3/4-width drawer on mobile). Talks only to the ai module's own API
 * routes; all lesson/learner context is server-resolved there, never
 * sent from the client (see send-tutor-message.controller.ts).
 */
export function TutorChat({
  open,
  onOpenChange,
  lessonId,
  unitOrderIndex,
  starters,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: string;
  unitOrderIndex: number | null;
  starters: string[];
}) {
  const t = useTranslations("Tutor");
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || historyLoaded) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(`/api/v1/ai/tutor/messages?lessonId=${lessonId}`);
        if (response.ok) {
          const data = (await response.json()) as { messages: TutorMessage[] };
          if (!cancelled) setMessages(data.messages);
        }
      } finally {
        if (!cancelled) setHistoryLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, historyLoaded, lessonId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setInput("");
    setErrorKind(null);
    setSending(true);
    try {
      const response = await fetch("/api/v1/ai/tutor/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, message: trimmed }),
      });
      if (response.status === 429) {
        setErrorKind("rateLimit");
        return;
      }
      if (response.status === 503) {
        setErrorKind("unavailable");
        return;
      }
      if (!response.ok) {
        setErrorKind("generic");
        return;
      }
      const data = (await response.json()) as { userMessage: TutorMessage; assistantMessage: TutorMessage };
      setMessages((prev) => [...prev, data.userMessage, data.assistantMessage]);
    } catch {
      setErrorKind("generic");
    } finally {
      setSending(false);
    }
  }

  async function flagMessage(messageId: number) {
    setMessages((prev) => prev.map((message) => (message.id === messageId ? { ...message, flagged: true } : message)));
    try {
      await fetch(`/api/v1/ai/tutor/messages/${messageId}/flag`, { method: "POST" });
    } catch {
      // Best-effort — the optimistic flag stands in the UI even if the request itself fails.
    }
  }

  const headerLabel = unitOrderIndex !== null ? t("headerWithUnit", { unitNumber: unitOrderIndex }) : t("headerLabel");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle>{headerLabel}</SheetTitle>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2" aria-live="polite">
          {historyLoaded && messages.length === 0 && (
            <div className="flex flex-col gap-3 py-4">
              <p className="text-sm text-muted-foreground">{t("emptyState")}</p>
              <div className="flex flex-col gap-2">
                {starters.map((starter) => (
                  <Button
                    key={starter}
                    variant="outline"
                    size="sm"
                    className="h-auto justify-start whitespace-normal text-left"
                    onClick={() => sendMessage(starter)}
                  >
                    {starter}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <ul className="flex flex-col gap-3 py-2">
            {messages.map((message) => (
              <li key={message.id} className={cn("flex flex-col gap-1", message.role === "user" ? "items-end" : "items-start")}>
                {message.role === "assistant" && (
                  <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <MessageCircle className="size-3" aria-hidden="true" />
                    {t("aiLabel")}
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}
                >
                  {message.content}
                </div>
                {message.role === "assistant" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto px-1 py-0.5 text-xs text-muted-foreground"
                    disabled={message.flagged}
                    onClick={() => flagMessage(message.id)}
                  >
                    <Flag className="size-3" aria-hidden="true" />
                    {message.flagged ? t("flagged") : t("flag")}
                  </Button>
                )}
              </li>
            ))}
          </ul>

          {sending && (
            <div className="flex flex-col items-start gap-1 py-2">
              <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <MessageCircle className="size-3" aria-hidden="true" />
                {t("aiLabel")}
              </span>
              <div className="w-fit rounded-lg bg-muted px-3 py-2" role="status">
                <span className="sr-only">{t("typing")}</span>
                <span className="inline-flex gap-1" aria-hidden="true">
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
                </span>
              </div>
            </div>
          )}

          {errorKind && (
            <Alert variant="destructive" role="alert" className="mt-2">
              <AlertDescription>{t(`error.${errorKind}`)}</AlertDescription>
            </Alert>
          )}
        </div>

        <SheetFooter className="border-t border-border">
          <form
            className="flex w-full gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(input);
            }}
          >
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t("inputPlaceholder")}
              className="min-h-10 flex-1 resize-none"
              rows={1}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage(input);
                }
              }}
            />
            <Button type="submit" size="icon" disabled={sending || input.trim().length === 0} aria-label={t("send")}>
              <Send className="size-4" aria-hidden="true" />
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
