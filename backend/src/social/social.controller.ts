import { BadRequestException, Controller, Delete, Get, Param, ParseIntPipe, Put, Query } from '@nestjs/common';
import { SocialService } from './social.service';
import { ApiQuery, ApiParam, ApiTags, ApiNotFoundResponse, ApiBadRequestResponse, ApiForbiddenResponse, ApiOkResponse } from '@nestjs/swagger';
import { Friend } from 'src/entities/Friend.entity';
import { UserRequest } from 'src/user/user.decorator';
import { User } from 'src/entities/User.entity';

@ApiTags('social')
@Controller('social')
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
		@ApiParam({ name: 'otherID', type: 'number', required: true, description: 'The ID of the user who wants to be followed' })
	async followUser(
		@UserRequest() user: User,
		@Param('otherID', ParseIntPipe) otherID: number
	)
	{
		return await this.socialService.follow(user.id, otherID);
	}

	@Delete(':otherID/unfollow')
		@ApiBadRequestResponse({description: 'Bad Request'})
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiForbiddenResponse({description: 'Forbidden'})
		@ApiOkResponse({ description: 'It returns the removed object', type: Friend })
		@ApiParam({ name: 'otherID', type: 'number', required: true, description: 'The ID of the user who wants to be unfollowed' })
	async unfollowUser(
		@UserRequest() user: User,
		@Param('otherID', ParseIntPipe) otherID: number
	)
	{
		return await this.socialService.unfollow(user.id, otherID);
	}

	@Put(':otherID/block')
		@ApiBadRequestResponse({description: 'Bad Request'})
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiForbiddenResponse({description: 'Forbidden'})
		@ApiOkResponse({ description: 'It returns the (created or modified) object', type: Friend })
		@ApiParam({ name: 'recieverID', type: 'number', required: true, description: 'The ID of the user who wants to be blocked' })
	async blockUser(
		@UserRequest() user: User,
		@Param('otherID', ParseIntPipe) otherID: number
	)
	{
		return await this.socialService.block(user.id, otherID);
	}

	@Delete(':otherID/unblock')
		@ApiBadRequestResponse({description: 'Bad Request'})
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiForbiddenResponse({description: 'Forbidden'})
		@ApiOkResponse({ description: 'It returns the removed object', type: Friend })
		@ApiParam({ name: 'otherID', type: 'number', required: true, description: 'The ID of the user who wants to be unblocked' })
	async unblockUser(
		@UserRequest() user: User,
		@Param('otherID', ParseIntPipe) otherID: number
	)
	{
		return await this.socialService.unblock(user.id, otherID);
	}

	@Get(':userID')
		@ApiBadRequestResponse({description: 'Bad Request'})
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiOkResponse({ description: 'All friendships', type: Friend, isArray: true })
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
	@Get()
		@ApiBadRequestResponse({description: 'Bad Request'})
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiOkResponse({ description: 'All friendships', type: Friend, isArray: true })
		@ApiQuery({ name: 'filter', type: 'string', required: false, description: 'The type of friendships to get (pending, accepted, blocked, sent)' })
		@ApiQuery({ name: 'otherID', type: 'number', required: false, description: 'The friendship between userID and otherID' })
	async getSocialByRequest(
		@UserRequest() user: User,
		@Query('filter') filter: string,
		@Query('otherID') otherID: string
	)
	{
		return await this.getSocial(user.id, filter, otherID);
	}
}
