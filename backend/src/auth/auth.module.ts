import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from 'src/entities/Friend.entity';
import { GameHistory } from 'src/entities/GameHistory.entity';
import { User } from 'src/entities/User.entity';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { TwoFAController } from './2fa/TwoFA.controller';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FortyTwoStrategy } from './utils/FortyTwoStrategy';
import { GoogleStrategy } from './utils/GoogleStrategy';
import { JwtStrategy } from './utils/jwt.strategy';

@Module({
	imports: [
		PassportModule,
		UserModule, TypeOrmModule.forFeature([User, GameHistory, Friend]),
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '2h' }, /* 60 minutes */
		}),
	],
	controllers: [AuthController, TwoFAController],
	providers: [
		{
			provide: 'AUTH_SERVICE',
			useClass: AuthService,
		},
		UserService, FortyTwoStrategy, GoogleStrategy, AuthService, JwtStrategy,
	],
})
export class AuthModule {}