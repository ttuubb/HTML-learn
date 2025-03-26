import { Request as ExpressRequest, Response } from 'express';
import Course from '../../models/Course';

interface CustomRequest extends ExpressRequest {
  user?: {
    _id: string;
    name: string;
  };
}

export async function getCourses(req: CustomRequest, res: Response): Promise<void> {
  try {
    const courses = await Course.find().populate('author', 'name');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: '获取课程列表失败' });
  }
}

export async function createCourse(req: CustomRequest, res: Response): Promise<void> {
  try {
    const { title, description, content } = req.body;
    const course = new Course({
      title,
      description,
      content,
      author: req.user?._id
    });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: '创建课程失败' });
  }
}

export async function updateCourse(req: CustomRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { title, description, content } = req.body;
    const course = await Course.findByIdAndUpdate(
      id,
      { title, description, content },
      { new: true }
    );
    if (!course) {
      res.status(404).json({ message: '课程不存在' });
      return;
    }
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: '更新课程失败' });
  }
}

export async function deleteCourse(req: CustomRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      res.status(404).json({ message: '课程不存在' });
      return;
    }
    res.json({ message: '课程删除成功' });
  } catch (error) {
    res.status(400).json({ message: '删除课程失败' });
  }
}