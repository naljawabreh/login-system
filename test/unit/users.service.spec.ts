import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/users/users.service';
import { User } from '../../src/users/schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

describe('UsersService', () => {
  let usersService: UsersService;
  let userModel: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  describe('createUser', () => {
    it('should successfully create a user', async () => {
      const user = { 
        _id: '1111111111111111',
        email: 'test@example.com',
        password: 'strongPassword123',
        firstName: 'Amal',
        lastName: 'Salameh',
        phoneNumber: '00970598632932',
        isResident: false,
    } as any;
    
      const createUserDto = { email: 'test@example.com', password: 'strongPassword123' };

      jest.spyOn(userModel, 'create').mockResolvedValue(user);

      const result = await usersService.createUser(createUserDto);

      expect(userModel.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(user);
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user if found', async () => {
      const user = { id: '1', email: 'test@example.com' } as User;

      jest.spyOn(userModel, 'findOne').mockResolvedValue(user);

      const result = await usersService.findOneByEmail('test@example.com');

      expect(userModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(result).toEqual(user);
    });

    it('should return null if no user is found', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

      const result = await usersService.findOneByEmail('unknown@example.com');

      expect(userModel.findOne).toHaveBeenCalledWith({ email: 'unknown@example.com' });
      expect(result).toBeNull();
    });
  });
});
