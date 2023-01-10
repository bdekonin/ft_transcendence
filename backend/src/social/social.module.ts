import { Module, forwardRef, CacheModule } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppModule } from "src/app.module";
import { AuthService } from "src/auth/auth.service";
import { ChatController } from "src/chat/chat.controller";
import { ChatModule } from "src/chat/chat.module";
import { ChatService } from "src/chat/chat.service";
import { Chat } from "src/entities/Chat.entity";
import { Friend } from "src/entities/Friend.entity";
import { Message } from "src/entities/Message.entity";
import { User } from "src/entities/User.entity";
import { UserController } from "src/user/user.controller";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";
import { SocialController } from "./social.controller";
import { SocialService } from "./social.service";

@Module({
	imports: [
		forwardRef(() => AppModule),
		UserModule, SocialModule, ChatModule,
		TypeOrmModule.forFeature([Chat, User, Message, Friend]),
		CacheModule.register(),
	],
	controllers: [
		SocialController,
	],
	providers: [
		{
			provide: 'AUTH_SERVICE',
			useClass: AuthService,
		},
		JwtService,
		UserService,
		SocialService,
		ChatService,
	],
})
export class SocialModule {}