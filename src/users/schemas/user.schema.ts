import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document & {
  comparePassword: (candidatePassword: string) => Promise<boolean>;
};

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;
  
  // create enum for the var
  @Prop({ required: true, enum: ['pending', 'completed'], default: 'pending' })
  registrationState: string;

  comparePassword: (candidatePassword: string) => Promise<boolean>;

  @Prop()
  otp: string;

  @Prop()
  otpExpires: Date;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ required: true, default: Date.now })
  registrationDate: Date;

  @Prop({ required: true, default: "en" })
  language: string;

  @Prop({ required: false })
  photoURL: string;
  
  @Prop({ required: true, default: false })
  isResident: boolean;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', async function (next) {
  const user = this as UserDocument;

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export { UserSchema };