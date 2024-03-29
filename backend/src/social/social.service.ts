import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createChatDto } from 'src/chat/chat.controller';
import { ChatService } from 'src/chat/chat.service';
import { ChatType } from 'src/entities/Chat.entity';
import { Friend } from 'src/entities/Friend.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';

@Injectable()
export class SocialService 
{
	constructor(
		@InjectRepository(Friend) private repo: Repository<Friend>,
		private readonly userService: UserService,
		private readonly chatService: ChatService,
	) {}

	async follow(senderID: number, recieverID: number): Promise<Friend> {
		if (senderID == recieverID)
			throw new BadRequestException('You cannot follow yourself');

		/* Check for Duplicate friendship */
		const sender = await this.userService.findUserById(senderID);
			if (!sender)
				throw new NotFoundException('Sender not found');
		const reciever = await this.userService.findUserById(recieverID);
			if (!reciever)
				throw new NotFoundException('Reciever not found');
		var friendship = await this.repo.findOne({
			relations: ['sender', 'reciever'],
			where: [
				{ sender:  { id: sender.id }, reciever: { id: reciever.id } },
				{ sender:  { id: reciever.id }, reciever: { id: sender.id } },
			],
		});

		/* If friendship already exist change to followed */
		if (friendship) {
			if (friendship.status == 'accepted')
				throw new BadRequestException('You are already following this user');
			if (friendship.status == 'blocked')
				throw new BadRequestException('You must first unblock this user');
			if (friendship.status == 'pending') {
				if (senderID != friendship.sender.id) {
					friendship.status = 'accepted';
				}
				else
					throw new ForbiddenException('The other user must accept your request first');
			}
			else
				throw new BadRequestException('You are already following this user');
		}
		/* If friendship does not exist create it and set to pending */
		else {
			friendship = this.repo.create({
				sender: sender,
				reciever: reciever,
			});
		}

		/* If friendship is accepted create a chat */
		if (friendship.status == 'accepted') {
			const payload: createChatDto = {
				type: ChatType.PRIVATE,
				users: [
					friendship.sender.id,
					friendship.reciever.id,
				]
			}
			this.chatService.createChat(friendship.sender.id, payload);
		}


		return this.repo.save(friendship);
	}
	async  unfollow(senderID: number, recieverID: number): Promise<Friend> {
		if (senderID == recieverID)
			throw new BadRequestException('You cannot unfollow yourself');
		const sender = await this.userService.findUserById(senderID);
		const reciever = await this.userService.findUserById(recieverID);
		const friendship = await this.repo.findOne({
			relations: ['sender', 'reciever'],
			where: [
				{ sender:  { id: sender.id }, reciever: { id: reciever.id } },
				{ sender:  { id: reciever.id }, reciever: { id: sender.id } },
			],
		});
		if (!friendship)
			throw new NotFoundException('Friendship not found');
		// if (friendship.status != 'accepted')
		// 	throw new BadRequestException('You are not friends with this user');

		if (friendship.status == 'accepted') {
			const chatID = await this.chatService.getPrivateChat(sender.id, reciever.id)
			if (chatID)
				this.chatService.leaveChat(friendship.sender.id, chatID.id);
		}

		return await this.repo.remove(friendship);
	}
	async block(senderID: number, recieverID: number): Promise<Friend> {
		if (senderID == recieverID)
			throw new BadRequestException('You cannot follow yourself');

		/* Check for Duplicate friendship */
		const sender = await this.userService.findUserById(senderID);
			if (!sender)
				throw new NotFoundException('Sender not found');
		const reciever = await this.userService.findUserById(recieverID);
			if (!reciever)
				throw new NotFoundException('Reciever not found');
		var friendship = await this.repo.findOne({
			relations: ['sender', 'reciever'],
			where: [
				{ sender:  { id: sender.id }, reciever: { id: reciever.id } },
				{ sender:  { id: reciever.id }, reciever: { id: sender.id } },
			],
		});
		if (friendship) {
			const chatID = await this.chatService.getPrivateChat(sender.id, reciever.id)
			if (chatID)
				this.chatService.leaveChat(friendship.sender.id, chatID.id);
		}

		/* If friendship already exist change to blocked */
		if (friendship) {
				friendship.status = 'blocked';
		}
		/* If friendship does not exist create it and set to pending */
		else {
			friendship = this.repo.create({
				sender: sender,
				reciever: reciever,
				status: 'blocked'
			});
		}
		return this.repo.save(friendship);
	}

	async unblock(senderID: number, recieverID: number): Promise<Friend> {
		if (senderID == recieverID)
			throw new BadRequestException('You cannot unfollow yourself');
		const sender = await this.userService.findUserById(senderID);
		const reciever = await this.userService.findUserById(recieverID);
		const friendship = await this.repo.findOne({
			relations: ['sender', 'reciever'],
			where: [
				{ sender:  { id: sender.id }, reciever: { id: reciever.id } },
				{ sender:  { id: reciever.id }, reciever: { id: sender.id } },
			],
		});
		if (!friendship)
			throw new NotFoundException('Friendship not found');
		if (friendship.status != 'blocked')
			throw new BadRequestException('You are not blocked by this user');
		return await this.repo.remove(friendship);
	}

	async getSocial(senderID: number, filter: string): Promise<Friend[]> {
		if (filter === 'accepted')
			return await this.getFriends(senderID);
		else if (filter === 'pending')
			return await this.getPendings(senderID);
		else if (filter === 'sent')
			return await this.getSentRequests(senderID);
		else if (filter === 'blocked')
			return await this.getBlocked(senderID);
		throw new BadRequestException('Invalid filter');
	}
	async getSocialOf(senderID: number, otherID: number): Promise<Friend> {
		const sender = await this.userService.findUserById(senderID);
		const reciever = await this.userService.findUserById(otherID);

		if (!sender || !reciever)
			throw new NotFoundException('User not found');
		const friendship = await this.repo.findOne({
			relations: ['sender', 'reciever'],
			where: [
				{ sender:  { id: sender.id }, reciever: { id: reciever.id } },
				{ sender:  { id: reciever.id }, reciever: { id: sender.id } },
			],
		});
		return friendship;
	}
	async getAllFriends(id: number): Promise<Friend[]> {
		const user = await this.userService.findUserById(id);
		if (!user)
			throw new NotFoundException('User not found');
		const friends = await this.repo.find({
			relations: ['sender', 'reciever'],
			where: [
				{ sender: { id: user.id } },
				{ reciever: { id: user.id } },
			],
		});
		return friends;
	}



	/* Helper functions */
	private async doesFriendShipExist(senderID: number, recieverID: number): Promise<boolean> {
		const sender = await this.userService.findUserById(senderID);
		const reciever = await this.userService.findUserById(recieverID);
		const friendship = await this.repo.findOne({
			relations: ['sender', 'reciever'],
			where: [
				{ sender:  { id: sender.id }, reciever: { id: reciever.id } },
				{ sender:  { id: reciever.id }, reciever: { id: sender.id } },
			],
		});
		return friendship ? true : false;
	}
	private async getFriends(id: number): Promise<Friend[]> {
		const user = await this.userService.findUserById(id);
		if (!user)
			throw new NotFoundException('User not found');
		const friends = await this.repo.find({
			relations: ['sender', 'reciever'],
			where: [
				{ sender: { id: user.id }, status: 'accepted' },
				{ reciever: { id: user.id }, status: 'accepted' },
			],
		});
		return friends;
	}
	private async getPendings(id: number): Promise<Friend[]> {
		const user = await this.userService.findUserById(id);
		if (!user)
			throw new NotFoundException('User not found');
		const requests = await this.repo.find({
			relations: ['sender', 'reciever'],
			where: [
				{ sender: { id: user.id }, status: 'pending' },
				{ reciever: { id: user.id }, status: 'pending' },
			],
		});
		return requests;
	}
	private async getSentRequests(id: number): Promise<Friend[]> {
		const user = await this.userService.findUserById(id);
		if (!user)
			throw new NotFoundException('User not found');
		const pendings = await this.repo.find({
			relations: ['sender', 'reciever'],
			where: [
				{ sender: { id: user.id }, status: 'pending' }
			]
		});
		return pendings;
	}
	private async getBlocked(id: number): Promise<Friend[]> {
		const user = await this.userService.findUserById(id);
		if (!user)
			throw new NotFoundException('User not found');
		const pendings = await this.repo.find({
			relations: ['sender', 'reciever'],
			where: [
				{ sender: { id: user.id }, status: 'blocked' }
			]
		});
		return pendings;
	}
}
