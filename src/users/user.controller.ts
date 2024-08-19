import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDTO, LoginUserDTO } from './dto/create-user.dto';
import { AuthGuard } from 'src/guards/auth.guards';
import { User } from 'src/decorators/users.decorator';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of users returned successfully.',
  })
  async getUsers() {
    return await this.userService.getUsers();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDTO })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. The user already exists.',
  })
  async createUser(@Body() body: CreateUserDTO) {
    const { name, email, password } = body;
    return await this.userService.createUser(name, email, password);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User data returned successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUsersById(@Param('id') id: number) {
    return await this.userService.getUsersById(id);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginUserDTO })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Token returned.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found or invalid credentials.',
  })
  async login(@Body() body: LoginUserDTO) {
    const { email, password } = body;
    return this.userService.login(email, password);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post('update')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiBody({ type: CreateUserDTO })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Token missing or invalid.',
  })
  async updateMyUser(@User() user, @Body() body: CreateUserDTO) {
    const { email: newEmail, name: newName, password: newPassword } = body;
    return this.userService.updateUser(user.id, newEmail, newName, newPassword);
  }
}
