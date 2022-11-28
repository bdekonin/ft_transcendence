import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Friend } from "src/entities/Friend.entity";
import { GameHistory } from "src/entities/GameHistory.entity";
import { Membership } from "src/entities/Membership.entity";
import { User } from "src/entities/User.entity";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { FortyTwoStrategy } from "./utils/FortyTwoStrategy";
import { GoogleStrategy } from "./utils/GoogleStrategy";
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from "./utils/constants";
import { SessionSerializer } from "./utils/Serializer";

@Module({
	imports: [UserModule, TypeOrmModule.forFeature([User, Membership, GameHistory, Friend]),
	JwtModule.register({
		secret: jwtConstants.secret,
		signOptions: { expiresIn: '1d' },
	}),
	],
	controllers: [AuthController],
	providers: [
		UserService, FortyTwoStrategy, GoogleStrategy, AuthService, SessionSerializer,
		{
			provide: 'AUTH_SERVICE',
			useClass: AuthService,
		},
	],
})
export class AuthModule {}