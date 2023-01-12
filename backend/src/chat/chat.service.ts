import { BadRequestException, CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat, ChatType } from 'src/entities/Chat.entity';
import { User } from 'src/entities/User.entity';
import { UserService } from 'src/user/user.service';
import { UserNotFoundException } from 'src/utils/exceptions';
import { In, Not, Repository } from 'typeorm';
import { createChatDto, updateChatDto } from './chat.controller';
import { Cache } from 'cache-manager';
import { Message } from 'src/entities/Message.entity';
import { JoinChatDto } from './join.dto';
import { UserAccess } from 'src/entities/Ban.entity';
import { runInThisContext } from 'vm';
import * as bcrypt from 'bcrypt';
import {v5 as uuidv5} from 'uuid';

@Injectable()
export class ChatService {
	
	constructor(
		@InjectRepository(Chat) public chatRepo: Repository<Chat>,
		@InjectRepository(Message) public messageRepo: Repository<Message>,
		private userService: UserService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) { }
	



	/* Promote */
	async promoteUser(chatID: number, userID: number, promoteUserID: number) {
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
			throw new BadRequestException("userID is not part of this chat");
		}
		if (!chat.users.some(user => user.id === promoteUserID)) {
			throw new BadRequestException("promoteUserID is not part of this chat");
		}

		if (!chat.adminIDs.some(adminID => adminID === userID)) {
			throw new BadRequestException("userID is not an admin of this chat");
		}
		if (chat.adminIDs.some(adminID => adminID === promoteUserID)) {
			throw new BadRequestException("promoteUserID is already an admin of this chat");
		}
		chat.adminIDs.push(promoteUserID);
		return await this.chatRepo.save(chat);
	}
	async demoteUser(chatID: number, userID: number, demoteUserID: number) {
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
			throw new BadRequestException("userID is not part of this chat");
		}
		if (!chat.users.some(user => user.id === demoteUserID)) {
			throw new BadRequestException("demoteUserID is not part of this chat");
		}

		if (!chat.adminIDs.some(adminID => adminID === userID)) {
			throw new BadRequestException("userID is not an admin of this chat");
		}
		if (!chat.adminIDs.some(adminID => adminID === demoteUserID)) {
			throw new BadRequestException("demoteUserID is not an admin of this chat");
		}
		chat.adminIDs = chat.adminIDs.filter(adminID => adminID !== demoteUserID);
		return await this.chatRepo.save(chat);
	}


	async kickUser(chatID: number, kickUserID: number, adminID: number) {
		const chat = await this.chatRepo.findOne({
			relations: ['users'],
			where: {
				id: chatID
			},
		});
		if (!chat) {
			throw new BadRequestException("Chat does not exist");
		}
		if (!chat.users.some(user => user.id === adminID)) {
			throw new BadRequestException("userID is not part of this chat");
		}
		if (!chat.users.some(user => user.id === kickUserID)) {
			throw new BadRequestException("demoteUserID is not part of this chat");
		}

		if (chat.adminIDs.includes(kickUserID))
			throw new BadRequestException("Cannot kick a admin");
		

		return await this.leaveChat(kickUserID, chatID);

	}

	async getAdmins(chatID: number) {
		const chat = await this.chatRepo.findOne({
			relations: ['users'],
			where: {
				id: chatID
			},
		});
		if (!chat) {
			return [];
			// throw new BadRequestException("Chat does not exist2");
		}
		if (!chat.adminIDs)
			return [];
		return chat.adminIDs;
	}



	async muteUser(userID: number, chatID: number, muteID: number) {
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
			throw new BadRequestException("userID is not part of this chat");
		}
		if (!chat.users.some(user => user.id === muteID)) {
			throw new BadRequestException("muteID is not part of this chat");
		}

		if (chat.adminIDs.includes(muteID))
			throw new BadRequestException("Cannot mute a admin");

		if (chat.muted) {
			chat.muted.push(muteID);
		} else {
			chat.muted = [muteID];
		}
		return await this.chatRepo.save(chat);
	}

	async unmuteUser(userID: number, chatID: number, unmuteID: number) {
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
			throw new BadRequestException("userID is not part of this chat");
		}
		if (!chat.users.some(user => user.id === unmuteID)) {
			throw new BadRequestException("unmuteID is not part of this chat");
		}

		if (chat.adminIDs.some(adminID => adminID === unmuteID)) {
			throw new BadRequestException("unmuteID cannot be an admin");
		}

		if (!chat.muted) {
			throw new BadRequestException("unmuteID is not muted");
		}
		chat.muted = chat.muted.filter(muteID => muteID !== unmuteID);
		return await this.chatRepo.save(chat);
	}

	async getMutes(chatID: number) {
		const chat = await this.chatRepo.findOne({
			relations: ['users'],
			where: {
				id: chatID
			},
		});
		if (!chat) {
			return [];
		}
		return chat.muted;
	}



	// async get() {
	// 	const value = await this.cacheManager.get('key');
	// 	if (value)
	// 		return { value: value };
	// 	else
	// 		return { value: 'no value' };
	// }
	// async set() {
	// 	const seconds = 10; // TODO - change to 600
	// 	return await this.cacheManager.set('key', 'value', seconds);
	// }

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
					id: 'ASC'
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

	async getChat(userID: number, chatID: number) {
		const chat = await this.chatRepo.findOne({
			relations: ['users'],
			where: {
				id: chatID
			},
		});
		if (!chat.users.some(user => user.id === userID)) {
			throw new BadRequestException("User is not part of this chat");
		}
		delete chat.password;
		return chat;
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

		if (chat.type === ChatType.GROUP_PROTECTED) {
			const isMatch = await bcrypt.compare(dto.password, chat.password);
			if (!isMatch) {
				throw new BadRequestException("Password is invalid.");
			}
		}

		if (chat.users.some(user => user.id === userID)) {
			throw new BadRequestException("User is already part of this chat");
		}

		/* Check if user is banned */
		if (await this.isUserBanned(chat, userID)) {
			throw new BadRequestException("User is banned from this chat");
		}

		chat.users.push(await this.userService.findUserById(userID));
		return await this.chatRepo.save(chat);
	}

	async isUserBanned(chat: Chat, userID: number): Promise<boolean> {
		const bannedUsers = chat.banned;
		const date_as_string = Math.round(new Date().valueOf() / 1000).toString();

		if (!chat.banned) {
			return false;
		}
		for (let i = 0; i < bannedUsers.length; i++) {
			if (bannedUsers[i].id === userID) {
				if (Number(bannedUsers[i].unbannedTime) > Number(date_as_string)) {
					return true;
				}
			}
		}
		return false;
	}

	async banUser(userID: number, chatID: number, bannedID: number, time: string) {
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
			throw new BadRequestException("userID is not part of this chat");
		}
		if (!chat.users.some(user => user.id === bannedID)) {
			throw new BadRequestException("bannedID is not part of this chat");
		}

		if (chat.adminIDs.includes(bannedID))
			throw new BadRequestException("Cannot ban a admin");

		if (chat.users.some(user => user.id === bannedID)) {
			// await this.leaveChat(bannedID, chatID);
			chat.users = chat.users.filter(user => user.id !== bannedID);
		}

		const banPayload: UserAccess = {
			id: bannedID, 
			unbannedTime: String(Math.round(new Date().valueOf() / 1000) + Number(time)),
		}
		if (chat.banned) {
			chat.banned.push(banPayload);
		} else {
			chat.banned = [banPayload];
		}
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
		if (chat.adminIDs.some(adminID => adminID === userID)) {
			chat.adminIDs = chat.adminIDs.filter(adminID => adminID !== userID);
		}
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
			password: chat.password ? await bcrypt.hash(chat.password, 10) : null,
			adminIDs: [
				userID
			],
			banned: [],
		});
		return await this.chatRepo.save(newChat);
	}

	async switchChannelType(userID: number, chatID: number, password: string): Promise<Chat> {
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
		if (chat.type == 'PRIVATE') {
			throw new BadRequestException("Cannot update a private chat");
		}
		if (chat.type == ChatType.GROUP_PROTECTED) {
			chat.type = ChatType.GROUP;
			chat.password = null;
		}
		else if (chat.type == ChatType.GROUP) {
			chat.type = ChatType.GROUP_PROTECTED
			chat.password = await bcrypt.hash(password, 10);
		}
		else
			return ;
		return await this.chatRepo.save(chat);
	}

	async update(userID: number, chatID: number, dto: updateChatDto): Promise<Chat> {
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
		if (chat.type == 'PRIVATE') {
			throw new BadRequestException("Cannot update a private chat");
		}
		if (dto.name) {
			if (dto.name.length < 3) {
				throw new BadRequestException("Group chat name must be at least 3 characters long");
			}
			if (dto.name.length > 20) {
				throw new BadRequestException("Group chat name cannot be longer then 20 characters");
			}
			chat.name = dto.name;
		}
		
		if (dto.password) {
			if (dto.password.length < 3) {
				throw new BadRequestException("Protected group chat password must be at least 3 characters long");
			}
			if (dto.password.length > 20) {
				throw new BadRequestException("Protected group chat password cannot be longer then 20 characters");
			}
			if (dto.password.includes(' ')) {
				throw new BadRequestException("Password must not contain spaces.");
			}
			if (chat.type != 'GROUP') {
				chat.password = await bcrypt.hash(dto.password, 10);
			}
		}
		return await this.chatRepo.save(chat);
	}

	async gameInvite(userID: number, chatID: number) {
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
		if (chat.type != 'PRIVATE') {
			throw new BadRequestException("Chat is not private");
		}
		if (chat.users.length != 2) {
			throw new BadRequestException("Chat must have exactly 2 users");
		}

		const user = await this.userService.findUserById(userID);
		if (!user) {
			throw new BadRequestException("User does not exist");
		}
		const uuid = uuidv5(String(chat.id), 'bb5d0ffa-9a4c-4d7c-8fc2-0a7d2220ba45');

		const link = "http://" + "f1r3s17" + ":3006/pong?invite=" + uuid;

		const message = 'Game invite: ' + link;

		return await this.sendMessage(chatID, userID, message);
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

	async getUsers(chatID: number): Promise<User[]> {
		const chat = await this.chatRepo.findOne({
			relations: ['users'],
			where: {
				id: chatID,
			}
		});
		if (!chat)
			return null;
		return chat.users;
	}





}
