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
import { SocialService } from './social/social.service';
import { SocialController } from './social/social.controller';
import { MulterModule } from "@nestjs/platform-express";

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
		UserService,
		MembershipService,
		SocialService
	]
})
export class UserModule {}