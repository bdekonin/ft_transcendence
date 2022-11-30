import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ChatType } from 'src/entities/Chat.entity';
import { ChatService } from './chat.service';
import { JoinChatDto } from './join.dto';
import { MessageDto } from './message.dto';
import { socketGateway } from 'src/gateway/socket.gateway';
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

	constructor(
		private readonly chatService: ChatService,
		private readonly socketGateway: socketGateway,
		) {}


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
		const response = await this.chatService.sendMessage(messageDto.chatID, userID, messageDto.message);
		return response;
	}

	@Get('messages/:chatID')
	async getMessages(
		@Param('userID', ParseIntPipe) userID: number,
		@Param('chatID', ParseIntPipe) chatID: number,
	) {
		return await this.chatService.getMessages(chatID);
	}

	@Patch('join')
	async joinChat(
		@Param('userID', ParseIntPipe) userID: number,
		@Body() dto: JoinChatDto,
	) {
		return await this.chatService.joinChat(userID, dto);
	}

	@Delete('leave/:chatID')
	async deleteChat(
		@Param('userID', ParseIntPipe) userID: number,
		@Param('chatID', ParseIntPipe) chatID: number,
	) {
		return await this.chatService.leaveChat(userID, chatID);
	}

	@Get('chats')
	async getChats(
		@Param('userID', ParseIntPipe) userID: number,
		@Query('filter') filter: string,
	) {
		if (!filter)
			filter = 'joined';

		if (filter != 'joined' && filter != 'public' && filter != 'protected' && filter != 'all')
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
