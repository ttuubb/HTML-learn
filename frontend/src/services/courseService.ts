import axios from 'axios';
import { Course, CreateCourseData, UpdateCourseData } from '../types/course';

const API_URL = '/api';

export const courseService = {
  async getCourses(): Promise<Course[]> {
    const response = await axios.get(`${API_URL}/courses`);
    return response.data;
  },

  async createCourse(data: CreateCourseData): Promise<Course> {
    const response = await axios.post(`${API_URL}/courses`, data);
    return response.data;
  },

  async updateCourse(data: UpdateCourseData): Promise<Course> {
    const response = await axios.put(`${API_URL}/courses/${data.id}`, data);
    return response.data;
  },

  async deleteCourse(id: string): Promise<void> {
    await axios.delete(`${API_URL}/courses/${id}`);
  }
};