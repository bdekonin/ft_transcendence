import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ChatType } from 'src/entities/Chat.entity';
import { ChatService } from './chat.service';
import { MessageDto } from './message.dto';

/* Private chat */
/*
{
	"type": PRIVATE,
	"users": [
		'{userID}',
		'{userID}',
	],
}
*/

/* Public Group chat */
/*
{
	"name": "Group Chat Name",
	"type": GROUP
}
*/

/* Password protected Group chat */
/*
{
	"name": "Group Chat Name",
	"type": GROUP_PROTECTED,
	"password": "password",
}
*/

export class createChatDto {
	@IsOptional()
	@IsString()
	name?: string;

	@IsEnum(ChatType)
	type: ChatType;

	@IsOptional()
	@IsArray()
	@IsNumber({}, { each: true })
	users: number[];

	@IsOptional()
	@IsString()
	password?: string;
}

@Controller('/chat/:userID/')
@ApiTags('chat')
export class ChatController {

	constructor(private readonly chatService: ChatService) {}


	/* Chat */
	@Post('create')
	async create(
		@Param('userID', ParseIntPipe) userID: number,
		@Body() createDto: createChatDto,
	) {
		return await this.chatService.createChat(userID, createDto);
	}


	/* Message */
	@Post('message')
	async sendMessage(
		@Param('userID', ParseIntPipe) userID: number,
		@Body() messageDto: MessageDto,
	) {
		return await this.chatService.sendMessage(messageDto.chatID, userID, messageDto.message);
	}

	@Get('messages/:chatID')
	async getMessages(
		@Param('userID', ParseIntPipe) userID: number,
		@Param('chatID', ParseIntPipe) chatID: number,
	) {
		return await this.chatService.getMessages(chatID);
	}

	@Get('chats')
	async getChats(
		@Param('userID', ParseIntPipe) userID: number,
		@Query('filter') filter: string,
	) {
		if (!filter)
			filter = 'joined';

		if (filter != 'joined' && filter != 'public' && filter != 'protected')
			throw new BadRequestException('Invalid filter, must be "joined", "public" or "protected"');
		return await this.chatService.getChats(userID, filter);
	}




	/* Temporary */
	@Get('get')
	get() {
		return this.chatService.get();
	}

	@Get('set')
	set() {
		return this.chatService.set();
	}
 }
