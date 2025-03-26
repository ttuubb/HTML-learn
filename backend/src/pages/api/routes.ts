import { Router } from 'express';
import { getCourses, createCourse, updateCourse, deleteCourse } from './courses';
import { authenticateToken } from '../../middleware/auth';
import { Request, Response, NextFunction } from 'express';

const handler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.send('Success');
  } catch (error) {
    next(error);
  }
};

const router = Router();

// 课程管理路由
router.get('/courses', getCourses);
router.post('/courses', authenticateToken, createCourse);
router.put('/courses/:id', authenticateToken, updateCourse);
router.delete('/courses/:id', authenticateToken, deleteCourse);

export default router;