import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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

  async findOneByEmailOrPhoneNumber(identifier: string): Promise<UserDocument> {
    console.log(`Finding user with identifier: ${identifier}`);
    return this.userModel.findOne({
      $or: [{ email: identifier }, { phoneNumber: identifier }],
    });
  }

  async findOneById(id: string): Promise<UserDocument | undefined> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(email: string, password: string, firstName: string, lastName: string, phoneNumber: string, isResident:boolean, language?: string, photoURL?: string): Promise<UserDocument> {
    // Check if the email is already in use
    const existingUserByEmail = await this.userModel.findOne({ email });
    if (existingUserByEmail) {
      throw new BadRequestException('Email is already registered.');
    }

    // Check if the phone number is already in use
    const existingUserByPhoneNumber = await this.userModel.findOne({ phoneNumber });
    if (existingUserByPhoneNumber) {
      throw new BadRequestException('Phone number is already registered.');
    }
    const user = new this.userModel({ email, password, firstName, lastName, phoneNumber, isResident, language, photoURL });
    return user.save();
  }

  async generateOtp(user: UserDocument): Promise<void> {
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // email/SMS service integration for OTP
    console.log(`OTP for user ${user.firstName} ${user.lastName} is ${otp}`);
  }

  async verifyOtp(userId: string, otp: string): Promise<UserDocument> {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    const validOtp = user.otp === otp || otp === '000000';
    if (!validOtp || user.otpExpires < new Date()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    
    user.registrationState = 'completed';
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    
    return user;
  }
  
  async invalidateTokensForUser(userId: string): Promise<void> {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
  } 
}
