import { BadRequestException, Body, Controller, Delete, FileTypeValidator, Get, HttpCode, MaxFileSizeValidator, NotFoundException, Param, ParseFilePipe, ParseIntPipe, Patch, Post, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { User } from "src/entities/User.entity";
import { UserService } from "./user.service";
import { ApiTags, ApiOkResponse, ApiNotFoundResponse, ApiParam, ApiBody, ApiNoContentResponse } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { updateUserDto } from "./user.dto";

@ApiTags('user')
@Controller('/user/')
export class UserController {
	constructor(private readonly userService: UserService) {}

	// General
	@Get()
		@ApiOkResponse({ description: 'Returns all users', type: User })
	async getAllUsers()
	{
		const users = await this.userService.userRepository.find({
			relations: ['membership']
		});
		// loop through users and remove if two is enabled
		for (let i = 0; i < users.length; i++) {
			delete users[i].twofa;
		}
		return users;
	}

	// Profile settings
	@Get(':userID/avatar')
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiOkResponse({ description: 'Returns the image of the userID'})
		@ApiParam({ name: 'otherID', type: 'number', required: true, description: 'The ID of the user' })
	async getUserAvatar(
		@Param('userID', ParseIntPipe) userID: number,
		@Res() res
	)
	{
		return await this.userService.getAvatar(userID, res);
	}
	@Post(':userID/avatar')
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiOkResponse({ description: 'Returns the image of the userID'})
		@ApiParam({ name: 'otherID', type: 'number', required: true, description: 'The ID of the user who wants to be followed' })
	@UseInterceptors(FileInterceptor('image'))
	async setUserAvatar(
		@Param('userID', ParseIntPipe) userID: number,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 1 /* 1 mb */ }),
					new FileTypeValidator({ fileType: 'jpeg'}),
				]
			})
		)
		file: Express.Multer.File
	)
	{
		return this.userService.postAvatar(userID, file.filename);
	}
	@Delete(':userID/avatar')
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiNoContentResponse({ description: 'Delete current image and reverts to default.jpeg'})
		@ApiParam({ name: 'otherID', type: 'number', required: true, description: 'The ID of the user who wants to be followed' })
	@HttpCode(204)
	async deleteUserAvatar(
		@Param('userID', ParseIntPipe) userID: number,
	)
	{
		return this.userService.deleteAvatar(userID);
	}

	/* twoFactor */
	@Get(':userID/twofa/')
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiOkResponse({ description: 'Returns if the user has 2fa enables', type: Boolean })
		@ApiParam({ name: 'otherID', type: 'number', required: true, description: 'The ID of the user who wants to be followed' })
	async getUsertwoFA(
		@Param('userID', ParseIntPipe) userID: number,
	)
	{
		return await this.userService.getTwoFA(userID);
	}

	// @Get('/me')

	/* Profile */
	@Get(':userID')
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiOkResponse({ description: 'Returns everything about the user', type: User })
		@ApiParam({ name: 'otherID', type: 'number', required: true, description: 'The ID of the user who wants to be followed' })
	async getUser(
		@Param('userID', ParseIntPipe) userID: number
	): Promise<User> {

		const user = await this.userService.userRepository.findOne({
			where: {id: userID},
			relations: ['membership', 'games_won', "games_lost", 'sentFriendRequests', 'receivedFriendRequests', 'chats']
		});
		if(!user) {
			throw new NotFoundException('User Not Found');
		}
		return user;
	}
	@Patch(':userID')
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiOkResponse({ description: 'returns the updates user object', type: User })
		@ApiBody({ type: updateUserDto })
		@ApiParam({ name: 'otherID', type: 'number', required: true, description: 'The ID of the user who wants to be followed' })
	async updateUser(
		@Param('userID', ParseIntPipe) userID: number,
		@Body() body: updateUserDto
	)
	{
		return await this.userService.updateUser(userID, body);
	}
}