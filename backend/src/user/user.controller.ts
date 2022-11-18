import { Body, Controller, Delete, FileTypeValidator, Get, HttpCode, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Patch, Post, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { User } from "src/entities/User.entity";
import { UserService } from "./user.service";
import { ApiTags, ApiOkResponse } from "@nestjs/swagger";
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
	async getUserAvatar(
		@Param('userID', ParseIntPipe) userID: number,
		@Res() res
	)
	{
		return await this.userService.getAvatar(userID, res);
	}
	@Post(':userID/avatar')
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
	@HttpCode(204)
	async deleteUserAvatar(
		@Param('userID', ParseIntPipe) userID: number,
	)
	{
		return this.userService.deleteAvatar(userID);
	}

	/* twoFactor */
	@Get(':userID/twofa/')
	async getUsertwoFA(
		@Param('userID', ParseIntPipe) userID: number,
	)
	{
		return await this.userService.getTwoFA(userID);
	}

	/* Profile */
	@Get(':userID')
	async getUser(
		@Param('userID', ParseIntPipe) userID: number
	): Promise<User[]> {
		return await this.userService.userRepository.find({
			where: {id: userID},
			relations: ['membership', 'games_won', "games_lost", 'sentFriendRequests', 'receivedFriendRequests']
		});
	}
	@Patch(':userID')
	async updateUser(
		@Param('userID', ParseIntPipe) userID: number,
		@Body() body: updateUserDto
	)
	{
		return await this.userService.updateUser(userID, body);
	}
}