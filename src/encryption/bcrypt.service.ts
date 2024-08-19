import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  private SALT = 8;

  hash(rawPassword: string) {
    return bcrypt.hashSync(rawPassword, this.SALT);
  }

  compare(password: string, hashPassword: string) {
    return bcrypt.compareSync(password, hashPassword);
  }
}
