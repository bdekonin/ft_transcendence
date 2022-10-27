import { Body, Controller, Post } from '@nestjs/common';
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
		// createGameDto.
		console.log(createGameDto.loser);
		return this.gameService.create(createGameDto);
	}
}
