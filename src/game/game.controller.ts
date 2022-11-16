import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { GameHistory } from 'src/entities/GameHistory.entity';
import { CreateGameDTO } from './game.dto';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
	constructor(
		private readonly gameService: GameService,
	) {}

	@Get('userID/:userID')
	async getGameByUserID(
		@Param('userID', ParseIntPipe) userID: number,
		@Query('filter') filter: string,
	) {
		return await this.gameService.getMatchByUser(userID, filter);
	}

	@Get('gameID/:gameID')
	async getGameByGameID(
		@Param('gameID', ParseIntPipe) gameID: number,
	) {
		return await this.gameService.getMatch(gameID);
	}


	@Post('create')
	async createGame(@Body() gameDTO: CreateGameDTO) : Promise<GameHistory> {
		return await this.gameService.create(gameDTO);
	}
}
