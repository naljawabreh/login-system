import { Document } from 'mongoose';

export interface User extends Document {
  email: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  registrationDate: Date;
  language?: string;
  photoURL?: string;
  isResident: boolean;
}
