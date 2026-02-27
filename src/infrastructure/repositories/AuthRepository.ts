export class AuthRepository {
  async findUserByEmail(email: string) {
    if (email === 'cjbisbicus@gmail.com') {
      return {
        id: '1',
        email: 'cjbisbicus@gmail.com',
        passwordHash: 'admin123',
        role: 'ADMIN'
      };
    }
    return null;
  }
}