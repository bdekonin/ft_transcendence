import { CacheModule, forwardRef, Module } from "@nestjs/common";
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
import { TwoFAController } from "src/auth/2fa/TwoFA.controller";
import { ChatService } from "src/chat/chat.service";
import { ChatModule } from "src/chat/chat.module";
import { ChatController } from "src/chat/chat.controller";
import { Message } from "src/entities/Message.entity";
import { Chat } from "src/entities/Chat.entity";
import { AuthModule } from "src/auth/auth.module";

@Module({
	imports: [
		UserModule,
		TypeOrmModule.forFeature([User, GameHistory, Friend, Membership, Chat, Message]),
		forwardRef(() => AppModule),
		MulterModule.registerAsync({ useFactory: () => ({ dest: './uploads' }) }),
		CacheModule.register(),
	],
	controllers: [
		UserController,
		MembershipController,
		SocialController,
		TwoFAController,
		ChatController,
	],
	providers: [
		{
			provide: 'AUTH_SERVICE',
			useClass: AuthService,
		},
		UserService,
		JwtService,
		MembershipService,
		SocialService,
		ChatService,
	]
})
export class UserModule {}