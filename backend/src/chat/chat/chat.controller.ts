import { Controller, Post } from '@nestjs/common';
import { ChatType } from 'src/entities/Chat.entity';




/* Private chat */
/*
{
	"type": "PRIVATE",
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
	"type": "GROUP",
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
	"type": "GROUP",
	"users": [
		'{userID}',
		'{userID}',
		'{userID}',
		'{userID}',
	],
	"isGroup": true,
	"isPrivate": false,
}
*/

export class createChatDto {
	name?: string;
	type: ChatType;
	users: number[];
	isGroup: boolean;
	isPrivate: boolean;
	isPrivateProtected: boolean;
	password?: string;
}

@Controller('chat')
export class ChatController {

	@Post()
	async create() {
		return 'This action adds a new chat';
	}
}
