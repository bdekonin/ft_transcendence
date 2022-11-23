import { BadRequestException, CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat, ChatType } from 'src/entities/Chat.entity';
import { User } from 'src/entities/User.entity';
import { UserService } from 'src/user/user.service';
import { UserNotFoundException } from 'src/utils/exceptions';
import { In, Repository } from 'typeorm';
import { createChatDto } from './chat.controller';
import { Cache } from 'cache-manager';


@Injectable()
export class ChatService {
	
	constructor(
		@InjectRepository(Chat) public chatRepo: Repository<Chat>,
		private userService: UserService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) { }
	




	async get() {
		const value = await this.cacheManager.get('key');
		if (value)
			return { value: value };
		else
			return { value: 'no value' };
	}
	async set() {
		const seconds = 10; // TODO - change to 600
		return await this.cacheManager.set('key', 'value', seconds);
	}










	async createChat(userID: number, dto: createChatDto): Promise<Chat> {
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
		this.chatRepo.create(chat);
		return await this.chatRepo.save(chat);
	}

	/* Helper functions - Create Chat */
	private async createPrivateChat(userID: number, dto: createChatDto) {
		const { name, type, users, password } = dto;

		if (name || !type || !users || password) {
			throw new BadRequestException("Invalid private chat request");
		}
		if (users.length != 2) {
			throw new BadRequestException("Private chat must have exactly 2 unique users");
		}
		if (this.hasDuplicates(users)) {
			throw new BadRequestException("Private chat must have exactly 2 unique users");
		}
		if (!await this.isEveryUserActive(users)) {
			throw new BadRequestException("One or more users does not exist");
		}
		if (!users.includes(userID)) {
			throw new BadRequestException("Private chat must include the user who is creating it");
		}
		// if ((await this.doesPrivateExist(users[0], users[1])).users.length > 1) {
			// 	throw new BadRequestException("Private chat already exists");
			// }
		const chatExists = await this.doesPrivateExist(users[0], users[1]);
		if (chatExists && chatExists.users.length > 1) {
			throw new BadRequestException("Private chat already exists");
		}

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

		if (!name || !type || !users || password) {
			throw new BadRequestException("Invalid group chat request");
		}
		if (users.length != 1) {
			throw new BadRequestException("Group chat must have exactly 1 unique user");
		}
		if (!users.includes(userID)) {
			throw new BadRequestException("Group chat must include the user who is creating it");
		}
		if (name.length < 3) {
			throw new BadRequestException("Group chat name must be at least 3 characters long");
		}
		if (name.length > 20) {
			throw new BadRequestException("Group chat name cannot be longer then 20 characters");
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

		if (!name || !type || !users || !password) {
			throw new BadRequestException("Invalid protected group chat request");
		}
		if (users.length != 1) {
			throw new BadRequestException("Protected group chat must have exactly 1 unique user");
		}
		if (!users.includes(userID)) {
			throw new BadRequestException("Protected group chat must include the user who is creating it");
		}
		if (name.length < 3) {
			throw new BadRequestException("Protected group chat name must be at least 3 characters long");
		}
		if (name.length > 20) {
			throw new BadRequestException("Protected group chat name cannot be longer then 20 characters");
		}
		if (password.length < 3) {
			throw new BadRequestException("Protected group chat password must be at least 3 characters long");
		}
		if (password.length > 20) {
			throw new BadRequestException("Protected group chat password cannot be longer then 20 characters");
		}
		if (password.match(/^[a-zA-Z0-9]+$/)) {
			throw new BadRequestException("Protected group chat password must contain only letters and numbers");
		}

		const newChat = {
			name,
			type,
			users: await this.appendUsersToChat(users),
			password,
		};
		return newChat;
	}
	



	/* Helper functions */
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

	private async doesPrivateExist(idOne: number, idTwo: number): Promise<Chat> {
		return await this.chatRepo.findOne({
			relations: ['users'],
			where: {
				type: ChatType.PRIVATE,
				// users: In([idOne, idTwo]),
				users: {
					id: In([idOne, idTwo]),
				},
			}
		});
	}
}
