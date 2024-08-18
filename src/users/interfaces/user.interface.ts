import { Document } from 'mongoose';

export interface User extends Document {
  username?: string;
  email: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  birthdate?: Date;
  registrationDate: Date;
  language?: string;
  photoURL?: string;
  isResident: boolean;
}
