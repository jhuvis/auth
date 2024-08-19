import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserModel } from './user.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { BcryptService } from 'src/encryption/bcrypt.service';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  private EXPIRES = '15 minutes';
  private ISSUER = 'Auth';
  private AUDIENCE = 'users';

  constructor(
    private readonly prisma: PrismaService,
    private readonly crypt: BcryptService,
    private readonly jwtService: JwtService,
  ) {}

  async getUsers() {
    return await this.prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });
  }

  async createUser(
    name: string,
    email: string,
    password: string,
  ): Promise<void> {
    const existsUser = await this.prisma.user.findFirst({
      where: { email: email },
    });

    if (existsUser) {
      throw new BadRequestException('Something bad happened', {
        cause: new Error(),
        description: 'Email already in use',
      });
    }

    const user = new UserModel();
    user.name = name;
    user.email = email;
    if (!password) {
      user.setPassword();
      // sendPasswordToEmail(user.password);
      user.password = this.crypt.hash(user.password);
    } else {
      user.password = this.crypt.hash(password);
    }

    await this.prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        createAt: user.createdAt,
      },
    });
    console.log({ user });
  }

  async getUsersById(id: number) {
    return await this.prisma.user.findUnique({
      where: { id: id },
    });
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.prisma.user.findFirst({
      where: { email: email },
    });

    if (!user) {
      throw new NotFoundException();
    }

    const validPassword = await this.crypt.compare(password, user.password);

    if (!validPassword) {
      throw new NotFoundException();
    }

    return this.createToken(user);
  }

  private createToken(user: User): string {
    const token = this.jwtService.sign(
      {
        name: user.name,
        email: user.email,
      },
      {
        subject: String(user.id),
        expiresIn: this.EXPIRES,
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
      },
    );

    return token;
  }

  checkToken(token: string) {
    try {
      const data = this.jwtService.verify(token, {
        audience: this.AUDIENCE,
        issuer: this.ISSUER,
      });

      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateUser(
    userId: number,
    name: string,
    email: string,
    password?: string,
  ): Promise<void> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: email,
        NOT: {
          id: userId,
        },
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use', {
        cause: new Error(
          'The provided email is already associated with another account.',
        ),
      });
    }

    const updateData: Partial<User> = {
      name: name,
      email: email,
    };

    if (password) {
      updateData.password = this.crypt.hash(password);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    console.log('User updated successfully:', updateData);
  }
}
