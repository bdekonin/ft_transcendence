import { BadRequestException, Body, Controller, Delete, FileTypeValidator, Get, Param, ParseIntPipe, Patch, Put, Query, Res } from "@nestjs/common";
import { User } from "src/entities/User.entity";
import { UserService } from "./user.service";


@Controller('/user/')
export class UserController {
	constructor(private readonly userService: UserService) {}

	// General
	@Get()
	async getAllUsers()
	{
		const users = await this.userService.userRepository.find({
			// relations: ['membership']
			relations: ['membership']
		});
		// loop through users and remove if two is enabled
		for (let i = 0; i < users.length; i++) {
			delete users[i].twofa;
		}
		return users;
		return [
			{
			  "id": 60939,
			  "username": "bdekonin",
			  "avatar": "https://cdn.intra.42.fr/users/0135610cd6a33554bf913d0193ba3eb6/bdekonin.jpg",
			  "level": 0,
			  "wins": 0,
			  "loses": 0,
			  "createdAt": "2022-10-26T16:08:01.650Z",
			  "membership": {
				"id": 1,
				"role": "user",
				"banned": false,
				"muted": false
			  }
			},
			{
			  "id": 116054,
			  "username": "Dopee",
			  "avatar": "https://cdn.intra.42.fr/users/medium_default.png",
			  "level": 0,
			  "wins": 0,
			  "loses": 0,
			  "createdAt": "2022-10-26T16:08:42.243Z",
			  "membership": {
				"id": 2,
				"role": "user",
				"banned": false,
				"muted": false
			  }
			}
		  ]
	}

	// Games
	@Get(':userID/matches')
	async getUsersGames(
		@Param('userID', ParseIntPipe) userID: number,
		@Query('filter') filter: string
	)
	{
		if (filter != 'won' && filter != 'lost' && filter != 'draw' && filter != undefined)
			throw new BadRequestException('Query parameter is not valid');

		return   [
			{
			  "id": 25,
			  "mode": "1v1",
			  "winner": userID,
			  "loser": 12092,
			  "winnerScore": 8,
			  "loserScore": 5,
			  "draw": false,
			  "date": "1668172775"
			},
			{
				"id": 27,
				"mode": "1v1",
				"winner": 16379,
				"loser": userID,
				"winnerScore": 1,
				"loserScore": 5,
				"draw": false,
				"date": "1668172775"
			  },
			  {
				"id": 37,
				"mode": "1v1",
				"winner": 15975,
				"loser": userID,
				"winnerScore": 10,
				"loserScore": 10,
				"draw": true,
				"date": "1668172775"
			  }
		  ];
	}

	// Profile settings
	@Get(':userID/avatar')
	async getUserAvatar(
		@Param('userID', ParseIntPipe) userID: number,
		@Res() res
	)
	{
		return res.sendFile('rkieboom.jpeg', { root: 'tmpsrc/assets' });
	}
	@Patch(':userID/avatar')
	async setUserAvatar(
		@Param('userID', ParseIntPipe) userID: number,
	)
	{
		return {
			"success": false
		};
	}
	@Delete(':userID/avatar')
	async deleteUserAvatar(
		@Param('userID', ParseIntPipe) userID: number,
	)
	{
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