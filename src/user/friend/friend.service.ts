import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friend } from 'src/entities/Friend.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user.service';

@Injectable()
export class FriendService {

	constructor(
		@InjectRepository(Friend) private repo: Repository<Friend>,
		private readonly userService: UserService
	) {}

	async create(senderID: number, recieverID: number): Promise<Friend> {
		if (senderID == recieverID)
			throw new BadRequestException;

		/* Check for Duplicate friendship */
		const exist = await this.doesFriendShipExist(senderID, recieverID);
		if (exist == true)
			throw new BadRequestException; // Already exist
		
		const sender = await this.userService.findUserById(senderID);
		const reciever = await this.userService.findUserById(recieverID);
		const friendship = this.repo.create({
			sender: sender,
			reciever: reciever,
		});

		return this.repo.save(friendship);
	}

	async doesFriendShipExist(senderID: number, recieverID: number): Promise<boolean> {
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

	async getFriends(id: number): Promise<Friend[]> {
		const user = await this.userService.findUserById(id);
		const friends = await this.repo.find({
			relations: ['sender', 'reciever'],
			where: [
				{ sender: { id: user.id }, status: 'accepted' },
				{ reciever: { id: user.id }, status: 'accepted' },
			],
		});
		return friends;
	}

	async getPendings(id: number): Promise<Friend[]> {
		const user = await this.userService.findUserById(id);
		const requests = await this.repo.find({
			relations: ['sender', 'reciever'],
			where: [
				{ sender: { id: user.id }, status: 'pending' },
				{ reciever: { id: user.id }, status: 'pending' },
			],
		});
		return requests;
	}

	async getSentRequests(id: number): Promise<Friend[]> {
		const user = await this.userService.findUserById(id);
		const pendings = await this.repo.find({
			relations: ['sender', 'reciever'],
			where: [
				{ sender: { id: user.id }, status: 'pending' }
			]
		});
		return pendings;
	}

	async accept(senderID: number, recieverID: number): Promise<Friend> {
		const sender = await this.userService.findUserById(senderID);
		const reciever = await this.userService.findUserById(recieverID);
		const friendship = await this.repo.findOne({
			relations: ['sender', 'reciever'],
			where: [
				{ sender: { id: sender.id }, status: 'pending' },
				{ reciever: { id: reciever.id }, status: 'pending' },
			],
		});
		if (!friendship)
			throw new BadRequestException;
		friendship.status = 'accepted';
		return await this.repo.save(friendship);
	}
	async unfollow(senderID: number, recieverID: number): Promise<Friend> {
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
			throw new BadRequestException;
		return await this.repo.remove(friendship);
	}

	async decline(senderID: number, recieverID: number): Promise<Friend> {
		const sender = await this.userService.findUserById(senderID);
		const reciever = await this.userService.findUserById(recieverID);
		const friendship = await this.repo.findOne({
			relations: ['sender', 'reciever'],
			where: [
				{ sender:  { id: sender.id }, reciever: { id: reciever.id }, status: 'pending' },
				{ sender:  { id: reciever.id }, reciever: { id: sender.id }, status: 'pending' },
			],
		});
		if (!friendship) {
			throw new BadRequestException;
		}
		return await this.repo.remove(friendship);
	}

	// async accept(friendship: Friendship): Promise<Friendship>
	// 	async remove(friendship: Friendship): Promise<Friendship>
	// 	async getFriends(userId: number): Promise<User[]>
	// 	async getPendings(userId: number): Promise<User[]>
	// 	async getSentRequests(userId: number): Promise<User[]>
	// 	async oneWaySearch(applicantId: number, recipientId: number, status?: string): Promise<Friendship>
	// 	async twoWaySearch(lhsId: number, rhsId: number, status?: string): Promise<Friendship>
}
