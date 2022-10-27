import { BadRequestException, Controller, Delete, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Friend } from 'src/entities/Friend.entity';
import { FriendService } from './friend.service';

@Controller('/user/:senderID/friend/')
export class FriendController {
	constructor(
		private friendService: FriendService,
	) {}

	// /user/:senderID/friend/follow/:recieverID
	// Send a friend request
	@Get('follow/:recieverID') // CHANGE TO POST
	async followFriend(
		@Param('senderID', ParseIntPipe) senderID: number,
		@Param('recieverID', ParseIntPipe) recieverID: number,
	): Promise<Friend> {
		const friendship = await this.friendService.create(senderID, recieverID);
		return friendship;
	}
	
	// /user/:senderID/friend/unfollow/:recieverID
	@Delete('unfollow/:recieverID') // CHANGE TO DELETE
	async unfollowFriend(
		@Param('senderID', ParseIntPipe) senderID: number,
		@Param('recieverID', ParseIntPipe) recieverID: number,
	): Promise<Friend> {
		return await this.friendService.unfollow(senderID, recieverID);
	}

	// /user/:senderID/friend/accept/:recieverID
	// Accept a friend request from 'pending' to 'accepted'
	@Get('accept/:recieverID') // CHANGE TO PUT
	async accept(
		@Param('senderID', ParseIntPipe) senderID: number,
		@Param('recieverID', ParseIntPipe) recieverID: number,
	): Promise<Friend> {
		return await this.friendService.accept(senderID, recieverID);
	}

	// /user/:senderID/friend/decline/:recieverID
	@Delete('decline/:recieverID') // CHANGE TO DELETE
	async decline(
		@Param('senderID', ParseIntPipe) senderID: number,
		@Param('recieverID', ParseIntPipe) recieverID: number,
	): Promise<Friend> {
		return await this.friendService.decline(senderID, recieverID);
	}

	// /user/:senderID/friend/list?status=
	// Get all friendships belonging to senderID
	@Get('list') // ? Query Parameters
	async list(
		@Param('senderID', ParseIntPipe) userId: number,
		@Query('status') status?: string
		): Promise<Friend[]> {
			if (status === 'accepted')
				return this.friendService.getFriends(userId);
			else if (status === 'pending')
				return await this.friendService.getPendings(userId);
			else if (status === 'sent')
				return await this.friendService.getSentRequests(userId);
			throw new BadRequestException;
	}
}
