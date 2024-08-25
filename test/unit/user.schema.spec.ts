import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { User } from 'src/users/schemas/user.schema';

describe('User Schema', () => {
  let userModel: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken(User.name),
          useValue: Model,
        },
      ],
    }).compile();

    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should hash password before saving', async () => {
    const user = new userModel({
      email: 'test@example.com',
      password: 'plainPassword',
    });

    jest.spyOn(user, 'save').mockImplementation(async function () {
      this.password = 'hashedPassword';
      return this;
    });

    await user.save();

    expect(user.password).toBe('hashedPassword');
  });

  it('should return true if passwords match', async () => {
    const user = new userModel({
      email: 'test@example.com',
      password: 'hashedPassword',
    });

    user.comparePassword = jest.fn().mockReturnValue(true);

    const isMatch = user.comparePassword('plainPassword');

    expect(isMatch).toBe(true);
  });

  it('should return false if passwords do not match', async () => {
    const user = new userModel({
      email: 'test@example.com',
      password: 'hashedPassword',
    });

    user.comparePassword = jest.fn().mockReturnValue(false);

    const isMatch = user.comparePassword('wrongPassword');

    expect(isMatch).toBe(false);
  });
});
