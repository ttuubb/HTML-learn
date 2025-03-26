import { Request, Response, NextFunction } from 'express';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  // 实现认证逻辑
  next();
};

export default authenticateToken;