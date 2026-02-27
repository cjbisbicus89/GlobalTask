import { Router } from 'express';
import { AuthService } from '@/services/AuthService';

const router = Router();
const authService = new AuthService();

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    res.json({ success: true, ...data });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
});

export default router;