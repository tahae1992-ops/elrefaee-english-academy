import type { CefrLevel } from "@/modules/curriculum/domain/services/compute-course-access";

export interface PublishedCourse {
  id: string;
  academyId: string;
  cefrLevel: CefrLevel;
  title: string;
  description: string;
}

export interface CourseRepositoryPort {
  /** Published courses only (RLS also enforces this — see 0012_curriculum_tables_rls.sql). */
  listPublished(): Promise<PublishedCourse[]>;
  getById(courseId: string): Promise<PublishedCourse | null>;
}
