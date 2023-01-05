import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Friend } from "src/entities/Friend.entity";
import { GameHistory } from "src/entities/GameHistory.entity";
import { User } from "src/entities/User.entity";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { FortyTwoStrategy } from "./utils/FortyTwoStrategy";
import { GoogleStrategy } from "./utils/GoogleStrategy";
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from "./utils/constants";
import { JwtStrategy } from "./utils/jwt.strategy";
import { PassportModule } from "@nestjs/passport";

@Module({
	imports: [
		PassportModule,
		UserModule, TypeOrmModule.forFeature([User, GameHistory, Friend]),
		JwtModule.register({
			secret: jwtConstants.secret,
			signOptions: { expiresIn: '2h' }, /* 60 minutes */
		}),
	],
	controllers: [AuthController],
	providers: [
		{
			provide: 'AUTH_SERVICE',
			useClass: AuthService,
		},
		UserService, FortyTwoStrategy, GoogleStrategy, AuthService, JwtStrategy,
	],
})
export class AuthModule {}