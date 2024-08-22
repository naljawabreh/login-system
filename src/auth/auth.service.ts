import { Injectable, UnauthorizedException, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BaseUserDto, FullUserDto, LoginResponseDto, registrationResponseDto } from './dto/user.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

    async register(registerDto: RegisterDto, language: string): Promise<registrationResponseDto> {
      this.logger.log(`AuthService: register user with identifier: ${registerDto.email}`);
      const { email, password, firstName, lastName, phoneNumber, isResident } = registerDto;

      const user = await this.usersService.create(
        email, password, firstName, lastName, phoneNumber, isResident, language,
      );
    
    await this.usersService.generateOtp(user);

    const accessToken = this.jwtService.sign(
      { id: user._id, userName: user.firstName, registrationState: user.registrationState },
      { expiresIn: '1d' },
    );

    await user.save();

    return { accessToken };
  }

  async regenerateOtp(userMail: string): Promise<registrationResponseDto> {
    this.logger.log(`AuthService: regenerateOtp user with identifier: ${userMail}`);
    const user = await this.usersService.findOneByEmail(userMail);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersService.generateOtp(user);

    const accessToken = this.jwtService.sign(
      { id: user._id, userName: user.firstName, registrationState: user.registrationState },
      { expiresIn: '1d' },
    );

    await user.save();
    
    return { accessToken };
  }

  async validateUser(loginDto: LoginDto): Promise<UserDocument | null> {
    this.logger.log(`AuthService: Validating user with identifier: ${loginDto.identifier}`);
    const user = await this.usersService.findOneByEmailOrPhoneNumber(loginDto.identifier);
    if (user) {
      const isMatch = await user.comparePassword(loginDto.password);
      if (isMatch) {
        this.logger.log(`AuthService: Password matched for user: ${user.email}`);
        return user;
      } else {
        this.logger.warn(`Password mismatch for user: ${user.email}`);
      }
    } else {
      this.logger.warn(`User not found with identifier: ${loginDto.identifier}`);
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    this.logger.log(`AuthService: Attempting login for identifier: ${loginDto.identifier}`);
    const user = await this.validateUser(loginDto);
    if (!user) {
      this.logger.warn(`Invalid credentials for identifier: ${loginDto.identifier}`);
      throw new UnauthorizedException('Invalid credentials');
    }
  
    const accessToken = this.jwtService.sign(
      { id: user._id, userName: user.firstName, registrationState: user.registrationState },
      { expiresIn: this.configService.get<string | number>('JWT_EXPIRES') },
    );
  
    await user.save();
  
    this.logger.log(`AuthService: User logged in: ${user.email}`);
  
    if (user.registrationState === 'pending') {
      await this.usersService.generateOtp(user);
      const fullUser: FullUserDto = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        isResident: user.isResident,
        photoURL: user.photoURL,
        registrationState: user.registrationState,
      };
      return {
        accessToken,
        user: fullUser,
      };
    }
  
    const fullUser: FullUserDto = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      isResident: user.isResident,
      photoURL: user.photoURL,
      registrationState: user.registrationState,
    };
  
    return {
      accessToken,
      user: fullUser,
    };
  }

  async verifyOtp(userMail: string, otp: string): Promise<LoginResponseDto> {
    this.logger.log(`AuthService: verify OTP for a user with mail: ${userMail}`);
    const user = await this.usersService.verifyOtp(userMail, otp)
    const userAll = await this.usersService.findOneByEmail(userMail)
    
    const accessToken = this.jwtService.sign(
      { id: userAll._id, userName: user.firstName, registrationState: user.registrationState },
      { expiresIn: this.configService.get<string | number>('JWT_EXPIRES') },
    );
  
    await userAll.save();

    const fullUser: FullUserDto = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      isResident: user.isResident,
      photoURL: user.photoURL,
      registrationState: user.registrationState,
    };

    return {
      accessToken,
      user: fullUser,
    };
  }

  async findByEmailSendOTP(userMail: string): Promise<void> {
    this.logger.log(`AuthService: findByEmailSendOTP for a user with mail: ${userMail}`);
    const user = await this.usersService.findOneByEmail(userMail);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersService.generateOtp(user);
  }

  async findEmailValidateOTP(userMail: string, otp: string): Promise<LoginResponseDto> {
    this.logger.log(`AuthService: findEmailValidateOTP for a user with mail: ${userMail}`);
    const user = await this.usersService.findOneByEmail(userMail);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.verifyOtp(user.id, otp);
  }

  async findUserValidateOTP(userMail: string, otp: string): Promise<UserDocument> {
    this.logger.log(`AuthService: findUserValidateOTP for a user with mail: ${userMail}`);
    const user = await this.usersService.findOneByEmail(userMail);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    if (!this.usersService.verifyOtp(userMail, otp)) {
      throw new NotFoundException('Verification issue');
    }

   return user;
  }

  async logout(user: UserDocument) {
    this.logger.log(`AuthService: logout for a user with mail: ${user.email}`);
    await this.usersService.invalidateTokensForUser(user.id);
  }

  //

  async updateUser(userMail: string, updateUserDto: UpdateUserDto): Promise<FullUserDto> {
    this.logger.log(`AuthService: updateUser for a user with mail: ${userMail}`);
    const user = await this.usersService.findOneByEmail(userMail);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update only the fields that are passed
    if (updateUserDto.firstName) {
      user.firstName = updateUserDto.firstName;
    }

    if (updateUserDto.lastName) {
      user.lastName = updateUserDto.lastName;
    }

    if (updateUserDto.phoneNumber) {
      const existingUserWithPhoneNumber = await this.usersService.findOneByPhoneNumber(updateUserDto.phoneNumber);
      
      // Ensure the found user is not the same as the current user
      if (existingUserWithPhoneNumber && existingUserWithPhoneNumber.email !== userMail) {
        throw new ConflictException('Phone number is already in use by another user');
      }
      
      user.phoneNumber = updateUserDto.phoneNumber;
    }

    if (updateUserDto.isResident !== undefined) {
      user.isResident = updateUserDto.isResident;
    }

    await user.save();

    const fullUser: FullUserDto = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      isResident: user.isResident,
      photoURL: user.photoURL,
      registrationState: user.registrationState,
    };
    
    return fullUser;
  }
  
}
