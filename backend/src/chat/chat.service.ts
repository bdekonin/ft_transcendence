import { BadRequestException, CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat, ChatType } from 'src/entities/Chat.entity';
import { User } from 'src/entities/User.entity';
import { UserService } from 'src/user/user.service';
import { UserNotFoundException } from 'src/utils/exceptions';
import { In, Not, Repository } from 'typeorm';
import { createChatDto } from './chat.controller';
import { Cache } from 'cache-manager';
import { Message } from 'src/entities/Message.entity';
import { JoinChatDto } from './join.dto';


@Injectable()
export class ChatService {
	
	constructor(
		@InjectRepository(Chat) public chatRepo: Repository<Chat>,
		@InjectRepository(Message) public messageRepo: Repository<Message>,
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

	/* Message */
	async sendMessage(chatID: number, userID: number, message: string): Promise<Message> {
		const chat = await this.chatRepo.findOne ({
			relations: ['users'],
			where: {
				id: chatID
			},
		});

		if (!chat) {
			throw new BadRequestException("Chat does not exist");
		}
		if (!chat.users.some(user => user.id === userID)) {
			throw new BadRequestException("User is not part of this chat");
		}
		if (message.length > 1000) {
			throw new BadRequestException("Message cannot be longer then 1000 characters");
		}

		const sender = await this.userService.findUserById(userID);
		if (!sender) {
			throw new UserNotFoundException();
		}

		const messageEntity = this.messageRepo.create({
			message: message,
			sender: sender,
			parent: chat,
		});
		return await this.messageRepo.save(messageEntity);
	}

	async getMessages(chatID: number) {
		const chat = await this.chatRepo.findOne({
			order: {
				messages: {
					id: 'DESC'
				}
			},
			relations: ['messages'],
			where: {
				id: chatID
			},
		});
		if (!chat) {
			throw new BadRequestException("Chat does not exist");
		}
		const output = chat.messages.map(message => {
				return {
					id: message.id,
				}
			});
		return chat.messages;
	}

	async getChats(userID: number, filter: string) {
		var chats: Chat[];
		const user = await this.userService.findUserById(userID);
		if (!user) {
			throw new UserNotFoundException();
		}

		if (filter === 'public')
			chats = await this.getChatTypePublic(userID);
		else if (filter === 'protected')
			chats = await this.getChatTypeProtected(userID);
		else if (filter === 'all')
			 return await this.getChatTypeAll(userID);
		else /* Joined */
			chats = await this.getChatTypeJoined(userID);

		chats.map(chat => {
			if (chat.name == null) {
				if (chat.users[0].id == userID) {
					chat.name = chat.users[0].username + ', ' + chat.users[1].username;
				} else {
					chat.name = chat.users[1].username + ', ' + chat.users[0].username;
				}
			}
		});
		for (let i = 0; i < chats.length; i++) {
			delete chats[i].password;
		}
		return chats;
	}

	async joinChat(userID: number, dto: JoinChatDto) {
		const chat = await this.chatRepo.findOne({
			relations: ['users'],
			where: {
				id: dto.chatID
			},
		});
		if (!chat) {
			throw new BadRequestException("Chat does not exist");
		}
		if (chat.type === ChatType.PRIVATE) {
			throw new BadRequestException("Chat is private");
		}

		console.log('chat.type: ' + chat.type);
		console.log('dto: ', dto);

		if (chat.type === ChatType.GROUP_PROTECTED) {
			if (chat.password !== dto.password) {
				throw new BadRequestException("Password is invalid.");
			}
		}

		if (chat.users.some(user => user.id === userID)) {
			throw new BadRequestException("User is already part of this chat");
		}
		chat.users.push(await this.userService.findUserById(userID));
		return await this.chatRepo.save(chat);
	}

	async leaveChat(userID: number, chatID: number) {
		const chat = await this.chatRepo.findOne({
			relations: ['users'],
			where: {
				id: chatID
			},
		});
		if (!chat) {
			throw new BadRequestException("Chat does not exist");
		}
		if (!chat.users.some(user => user.id === userID)) {
			throw new BadRequestException("User is not part of this chat");
		}
		if (chat.users.length === 2 && chat.type === ChatType.PRIVATE) {

			return await this.chatRepo.delete(chatID);
		}
		if (chat.users.length === 1) {
			return await this.chatRepo.delete(chatID);
		}
		chat.users = chat.users.filter(user => user.id !== userID);
		return await this.chatRepo.save(chat);
	}







	/* Chat */
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
		const newChat = this.chatRepo.create({
			type: chat.type,
			name: chat.name,
			users: chat.users,
			password: chat.password,
		});
		return await this.chatRepo.save(newChat);
	}

	/* Chat - Helper Functions */
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
			users: [await this.userService.findUserById(users[0]), await this.userService.findUserById(users[1])],
			password: null,
		};
		return newChat;
	}

	private async createGroupChat(userID: number, dto: createChatDto) {
		const { name, type, users, password } = dto;

		if (!name || !type || users || password) {
			throw new BadRequestException("Invalid group chat request");
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
			users: [await this.userService.findUserById(userID)],
			password: null,
		};
		return newChat;
	}

	private async createProtectedGroupChat(userID: number, dto: createChatDto) {
		const { name, type, users, password } = dto;

		if (!name || !type || users || !password) {
			throw new BadRequestException("Invalid protected group chat request");
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
		// if (password.match(/^[a-zA-Z0-9]+$/)) {
		// 	throw new BadRequestException("Protected group chat password must contain only letters and numbers");
		// }

		const newChat = {
			name,
			type,
			users: [await this.userService.findUserById(userID)],
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

	/* Chat - Get Types */
	private async getChatTypeJoined(id: number): Promise<Chat[]> {
		return await this.chatRepo.find({
			relations: ['users'],
			where: {
				users: {
					id: id
				}
			},
		});
	}
	private async getChatTypePublic(id: number): Promise<Chat[]> {
		const chats =  await this.chatRepo.find({
			relations: ['users'],
			where: {
				type: ChatType.GROUP,
			},
		});

		const filteredChats = chats.filter(chat => {
			return !chat.users.some(user => user.id === id);
		});
		return filteredChats;
	}
	private async getChatTypeProtected(id: number): Promise<Chat[]> {
		const chats =  await this.chatRepo.find({
			relations: ['users'],
			where: {
				type: ChatType.GROUP_PROTECTED,
			},
		});

		const filteredChats = chats.filter(chat => {
			return !chat.users.some(user => user.id === id);
		});
		return filteredChats;
	}
	private async getChatTypePrivates(id: number): Promise<Chat[]> {
		const chats =  await this.chatRepo.find({
			relations: ['users'],
			where: {
				type: ChatType.PRIVATE,
			},
		});

		const filteredChats = chats.filter(chat => {
			return chat.users.some(user => user.id === id);
		});
		return filteredChats;
	}

	async getPrivateChat(idOne: number, idTwo: number): Promise<Chat> {
		const chats = await this.getChatTypePrivates(idOne);
		const filteredChats = chats.filter(chat => {
			return chat.users.some(user => user.id === idTwo);
		});

		return filteredChats[0];
	}

	private async getChatTypeAll(id: number) {
		const payload = {
			"joined": await this.getChats(id, 'joined'),
			'public': await this.getChats(id, 'public'),
			'protected': await this.getChats(id, 'protected'),
		}
		return payload;
	}
}
