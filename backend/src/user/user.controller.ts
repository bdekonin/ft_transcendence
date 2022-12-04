import { Body, Controller, Delete, FileTypeValidator, Get, HttpCode, MaxFileSizeValidator, NotFoundException, Param, ParseFilePipe, ParseIntPipe, Patch, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { User } from "src/entities/User.entity";
import { UserService } from "./user.service";
import { ApiTags, ApiOkResponse, ApiNotFoundResponse, ApiParam, ApiBody, ApiNoContentResponse } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { updateUserDto } from "./user.dto";
import { UserRequest } from "./user.decorator";
import { AuthenticateGuard } from "src/auth/utils/Guards";
import { Request } from "express";
import { AuthGuard } from "@nestjs/passport";
import { JwtAuthGuard, JwtAuthGuardPatch } from "src/auth/utils/jwt-auth.guard";

@ApiTags('user')
@Controller('/user/')
export class UserController {
	constructor(private readonly userService: UserService) {}

	// General
	@Get('all')
	@UseGuards(JwtAuthGuard)
		@ApiOkResponse({ description: 'Returns all users', type: User })
	// @UseGuards(AuthenticateGuard)
	async getAllUsers()
	{
		const users = await this.userService.userRepository.find({
			relations: ['membership']
		});
		// loop through users and remove if two is enabled
		for (let i = 0; i < users.length; i++) {
			delete users[i].twofa;
		}
		for (let i = 0; i < users.length; i++) {
			delete users[i].oauthID;
		}
		return users;
	}

	// Profile settings
	@Get(':userID/avatar')
	@UseGuards(JwtAuthGuard)
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiOkResponse({ description: 'Returns the image of the userID'})
	async getUserAvatarByID(
		@Param('userID', ParseIntPipe) userID: number,
		@Res() res
	)
	{
		return await this.userService.getAvatar(userID, res);
	}

	@Get('/avatar')
	@UseGuards(JwtAuthGuard)
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiOkResponse({ description: 'Returns the image of the userID'})
	async getUserAvatar(
		@UserRequest() user: User,
		@Res() res
	)
	{
		return await this.userService.getAvatar(user.id, res);
	}

	@Post('avatar')
	@UseGuards(JwtAuthGuardPatch)
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiOkResponse({ description: 'Returns the image of the userID'})
	@UseInterceptors(FileInterceptor('file'))
	async setUserAvatar(
		@UserRequest() user: User,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 1 /* 1 mb */ }),
					// new FileTypeValidator({ fileType: 'png'}),
				]
			})
		)
		file: Express.Multer.File
	)
	{
		return this.userService.postAvatar(user.id, file.filename);
	}
	@Delete('avatar')
	@UseGuards(JwtAuthGuard)
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiNoContentResponse({ description: 'Delete current image and reverts to default.jpeg'})
	@HttpCode(204)
	async deleteUserAvatar(
		@UserRequest() user: User,
	)
	{
		return this.userService.deleteAvatar(user.id);
	}

	/* twoFactor */
	@Get('twofa/')
	@UseGuards(JwtAuthGuard)
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiOkResponse({ description: 'Returns if the user has 2fa enables', type: Boolean })
	async getUsertwoFA(
		@UserRequest() user: User,
	)
	{
		return await this.userService.getTwoFA(user.id);
	}

	// @Get('/me')

	/* Profile */
	@Get()
	@UseGuards(JwtAuthGuard)
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiOkResponse({ description: 'Returns everything about the user', type: User })
	async getUser(
		@UserRequest() user: User
	): Promise<User> {

		const foundUser = await this.userService.userRepository.findOne({
			where: {id: user.id},
			relations: ['membership', 'games_won', "games_lost", 'sentFriendRequests', 'receivedFriendRequests', 'chats']
		});
		if(!foundUser) {
			throw new NotFoundException('User Not Found');
		}

		// combine games_won and games_lost
		// foundUser['games'] = foundUser.games_lost.concat(foundUser.games_won).sort((a, b) => {
		// 	return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
		// });
		// delete foundUser.games_won;
		// delete foundUser.games_lost;
		return foundUser;
	}
	@Get(':username')
	@UseGuards(JwtAuthGuard)
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiOkResponse({ description: 'Returns everything about the user', type: User })
		@ApiParam({ name: 'username', type: 'string', required: true })
	async getUserbyID(
		@Param('username') username: string
	): Promise<User> {

		const user = await this.userService.userRepository.findOne({
			where: {username: username},
			relations: ['membership', 'games_won', "games_lost", 'sentFriendRequests', 'receivedFriendRequests', 'chats']
		});
		if(!user) {
			throw new NotFoundException('User Not Found');
		}
		return user;
	}

	@Patch()
	@UseGuards(JwtAuthGuardPatch)
		@ApiNotFoundResponse({description: 'User not found'})
		@ApiOkResponse({ description: 'returns the updates user object', type: User })
		@ApiBody({ type: updateUserDto })
	async updateUser(
		@UserRequest() user: User,
		@Body() body: updateUserDto
	)
	{
		return await this.userService.updateUser(user.id, body);
	}
}