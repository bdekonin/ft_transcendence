import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameHistory } from 'src/entities/GameHistory.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user.service';
import { CreateGameDTO } from './game.dto';

@Injectable()
export class GameService {
	constructor(
		@InjectRepository(GameHistory) public gameRepo: Repository<GameHistory>,
		private readonly userService: UserService
	) {}


	async create(createGameDto: CreateGameDTO) : Promise<GameHistory> {
		const loser = await this.userService.findUserById(createGameDto.loser);
		const winner = await this.userService.findUserById(createGameDto.winner);

		if (loser == null || winner == null)
			throw new Error('User not found');
		if (loser.id == winner.id)
			throw new Error('loser is equal to winner');

		const game = this.gameRepo.create({
			loser: loser,
			winner: winner,
			loserScore: createGameDto.loserScore,
			winnerScore: createGameDto.winnerScore,
			mode: createGameDto.mode,
		});
		return this.gameRepo.save(game);
	}
}
