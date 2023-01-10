import { CacheModule, forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppModule } from "src/app.module";
import { Friend } from "src/entities/Friend.entity";
import { GameHistory } from "src/entities/GameHistory.entity";
import { User } from "src/entities/User.entity";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { MulterModule } from "@nestjs/platform-express";
import { SocialService } from "src/social/social.service";
import { AuthService } from "src/auth/auth.service";
import { JwtService } from '@nestjs/jwt';
import { ChatService } from "src/chat/chat.service";
import { Message } from "src/entities/Message.entity";
import { Chat } from "src/entities/Chat.entity";

@Module({
	imports: [
		UserModule,
		TypeOrmModule.forFeature([User, GameHistory, Friend, Chat, Message]),
		forwardRef(() => AppModule),
		MulterModule.registerAsync({ useFactory: () => ({ dest: './uploads' }) }),
		CacheModule.register(),
	],
	controllers: [
		UserController,
	],
	providers: [
		{
			provide: 'AUTH_SERVICE',
			useClass: AuthService,
		},
		UserService,
		JwtService,
		SocialService,
		ChatService,
	]
})
export class UserModule {}