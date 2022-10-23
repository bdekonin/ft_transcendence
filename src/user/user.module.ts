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

@Module({
	imports: [
		UserModule,
		TypeOrmModule.forFeature([User, GameHistory, Friend]),
		forwardRef(() => AppModule)
	],
	controllers: [
		UserController,
		FriendController
	],
	providers: [
		UserService,
		FriendService
	]
})
export class UserModule {}