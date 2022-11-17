import { BadRequestException, Controller, Delete, Get, Param, ParseIntPipe, Put, Query } from '@nestjs/common';
import { SocialService } from './social.service';
import { ApiQuery, ApiParam, ApiTags, ApiNotFoundResponse, ApiBadRequestResponse, ApiForbiddenResponse, ApiOkResponse } from '@nestjs/swagger';
import { Friend } from 'src/entities/Friend.entity';
import { use } from 'passport';

@ApiTags('social')
@Controller('/user/:userID/social')
export class SocialController {
	constructor(
		private socialService: SocialService,
	) {}

	// Socials
	@Put(':otherID/follow')
		@ApiBadRequestResponse({description: 'Bad Request'})
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiForbiddenResponse({description: 'Forbidden'})
		@ApiOkResponse({ description: 'It returns the (created or modified) object', type: Friend })
		@ApiParam({ name: 'userID', type: 'number', required: true, description: 'The ID of the user who wants to follow' })
		@ApiParam({ name: 'otherID', type: 'number', required: true, description: 'The ID of the user who wants to be followed' })
	async followUser(
		@Param('userID', ParseIntPipe) userID: number,
		@Param('otherID', ParseIntPipe) otherID: number
	)
	{
		return await this.socialService.follow(userID, otherID);
	}

	@Delete(':otherID/unfollow')
		@ApiBadRequestResponse({description: 'Bad Request'})
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiForbiddenResponse({description: 'Forbidden'})
		@ApiOkResponse({ description: 'It returns the removed object', type: Friend })
		@ApiParam({ name: 'userID', type: 'number', required: true, description: 'The ID of the user who wants to unfollow' })
		@ApiParam({ name: 'otherID', type: 'number', required: true, description: 'The ID of the user who wants to be unfollowed' })
	async unfollowUser(
		@Param('userID', ParseIntPipe) userID: number,
		@Param('otherID', ParseIntPipe) otherID: number
	)
	{
		return await this.socialService.unfollow(userID, otherID);
	}

	@Put(':otherID/block')
		@ApiBadRequestResponse({description: 'Bad Request'})
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiForbiddenResponse({description: 'Forbidden'})
		@ApiOkResponse({ description: 'It returns the (created or modified) object', type: Friend })
		@ApiParam({ name: 'userID', type: 'number', required: true, description: 'The ID of the user who wants to block' })
		@ApiParam({ name: 'recieverID', type: 'number', required: true, description: 'The ID of the user who wants to be blocked' })
	async blockUser(
		@Param('userID', ParseIntPipe) userID: number,
		@Param('otherID', ParseIntPipe) otherID: number
	)
	{
		return await this.socialService.block(userID, otherID);
	}

	@Delete(':otherID/unblock')
		@ApiBadRequestResponse({description: 'Bad Request'})
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiForbiddenResponse({description: 'Forbidden'})
		@ApiOkResponse({ description: 'It returns the removed object', type: Friend })
		@ApiParam({ name: 'userID', type: 'number', required: true, description: 'The ID of the user who wants to unblock' })
		@ApiParam({ name: 'otherID', type: 'number', required: true, description: 'The ID of the user who wants to be unblocked' })
	async unblockUser(
		@Param('userID', ParseIntPipe) userID: number,
		@Param('otherID', ParseIntPipe) otherID: number
	)
	{
		return await this.socialService.unblock(userID, otherID);
	}

	@Get()
		@ApiBadRequestResponse({description: 'Bad Request'})
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiOkResponse({ description: 'All friendships', type: Friend, isArray: true })
		@ApiParam({ name: 'userID', type: 'number', required: true, description: 'The ID of the user who wants to get all friendships' })
		@ApiQuery({ name: 'filter', type: 'string', required: false, description: 'The type of friendships to get (pending, accepted, blocked, sent)' })
		@ApiQuery({ name: 'otherID', type: 'number', required: false, description: 'The friendship between userID and otherID' })
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
