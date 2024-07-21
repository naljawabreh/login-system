import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOneByEmail(email: string): Promise<UserDocument | undefined> {
    return this.userModel.findOne({ email }).exec();
  }

  async findOneById(id: string): Promise<UserDocument | undefined> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(username: string, email: string, password: string, firstName: string, lastName: string, phoneNumber: string, birthdate: Date, language?: string, photo?: string): Promise<UserDocument> {
    const user = new this.userModel({ username, email, password, firstName, lastName, phoneNumber, birthdate, language, photo });
    return user.save();
  }

  async generateOtp(user: UserDocument): Promise<void> {
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // SMS service integration for OTP
    console.log(`OTP for user ${user.username} is ${otp}`);
  }

  async verifyOtp(email: string, otp: string): Promise<UserDocument> {
    const user = await this.findOneByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.otp === otp && user.otpExpires > new Date()) {
      user.registrationState = 'completed';
      user.otp = undefined;
      user.otpExpires = undefined;
      return user.save();
    } else {
      throw new Error('Invalid or expired OTP');
    }
  }
}
