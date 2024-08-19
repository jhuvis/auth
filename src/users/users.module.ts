import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EncryptionModule } from 'src/encryption/encryption.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    PrismaModule,
    EncryptionModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  exports: [UserService],
})
export class UsersModule {}
