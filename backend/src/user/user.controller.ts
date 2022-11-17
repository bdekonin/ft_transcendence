import { BadRequestException, Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, NotFoundException, Param, ParseFilePipe, ParseIntPipe, Patch, Post, Put, Query, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { User } from "src/entities/User.entity";
import { UserService } from "./user.service";
import { ApiTags, ApiBadRequestResponse, ApiNotFoundResponse, ApiForbiddenResponse, ApiOkResponse, ApiParam } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";

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
		const user = await this.userService.findUserById(userID);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		res.set({
			'Content-Type': `image/jpeg`
		});
		return res.sendFile(user.avatar, { root: 'uploads' });
	}
	@Post(':userID/avatar')
	@UseInterceptors(FileInterceptor('image'))
	async setUserAvatar(
		@Param('userID', ParseIntPipe) userID: number,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 30000 }),
					new FileTypeValidator({ fileType: 'jpeg'}),
				]
			})
		)
		file: Express.Multer.File
	)
	{
		const user = await this.userService.findUserById(userID);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		user.avatar = file.filename;
		return await this.userService.save(user);
	}
	@Delete(':userID/avatar')
	async deleteUserAvatar(
		@Param('userID', ParseIntPipe) userID: number,
	)
	{
		const user = await this.userService.findUserById(userID);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		user.avatar = null;
		return await this.userService.save(user);

		return {
			"success": true
		};
	}

	@Get(':userID/2fa/')
	async getUser2FA(
		@Param('userID', ParseIntPipe) userID: number,
	)
	{
		return {
			"enabled": false
		};
	}
	@Patch(':userID/2fa/')
	async setUser2FA(
		@Param('userID', ParseIntPipe) userID: number
	)
	{
		return {
			"success": true
		};
	}

	@Get(':userID')
	async getUser(
		@Param('userID', ParseIntPipe) userID: number
	)
	{
		return {
			"id": 42,
			"username": "bdekonin",
			"avatar": "example.jpg",
			"membership": {
				"id": 1,
				"role": "ADMIN",
				"isBanned": false,
				"isMuted": false
			},
			"level": 3,
			"wins": 4,
			"losses": 2,
			"twofa": false,
			"gamehistory": [
				{
					"id": 1,
					"mode": "1v1",
					"winner": 42,
					"loser": 43,
					"winnerScore": 10,
					"loserScore": 5,
					"draw": false,
					"date": "1668172775"
				},
			],
			"friends": [
				{
					"id": 43,
					"username": "rkieboom",
					"avatar": "example.jpg",
					"membership": {	
						"id": 2,
						"role": "USER",
						"isBanned": false,
						"isMuted": false
					},
					"level": 2,
					"wins": 3,
					"losses": 1,
					"twofa": false
				}
			],
			"createdAt": "2020-01-01 00:00:00"
		  }
	}
	@Patch(':userID')
	async updateUser(
		@Param('userID', ParseIntPipe) userID: number
	)
	{
		return {
			"success": true
		};
	}

	// Etc




	@Get(':id/addwin')
	async setWin(
		@Param('id', ParseIntPipe) id: number
	) {
		const user = await this.userService.findUserById(id);

		user.wins++;
		console.log(user.username + ' has won! [' + user.wins + ']');

		this.userService.userRepository.save(user);
		return { msg: 'wins is increased by one for ' + id }
	}

	@Get('all')
	async all(): Promise<User[]> {
		return await this.userService.userRepository.find({
			relations: ['membership', 'games_won', "games_lost", 'sentFriendRequests', 'receivedFriendRequests']
		});
	}
}