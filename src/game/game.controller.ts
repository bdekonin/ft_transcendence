import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiParam, ApiTags, ApiNotFoundResponse, ApiBadRequestResponse, ApiForbiddenResponse, ApiOkResponse } from '@nestjs/swagger';
import { GameHistory } from 'src/entities/GameHistory.entity';
import { CreateGameDTO } from './game.dto';
import { GameService } from './game.service';

@ApiTags('game')
@Controller('game')
export class GameController {
	constructor(
		private readonly gameService: GameService,
	) {}

	@Get('userID/:userID')
		@ApiNotFoundResponse({description: 'Winner or Loser not found.'})
		@ApiBadRequestResponse({description: 'Bad Request'})
		@ApiForbiddenResponse({description: 'Forbidden'})
		@ApiOkResponse({ description: 'It returns the (created or modified) object', type: GameHistory, isArray: true })
		@ApiParam({ name: 'userID', type: 'number', required: true, description: 'The ID of the user who wants to see matches' })
		@ApiQuery({ name: 'filter', type: 'string', required: false, description: 'The type of matches to get (won, lost, draw)' })
	async getGameByUserID(
		@Param('userID', ParseIntPipe) userID: number,
		@Query('filter') filter: string,
	) {
		return await this.gameService.getMatchByUser(userID, filter);
	}


	@Get('gameID/:gameID')
		@ApiNotFoundResponse({description: 'Winner or Loser not found.'})
		@ApiBadRequestResponse({description: 'Bad Request'})
		@ApiForbiddenResponse({description: 'Forbidden'})
		@ApiOkResponse({ description: 'It returns the (created or modified) object', type: GameHistory })
		@ApiParam({ name: 'userID', type: 'number', required: true, description: 'The ID of the user who wants to see matches' })
	async getGameByGameID(
		@Param('gameID', ParseIntPipe) gameID: number,
	) {
		return await this.gameService.getMatch(gameID);
	}


	@Post('create')
		@ApiBody({ type: CreateGameDTO })
		@ApiNotFoundResponse({description: 'Winner or Loser not found.'})
		@ApiBadRequestResponse({description: 'Bad Request'})
		@ApiForbiddenResponse({description: 'Forbidden'})
		@ApiOkResponse({ description: 'It returns the (created or modified) object', type: GameHistory })
		@ApiParam({ name: 'userID', type: 'number', required: true, description: 'The ID of the user who wants to see matches' })
	async createGame(@Body() gameDTO: CreateGameDTO) : Promise<GameHistory> {
		return await this.gameService.create(gameDTO);
	}
}
