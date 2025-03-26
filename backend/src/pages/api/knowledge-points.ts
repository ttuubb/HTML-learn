import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import KnowledgePoint from '../../models/KnowledgePoint';
import authenticateToken from '../../middleware/auth';

const router = Router();

const getKnowledgePoints: RequestHandler = async (req, res, next) => {
  try {
    const knowledgePoints = await KnowledgePoint.find();
    res.json(knowledgePoints);
  } catch (error) {
    next(error);
  }
};

const getKnowledgePointById: RequestHandler = async (req, res, next) => {
  try {
    const knowledgePoint = await KnowledgePoint.findById(req.params.id);
    if (!knowledgePoint) {
      return res.status(404).json({ message: '知识点不存在' });
    }
    res.json(knowledgePoint);
  } catch (error) {
    next(error);
  }
};

const createKnowledgePoint: RequestHandler = async (req, res, next) => {
  try {
    const knowledgePoint = new KnowledgePoint(req.body);
    await knowledgePoint.save();
    res.status(201).json(knowledgePoint);
  } catch (error) {
    next(error);
  }
};

const updateKnowledgePoint: RequestHandler = async (req, res, next) => {
  try {
    const knowledgePoint = await KnowledgePoint.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!knowledgePoint) {
      return res.status(404).json({ message: '知识点不存在' });
    }
    res.json(knowledgePoint);
  } catch (error) {
    next(error);
  }
};

const deleteKnowledgePoint: RequestHandler = async (req, res, next) => {
  try {
    const knowledgePoint = await KnowledgePoint.findByIdAndDelete(req.params.id);
    if (!knowledgePoint) {
      return res.status(404).json({ message: '知识点不存在' });
    }
    res.json({ message: '知识点删除成功' });
  } catch (error) {
    next(error);
  }
};

router.get('/', getKnowledgePoints);
router.get('/:id', getKnowledgePointById);
router.post('/', authenticateToken, createKnowledgePoint);
router.put('/:id', authenticateToken, updateKnowledgePoint);
router.delete('/:id', authenticateToken, deleteKnowledgePoint);

export default router;