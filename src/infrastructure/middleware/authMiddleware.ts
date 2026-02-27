import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Acceso denegado. Token no proporcionado.' 
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'globaltask_2026';
    const decoded = jwt.verify(token, secret);
    (req as any).user = decoded;
    next(); 
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      error: 'Token inválido o expirado.' 
    });
  }
};