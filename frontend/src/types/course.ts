export interface Course {
  _id: string;
  title: string;
  description: string;
  content: string;
  author: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseData {
  title: string;
  description: string;
  content: string;
}

export interface UpdateCourseData extends CreateCourseData {
  id: string;
}