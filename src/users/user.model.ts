export class UserModel {
  public password: string;
  public name: string;
  public email: string;
  public readonly createdAt: Date;

  constructor() {
    this.createdAt = new Date();
  }

  setPassword(): string {
    this.password = Math.ceil(Math.random() * 1).toString();
    return this.password;
  }
}
