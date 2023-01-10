import { CacheModule, forwardRef, Global, Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppModule } from "src/app.module";
import { AuthService } from "src/auth/auth.service";
import { ChatController } from "src/chat/chat.controller";
import { ChatModule } from "src/chat/chat.module";
import { ChatService } from "src/chat/chat.service";
import { Chat } from "src/entities/Chat.entity";
import { GameHistory } from "src/entities/GameHistory.entity";
import { Message } from "src/entities/Message.entity";
import { User } from "src/entities/User.entity";
import { GameModule } from "src/game/game.module";
import { GameService } from "src/game/game.service";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";
import { socketGateway } from "./socket.gateway";

@Global()
@Module({
	imports: [
		UserModule, ChatModule, GameModule,
		TypeOrmModule.forFeature([Chat, User, Message, GameHistory]),
		forwardRef(() => AppModule),
		CacheModule.register(),
	],
	controllers: [],
	providers: [
		socketGateway,
		{
			provide: 'AUTH_SERVICE',
			useClass: AuthService,
		},
		JwtService,
		UserService,
		ChatService,
		GameService,
	],
	exports: [socketGateway],
})
export class socketModule {}