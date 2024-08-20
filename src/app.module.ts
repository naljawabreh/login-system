import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
// import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { IsEmailUniqueConstraint } from './auth/validators/is-email-unique.validator';
import { IsPhoneNumberUniqueConstraint } from './auth/validators/is-phone-number-unique.validator';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule,
    UsersModule,
  ],
  providers: [
    IsEmailUniqueConstraint, 
    IsPhoneNumberUniqueConstraint,
  ],
})
export class AppModule {}


// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//       load: [configuration],
//     }),
//     MongooseModule.forRootAsync({
//       imports: [ConfigModule],
//       useFactory: (configService: ConfigService) => ({
//         uri: configService.get<string>('database.uri'),
//       }),
//       inject: [ConfigService],
//     }),
//     AuthModule,
//     UsersModule,
//   ],
// })