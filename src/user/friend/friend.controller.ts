import { BadRequestException, Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Friend } from 'src/entities/Friend.entity';
import { FriendService } from './friend.service';

@Controller()
export class FriendController {
	constructor(
		private friendService: FriendService,
	) {}



	@Get('/users/:senderID/friends/:recieverID') // CHANGE TO POST
	async createFriends(
		@Param('senderID', ParseIntPipe) senderID: number,
		@Param('recieverID', ParseIntPipe) recieverID: number,
	): Promise<Friend> {
		// check if already exist
		const friendship = await this.friendService.create(senderID, recieverID);
		return friendship;
	}

	@Get('/users/:id/friends')
	async getFriendshipsByStatus(
		@Param('id', ParseIntPipe) userId: number,
		@Query('status') status?: string
		): Promise<Friend[]> {
			console.log(status)
			if (status === 'accepted')
				return await this.friendService.getFriends(userId);
			else if (status === 'pending')
				return await this.friendService.getPendings(userId);
			else if (status === 'sent')
				return await this.friendService.getSentRequests(userId);
			throw BadRequestException;
	}
}
