import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ChatType } from 'src/entities/Chat.entity';
import { ChatService } from './chat.service';

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
	"type": GROUP,
	"users": [
		'{userID}', # Only the creator of the chat
	]
}
*/

/* Password protected Group chat */
/*
{
	"name": "Group Chat Name",
	"type": GROUP_PROTECTED,
	"users": [
		'{userID}', # Only the creator of the chat
	]
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
export class ChatController {

	constructor(private readonly chatService: ChatService) {}

	@Post('create')
	async create(
		@Param('userID', ParseIntPipe) userID: number,
		@Body() createDto: createChatDto,
	) {
		return await this.chatService.createChat(userID, createDto);
	}

	@Get('get')
	get() {

	}

	@Get('set')
	set() {
	}
 }
