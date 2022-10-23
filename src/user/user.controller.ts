import { Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AuthenticateGuard } from "src/auth/utils/Guards";
import { User } from "src/entities/User.entity";
import { UserService } from "./user.service";
import { query, Request } from "express";

@Controller()
export class UserController {
	constructor(private readonly userService: UserService) {}


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
	@UseGuards(AuthenticateGuard)
	async all(): Promise<User[]> {
		return await this.userService.userRepository.find({
			relations: ['membership', 'game_history']
		});
	}

	@Get('addgame')
	async addgame(@Req() request: Request) {
		if (!request.user)
			return { msg: 'fail' };
		const user = await this.userService.userRepository.findOne({
				where: {
					username: request.user.username,
				},
				relations: ['game_history']
			});

		if (!user)
			return { msg: 'fail' };
		const newGame = this.userService.GamesRepository.create({
			winnerScore: Math.floor(Math.random() * 10),
			loserScore: Math.floor(Math.random() * 10),
		});

		const savedGame = await this.userService.GamesRepository.save(newGame);

		user.game_history.push(savedGame);
		return this.userService.userRepository.save(user)
	}
}