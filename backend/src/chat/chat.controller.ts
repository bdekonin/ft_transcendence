import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Chat, ChatType } from 'src/entities/Chat.entity';
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
	@ApiProperty({ required: false })
	name?: string;

	@IsEnum(ChatType)
	@ApiProperty({ required: true })
	type: ChatType;

	@IsOptional()
	@IsArray()
	@IsNumber({}, { each: true })
	@ApiProperty({ required: false })
	users: number[];

	@IsOptional()
	@IsString()
	@ApiProperty({ required: false })
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
		@ApiOkResponse({ description: 'Returns model of the chat', type: Chat })
		@ApiBadRequestResponse({ description: 'Invalid errors. check code for more information' })
	async create(
		@Param('userID', ParseIntPipe) userID: number,
		@Body() createDto: createChatDto,
	) {
		const output = await this.chatService.createChat(userID, createDto);
		this.socketGateway.server.emit('chat/refresh-chats');
		return output;
	}

	/* Message */
	@Post('message')
		@ApiBody({ type: MessageDto })
		@ApiOkResponse({ description: 'Returns model of the message', type: Chat })
		@ApiBadRequestResponse({ description: 'Invalid errors. check code for more information' })
	async sendMessage(
		@Param('userID', ParseIntPipe) userID: number,
		@Body() messageDto: MessageDto,
	) {
		const response = await this.chatService.sendMessage(messageDto.chatID, userID, messageDto.message);
		return response;
	}

	@Get('messages/:chatID')
		@ApiOkResponse({ description: 'Returns all messages in chat', type: [Chat] })
		@ApiBadRequestResponse({ description: 'Invalid errors. check code for more information' })
	async getMessages(
		@Param('userID', ParseIntPipe) userID: number,
		@Param('chatID', ParseIntPipe) chatID: number,
	) {
		return await this.chatService.getMessages(chatID);
	}

	@Patch('join')
		@ApiBody({ description: 'Check postman for examples.', type: JoinChatDto })
		@ApiOkResponse({ description: 'Returns the updated chat with the included user', type: Chat })
		@ApiBadRequestResponse({ description: 'Invalid errors. check code for more information' })
	async joinChat(
		@Param('userID', ParseIntPipe) userID: number,
		@Body() dto: JoinChatDto,
	) {
		const output = await this.chatService.joinChat(userID, dto);
		this.socketGateway.server.emit('chat/refresh-chats');
		return output;
	}

	@Delete('leave/:chatID')
		@ApiOkResponse({ description: 'Returns the updated chat with the included user', type: Chat })
		@ApiBadRequestResponse({ description: 'Invalid errors. check code for more information' })
	async deleteChat(
		@Param('userID', ParseIntPipe) userID: number,
		@Param('chatID', ParseIntPipe) chatID: number,
	) {
		const output = await this.chatService.leaveChat(userID, chatID);
		this.socketGateway.server.emit('chat/refresh-chats');
		return output;
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
