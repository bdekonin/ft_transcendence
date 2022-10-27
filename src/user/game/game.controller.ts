import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { use } from 'passport';
import { GameHistory } from 'src/entities/GameHistory.entity';
import { CreateGameDTO } from './game.dto';
import { GameService } from './game.service';

@Controller('/user/game/')
export class GameController {
	constructor(private readonly gameService: GameService) {}

	// /user/:senderID/game/create

	/*
	{
		mode: '"1v1"',
		winner: "'10'",
		loser: '5',
		winnerScore: '8',
		loserScore: '5'
	}
	*/
	@Post('/create')
	async createGame(@Body() createGameDto: CreateGameDTO) : Promise<GameHistory> {
		return this.gameService.create(createGameDto);
	}

	@Delete('/delete/:gameID')
	async deleteGame(
		@Param('gameID') gameID: number
	) {
		this.gameService.delete(gameID);
	}

	@Get('/:userID/list')
	async list(
		@Param('userID') userID: number,
		@Query('status') status: string
	): Promise<GameHistory[]> {
		const games = await this.gameService.list(userID, status);
		return games;
		// throw new HttpException('Query does not match ("all", "won", "lost", "draw").', HttpStatus.BAD_REQUEST)
	}
}
