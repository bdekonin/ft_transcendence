import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { setMaxIdleHTTPParsers } from 'http';
import { Chat, ChatType } from 'src/entities/Chat.entity';
import { User } from 'src/entities/User.entity';
import { UserService } from 'src/user/user.service';
import { UserNotFoundException } from 'src/utils/exceptions';
import { Repository } from 'typeorm';
import { createChatDto } from './chat.controller';


@Injectable()
export class ChatService {
	
	constructor(
		@InjectRepository(Chat) public chatRepo: Repository<Chat>,
		private userService: UserService,
	) { }

	set() {
		global.inviteCache.set("test", "test");
	}

	get() {
		return global.inviteCache.get("test");
	}









	async createChat(userID: number, dto: createChatDto) {
		var chat;
		if (dto.type === ChatType.PRIVATE) {
			chat = await this.createPrivateChat(userID, dto);
		} else if (dto.type === ChatType.GROUP) {
			chat = await this.createGroupChat(userID, dto);
		} else if (dto.type === ChatType.GROUP_PROTECTED) {
			chat = await this.createProtectedGroupChat(userID, dto);
		} else {
			throw new BadRequestException("Invalid chat type");
		}
		console.log(chat);
		// console.log(await this.isEveryUserActive(chat.users));
		return chat;
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
			users: await this.appendUsersToChat(users),
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
			users: await this.appendUsersToChat(users),
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
			users: await this.appendUsersToChat(users),
			password,
		};
		return newChat;
	}
	
	private hasDuplicates(array: any[]): boolean {
		return (new Set(array)).size !== array.length;
	}
	// This function allows us to check if the users exist in the database when given an array of user IDs e.g. [1, 2, 3, -1]
	private async isEveryUserActive(users: number[]): Promise<boolean> {
		for (let i = 0; i < users.length; i++) {
			const user = await this.userService.findUserById(users[i]);
			if (!user) {
				return false;
			}
		}
		return true;
	}

	private async appendUsersToChat(users: number[]): Promise<User[]> {
		const usersArray = [];
		for (let i = 0; i < users.length; i++) {
			const user = await this.userService.findUserById(users[i]);
			if (!user) {
				throw new UserNotFoundException();
			}
			usersArray.push(user);
		}
		return usersArray;
	}
}
