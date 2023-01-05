import { CacheModule, forwardRef, ForwardReference, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from 'src/app.module';
import { AuthService } from 'src/auth/auth.service';
import { Chat } from 'src/entities/Chat.entity';
import { Message } from 'src/entities/Message.entity';
import { User } from 'src/entities/User.entity';
import { UserController } from 'src/user/user.controller';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';

@Module({
	imports: [
		forwardRef(() => AppModule),
		UserModule, ChatModule,
		TypeOrmModule.forFeature([Chat, User, Message]),
		CacheModule.register(),
	],
	controllers: [
		// UserController,
		ChatController,
	],
	providers: [
		{
			provide: 'AUTH_SERVICE',
			useClass: AuthService,
		},
		JwtService,
		UserService,
		ChatService
	],
})
export class ChatModule {}
