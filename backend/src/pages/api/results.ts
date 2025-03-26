import { Router } from 'express';
import Result from '../../models/Result';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

// 保存测验成绩
router.post('/', authMiddleware, async (req, res) => {
  try {
    const result = new Result(req.body);
    await result.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: '保存成绩失败' });
  }
});

// 获取测验成绩
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const results = await Result.find({ userId: req.params.userId });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: '获取成绩失败' });
  }
});

export default router;