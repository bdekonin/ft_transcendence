import { BadRequestException, Injectable } from '@nestjs/common';
import { ChatType } from 'src/entities/Chat.entity';
import { createChatDto } from './chat.controller';

@Injectable()
export class ChatService {


	async createChat(userID: number, dto: createChatDto) {
		if (dto.type === ChatType.PRIVATE) {
			return this.createPrivateChat(userID, dto);
		} else if (dto.type === ChatType.GROUP) {
			return this.createGroupChat(userID, dto);
		} else if (dto.type === ChatType.GROUP_PROTECTED) {
			return this.createProtectedGroupChat(userID, dto);
		}
		throw new BadRequestException('Invalid Chat Type');
	}




	/* Helper functions - Create Chat */
	private async createPrivateChat(userID: number, dto: createChatDto) {
		const {type, users} = dto;
		// const { name, type, users, password } = creatDto;
		if (!users) {
			throw new BadRequestException('Must include Users')
		}
		if (users.length !== 2) {
			throw new BadRequestException('Private chat must have exactly 2 users');
		}
		if (this.hasDuplicates(users) == true) {
			throw new BadRequestException('Private chat must have 2 different users');
		}
		if (users.includes(userID) == false) {
			throw new BadRequestException('Private chat must include the user who is creating it');
		}
		if (dto.password != undefined) {
			throw new BadRequestException('Private chat doesn\'t need a password');
		}
		if (dto.name != undefined) {
			throw new BadRequestException('Private chat doesn\'t need a name');
		}
		if (!type || !users)
			throw new BadRequestException('Invalid chat type or users');

		const newChat = {
			name: null,
			type,
			users,
			password: null,
		};
		return newChat;
	}

	private async createGroupChat(userID: number, dto: createChatDto) {
		const { name, type, users, password } = dto;

		if (users != undefined && password != undefined) {
			throw new BadRequestException('Users and password are not needed for a group chat');
		}

		if (users && users.length == 1 && users[0] != userID) {
			throw new BadRequestException('Group chat must include the user who is creating it');
		}

		const newChat = {
			name,
			type,
			users: [
				userID
			],
			password: null,
		};
		return newChat;
	}

	private async createProtectedGroupChat(userID: number, dto: createChatDto) {
		const { name, type, users, password } = dto;

		if (users && users.length == 1 && users[0] != userID) {
			throw new BadRequestException('Group chat must include the user who is creating it');
		}
		if (users != undefined) {
			throw new BadRequestException('users array not allowed for this type')
		}

		const newChat = {
			name,
			type,
			users: [
				userID
			],
			password,
		};
		return newChat;
	}
	
	private hasDuplicates(array: any[]): boolean {
		return (new Set(array)).size !== array.length;
	}
}
