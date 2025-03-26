import { Router, Request, Response } from 'express';
import Quiz from '../../models/Quiz';
import authenticateToken from '../../middleware/auth';

const router = Router();

// 获取测验列表
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const quizzes = await Quiz.find().populate('courseId');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: '获取测验列表失败' });
  }
});

// 获取单个测验
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('courseId');
    if (!quiz) {
      return res.status(404).json({ message: '测验不存在' });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: '获取测验失败' });
  }
});

// 创建测验
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    res.status(400).json({ message: '创建测验失败' });
  }
});

// 更新测验
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!quiz) {
      return res.status(404).json({ message: '测验不存在' });
    }
    res.json(quiz);
  } catch (error) {
    res.status(400).json({ message: '更新测验失败' });
  }
});

// 删除测验
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: '测验不存在' });
    }
    res.json({ message: '测验删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除测验失败' });
  }
});

export default router;