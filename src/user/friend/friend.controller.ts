import { Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { Friend } from 'src/entities/Friend.entity';
import { FriendService } from './friend.service';

@Controller()
export class FriendController {
	constructor(
        private friendService: FriendService,
    ) {}



	@Post('/users/:senderID/friends/:recieverID')
	async createFriends(
		@Param('senderID', ParseIntPipe) senderID: number,
		@Param('recieverID', ParseIntPipe) recieverID: number,
	): Promise<Friend> {
		// check if already exist
		const friendship = await this.friendService.create(senderID, recieverID);
		return friendship;
	}
}
