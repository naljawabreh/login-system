import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ email }).exec();
  }

  async create(username: string, email: string, password: string, firstName: string, lastName: string, phoneNumber: string, birthdate: Date, language?: string, photo?: string): Promise<User> {
    const user = new this.userModel({ username, email, password, firstName, lastName, phoneNumber, birthdate, language, photo });
    return user.save();
  }
}
