import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  private accessTokenSecret = 'dev-secret';
  private refreshTokenSecret = 'dev-refresh-secret';

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async generateTokens(user: any) {
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      ...(user.role ? { role: user.role } : {
        tenantId: user.tenant_id,
        accountType: user.account_type,
      }),
    };

    const accessToken = jwt.sign(payload, this.accessTokenSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, this.refreshTokenSecret, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<any> {
    return jwt.verify(token, this.accessTokenSecret);
  }

  async loginUser(email: string, password: string) {
    // Mock login
    if (email === 'admin@escritorio.com' && password === '123456') {
      const mockUser = {
        id: 'user-1',
        email: 'admin@escritorio.com',
        name: 'Dr. Administrador',
        account_type: 'GERENCIAL',
        tenant_id: 'tenant-1',
        is_active: true,
      };

      const tokens = await this.generateTokens(mockUser);
      return { user: mockUser, tokens };
    }

    throw new Error('Invalid credentials');
  }

  async loginAdmin(email: string, password: string) {
    // Mock admin login
    if (email === 'admin@legalsaas.com' && password === 'admin123') {
      const mockAdmin = {
        id: 'admin-1',
        email: 'admin@legalsaas.com',
        name: 'Administrator',
        role: 'super_admin',
        is_active: true,
      };

      const tokens = await this.generateTokens(mockAdmin);
      return { user: mockAdmin, tokens };
    }

    throw new Error('Invalid admin credentials');
  }

  async registerUser(email: string, password: string, name: string, key: string) {
    // Mock registration
    const mockUser = {
      id: 'user-' + Date.now(),
      email,
      name,
      account_type: 'GERENCIAL',
      tenant_id: 'tenant-' + Date.now(),
      is_active: true,
    };

    const tokens = await this.generateTokens(mockUser);
    return { user: mockUser, tokens, isNewTenant: true };
  }
}

export const authService = new AuthService();