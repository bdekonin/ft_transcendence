import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppModule } from "src/app.module";
import { Friend } from "src/entities/Friend.entity";
import { GameHistory } from "src/entities/GameHistory.entity";
import { User } from "src/entities/User.entity";
import { FriendController } from "./friend/friend.controller";
import { FriendService } from "./friend/friend.service";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { GameController } from './game/game.controller';
import { GameService } from './game/game.service';
import { MembershipController } from './membership/membership.controller';
import { MembershipService } from './membership/membership.service';
import { Membership } from "src/entities/Membership.entity";

@Module({
	imports: [
		UserModule,
		TypeOrmModule.forFeature([User, GameHistory, Friend, Membership]),
		forwardRef(() => AppModule)
	],
	controllers: [
		UserController,
		FriendController,
		GameController,
		MembershipController
	],
	providers: [
		UserService,
		FriendService,
		GameService,
		MembershipService
	]
})
export class UserModule {}