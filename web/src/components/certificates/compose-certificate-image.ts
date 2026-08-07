/**
 * Hi-Fi §5.11: "[Share] generates the card as a shareable image --
 * client-side composition of the same visual spec (not a separate,
 * drifting design)." Composed directly onto a Canvas 2D context
 * (matching the card's own content fields) rather than a DOM
 * screenshot library -- no such dependency is installed, and this
 * keeps the shareable image in lockstep with the card's actual data
 * by construction rather than by two implementations staying in
 * sync by discipline.
 */
export interface ComposeCertificateImageInput {
  levelLabel: string;
  issuer: string;
  issuedAtLabel: string;
  holderDisplayName: string;
  disclaimerText: string;
  verificationUrl: string;
}

const WIDTH = 960;
const HEIGHT = 1280;

export function composeCertificateImage(canvas: HTMLCanvasElement, input: ComposeCertificateImageInput): void {
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = "#C98A2B";
  ctx.lineWidth = 16;
  ctx.strokeRect(24, 24, WIDTH - 48, HEIGHT - 48);

  ctx.fillStyle = "#171412";
  ctx.textAlign = "center";

  ctx.font = "600 32px Georgia, serif";
  ctx.fillText("Elrefaee English Academy", WIDTH / 2, 200);

  ctx.font = "400 24px Georgia, serif";
  ctx.fillStyle = "#5b5550";
  ctx.fillText("Certificate of Achievement", WIDTH / 2, 250);

  ctx.font = "700 120px Georgia, serif";
  ctx.fillStyle = "#171412";
  ctx.fillText(input.levelLabel, WIDTH / 2, 480);

  ctx.font = "400 28px Georgia, serif";
  ctx.fillText(input.holderDisplayName, WIDTH / 2, 580);

  ctx.font = "400 20px Georgia, serif";
  ctx.fillStyle = "#5b5550";
  ctx.fillText(`Issued ${input.issuedAtLabel} by ${input.issuer}`, WIDTH / 2, 630);

  wrapText(ctx, input.disclaimerText, WIDTH / 2, 900, WIDTH - 200, 28);

  ctx.font = "400 18px monospace";
  ctx.fillStyle = "#171412";
  ctx.fillText(input.verificationUrl, WIDTH / 2, HEIGHT - 100);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
  ctx.font = "400 16px Georgia, serif";
  ctx.fillStyle = "#7a746e";
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, currentY);
}
