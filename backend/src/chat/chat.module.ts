import { forwardRef, ForwardReference, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from 'src/app.module';
import { Chat } from 'src/entities/Chat.entity';
import { Message } from 'src/entities/Message.entity';
import { User } from 'src/entities/User.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
	imports: [
		ChatModule,
		TypeOrmModule.forFeature([Chat, User, Message]),
		forwardRef(() => AppModule)
		
	],
	controllers: [
		ChatController,
	],
	providers: [
		ChatService,
	],
})
export class ChatModule {}
