import jwt from 'jsonwebtoken';
import { AuthRepository } from '../infrastructure/repositories/AuthRepository';

export class AuthService {
  private authRepository = new AuthRepository();
  private readonly secret = process.env.JWT_SECRET || 'globaltask_2026';

  async login(email: string, pass: string) {
    const user = await this.authRepository.findUserByEmail(email);
    if (user && user.passwordHash === pass) {
      const token = jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        this.secret,
        { expiresIn: '8h' }
      );
      return { token, user: { email: user.email, role: user.role } };
    }
    throw new Error('Credenciales inválidas');
  }
}