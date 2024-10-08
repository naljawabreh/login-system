import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransportModule } from './transport/transport.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      envFilePath: process.env.NODE_ENV === 'daemon' ? '.env.daemon' : '.env.dev',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule,
    UsersModule,
    TransportModule,
  ],
})
export class AppModule {}
