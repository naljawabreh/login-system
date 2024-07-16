import { Document } from 'mongoose';

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  birthdate: Date;
  registrationDate: Date;
  language?: string;
  photo?: string;
}
