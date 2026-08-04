export interface PublishedUnit {
  id: string;
  courseId: string;
  orderIndex: number;
  title: string;
  description: string;
}

export interface UnitRepositoryPort {
  listForCourse(courseId: string): Promise<PublishedUnit[]>;
  getById(unitId: string): Promise<PublishedUnit | null>;
}
