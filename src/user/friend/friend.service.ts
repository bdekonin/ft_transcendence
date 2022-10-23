import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { send } from 'process';
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
		
		const sender = await this.userService.findUserById(senderID);
		const reciever = await this.userService.findUserById(recieverID);
		const friendship = this.repo.create({
			sender: sender,
			reciever: reciever,
		});

		return this.repo.save(friendship);
	}

	async accept(friend: Friend): Promise<Friend> {
		friend.status = 'accepted';
		return await this.repo.save(friend);
	}

	async remove(friend: Friend): Promise<Friend> {
		return await this.repo.remove(friend);
	}

    async getFriends(id: number): Promise<Friend[]> {
        const user = await this.userService.findUserById(id);
        const friends = await this.repo.find({
            where: [
                { sender: user, status: 'accepted' },
                { reciever: user, status: 'accepted' },
            ],
            relations: ['sender', 'reciever']
        });
        return friends;
    }

    async getPendings(id: number): Promise<Friend[]> {
		const user = await this.userService.findUserById(id);
        const requests = await this.repo.find({
            relations: ['sender', 'reciever']
        });

		console.log(requests)
        return requests;
    }

    async getSentRequests(id: number): Promise<Friend[]> {
        const user = await this.userService.findUserById(id);
        const pendings = await this.repo.find({
            where: [
				{ sender: user, status: 'pending' }
			],
            relations: ['sender', 'reciever']
        });
        return pendings;
    }

	// async accept(friendship: Friendship): Promise<Friendship>
	// 	async remove(friendship: Friendship): Promise<Friendship>
	// 	async getFriends(userId: number): Promise<User[]>
	// 	async getPendings(userId: number): Promise<User[]>
	// 	async getSentRequests(userId: number): Promise<User[]>
	// 	async oneWaySearch(applicantId: number, recipientId: number, status?: string): Promise<Friendship>
	// 	async twoWaySearch(lhsId: number, rhsId: number, status?: string): Promise<Friendship>
}
