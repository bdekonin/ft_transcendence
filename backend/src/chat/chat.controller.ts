import { Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { type } from 'os';
import { ChatType } from 'src/entities/Chat.entity';
import { UserService } from 'src/user/user.service';

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
		'{userID}',
		'{userID}',
		'{userID}',
		'{userID}',
	],
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

	@IsArray()
	@IsNumber({}, { each: true })
	users: number[];

	@IsOptional()
	@IsString()
	password?: string;
}

@Controller('/chat/:userID/')
export class ChatController {

	@Post('create')
	async create(
		@Param('userID', ParseIntPipe) userID: number,
		createChatDto: createChatDto,
	) {
		const { name, type, users, password } = createChatDto;
		return { name, type, users, password };
	}
}
