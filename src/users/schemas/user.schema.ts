import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Query } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User &
  Document & {
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

  @Prop({ required: true, default: 'en' })
  language: string;

  @Prop({ required: false })
  photoURL: string;

  @Prop({ required: true, default: false })
  isResident: boolean;

  @Prop({ required: true, default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ isDeleted: 1 });

// Define a function to apply the filter
function filterDeleted(this: Query<any, any>) {
  this.where({ isDeleted: false });
  return this;
}

// Apply the filter in the pre-find middleware
UserSchema.pre<Query<any, any>>(/^find/, function (next) {
  filterDeleted.call(this);
  next();
});

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

UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export { UserSchema };
