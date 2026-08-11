import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

const THEMES = ['slate', 'blue', 'emerald', 'amber', 'rose'];

function hashPin(pin: string, salt: string) {
  return crypto.scryptSync(pin, salt, 32).toString('hex');
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: SignupDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const salt = crypto.randomBytes(8).toString('hex');
    const user = await this.prisma.user.create({
      data: {
        companyName: dto.companyName.trim(),
        email,
        pinSalt: salt,
        pinHash: hashPin(dto.pin, salt),
      },
    });

    return { user: this.sanitizeUser(user), token: await this.issueToken(user.id) };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.pinHash !== hashPin(dto.pin, user.pinSalt)) {
      throw new UnauthorizedException('Invalid email or PIN');
    }

    return { user: this.sanitizeUser(user), token: await this.issueToken(user.id) };
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { authToken: null } });
    return { success: true };
  }

  async validateToken(token?: string | null) {
    if (!token) return null;
    return this.prisma.user.findFirst({ where: { authToken: token } });
  }

  private async issueToken(userId: string) {
    const token = crypto.randomBytes(32).toString('hex');
    await this.prisma.user.update({ where: { id: userId }, data: { authToken: token } });
    return token;
  }

  async updateTheme(userId: string, theme: string) {
    if (!THEMES.includes(theme)) {
      throw new BadRequestException('Invalid theme');
    }
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { theme },
    });
    return { user: this.sanitizeUser(user) };
  }

  sanitizeUser(user: User) {
    return {
      id: user.id,
      companyName: user.companyName,
      email: user.email,
      theme: user.theme,
    };
  }
}
