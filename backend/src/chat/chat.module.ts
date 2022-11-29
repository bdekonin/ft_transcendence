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
import { Membership } from 'src/entities/Membership.entity';
import { MembershipService } from 'src/user/membership/membership.service';
import { chatGateway } from './chat.gateway';

@Module({
	imports: [
		UserModule, ChatModule,
		TypeOrmModule.forFeature([Chat, User, Message, Membership]),
		forwardRef(() => AppModule),
		CacheModule.register(),
	],
	controllers: [
		UserController,
		ChatController,
	],
	providers: [
		chatGateway,
		MembershipService,
		{
			provide: 'AUTH_SERVICE',
			useClass: AuthService,
		},
		JwtService,
		UserService,
		ChatService,
	],
})
export class ChatModule {}
