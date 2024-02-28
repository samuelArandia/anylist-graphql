import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [AuthResolver, AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule, JwtModule],
  imports: [ 
    ConfigModule,
    UsersModule, 
    PassportModule.register({ defaultStrategy: 'jwt', }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: ( configService: ConfigService ) => ({ 
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '4h' },
      }),
    }),
  ],
}) 
export class AuthModule {}
