import { BadRequestException, Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Friend } from 'src/entities/Friend.entity';
import { FriendService } from './friend.service';

@Controller()
export class FriendController {
	constructor(
		private friendService: FriendService,
	) {}

	// Send a friend request
	@Get('/users/:senderID/friends/:recieverID') // CHANGE TO POST
	async createFriends(
		@Param('senderID', ParseIntPipe) senderID: number,
		@Param('recieverID', ParseIntPipe) recieverID: number,
	): Promise<Friend> {
		const friendship = await this.friendService.create(senderID, recieverID);
		return friendship;
	}

	// Get all friendships belonging to senderID
	@Get('/users/:senderID/friends')
	async getFriendshipsByStatus(
		@Param('senderID', ParseIntPipe) userId: number,
		@Query('status') status?: string
		): Promise<Friend[]> {
			console.log(status)
			if (status === 'accepted')
				return this.friendService.getFriends(userId);
			else if (status === 'pending')
				return await this.friendService.getPendings(userId);
			else if (status === 'sent')
				return await this.friendService.getSentRequests(userId);
			throw new BadRequestException;
	}

	// Accept a friend request from 'pending' to 'accepted'
	@Get('/users/:senderID/friends/:recieverID/accept') // CHANGE TO PUT
	async acceptFriendRequest(
		@Param('senderID', ParseIntPipe) senderID: number,
		@Param('recieverID', ParseIntPipe) recieverID: number,
	): Promise<Friend> {
		return await this.friendService.acceptFriendRequest(senderID, recieverID);
	}
}
