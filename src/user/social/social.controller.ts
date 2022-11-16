import { BadRequestException, Controller, Delete, Get, Param, ParseIntPipe, Put, Query } from '@nestjs/common';
import { SocialService } from './social.service';

@Controller('/user/:userID/social')
export class SocialController {
	constructor(
		private socialService: SocialService,
	) {}

	// Socials
	@Put(':otherID/follow')
	async followUser(
		@Param('userID', ParseIntPipe) userID: number,
		@Param('otherID', ParseIntPipe) otherID: number
	)
	{
		return await this.socialService.follow(userID, otherID);
	}
	@Delete(':otherID/unfollow')
	async unfollowUser(
		@Param('userID', ParseIntPipe) userID: number,
		@Param('otherID', ParseIntPipe) otherID: number
	)
	{
		return await this.socialService.unfollow(userID, otherID);
	}
	@Put(':otherID/block')
	async blockUser(
		@Param('userID', ParseIntPipe) userID: number,
		@Param('otherID', ParseIntPipe) otherID: number
	)
	{
		return await this.socialService.block(userID, otherID);
	}
	@Delete(':otherID/unblock')
	async unblockUser(
		@Param('userID', ParseIntPipe) userID: number,
		@Param('otherID', ParseIntPipe) otherID: number
	)
	{
		return await this.socialService.unblock(userID, otherID);
	}

	@Get()
	async getSocial(
		@Param('userID', ParseIntPipe) userID: number,
		@Query('filter') filter: string,
		@Query('otherID') otherID: string
	)
	{
		if (filter && filter != 'pending' && filter != 'accepted' && filter != 'blocked' && filter != 'sent')
			throw new BadRequestException('Query parameter is not valid');

		/* if filter exist return all friends with that filter */
		if (filter) {
			return await this.socialService.getSocial(userID, filter);
		}
		/* if otherid exist return that friendship */
		else if (otherID) {
			return await this.socialService.getSocialOf(userID, Number(otherID));
		}
		/* now return all friends */
		else {
			return await this.socialService.getAllFriends(userID);
		}
	}
}
