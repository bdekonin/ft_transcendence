import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppModule } from "src/app.module";
import { Friend } from "src/entities/Friend.entity";
import { GameHistory } from "src/entities/GameHistory.entity";
import { User } from "src/entities/User.entity";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { MembershipController } from './membership/membership.controller';
import { MembershipService } from './membership/membership.service';
import { Membership } from "src/entities/Membership.entity";
import { MulterModule } from "@nestjs/platform-express";
import { SocialController } from "src/social/social.controller";
import { SocialService } from "src/social/social.service";
import { AuthService } from "src/auth/auth.service";
import { JwtService } from '@nestjs/jwt';

@Module({
	imports: [
		UserModule,
		TypeOrmModule.forFeature([User, GameHistory, Friend, Membership]),
		forwardRef(() => AppModule),
		MulterModule.registerAsync({ useFactory: () => ({ dest: './uploads' }) }),
	],
	controllers: [
		UserController,
		MembershipController,
		SocialController
	],
	providers: [
		{
			provide: 'AUTH_SERVICE',
			useClass: AuthService,
		},
		JwtService,
		UserService,
		MembershipService,
		SocialService,
	]
})
export class UserModule {}