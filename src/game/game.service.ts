import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameHistory } from 'src/entities/GameHistory.entity';
import { User } from 'src/entities/User.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateGameDTO } from './game.dto';

@Injectable()
export class GameService {
	constructor(
		@InjectRepository(GameHistory) public gameRepo: Repository<GameHistory>,
		private userService: UserService,
	) {}


	async create(gameDTO: CreateGameDTO) : Promise<GameHistory> {
		if (gameDTO.winner == gameDTO.loser) {
			throw new BadRequestException('Winner and loser cannot be the same.');
		}
		const winner = await this.userService.findUserById(gameDTO.winner);
		const loser = await this.userService.findUserById(gameDTO.loser);

		/* Checks */
		if (!winner || !loser) {
			throw new NotFoundException('Winner or Loser not found.');
		}
		if (gameDTO.winnerScore < 0 || gameDTO.loserScore < 0) {
			throw new BadRequestException('Scores cannot be negative.');
		}
		if (gameDTO.loserScore > gameDTO.winnerScore)
			throw new BadRequestException('Loser score cannot be greater than winner score.');

		/* Create Game */
		const game = this.gameRepo.create({
			loser: loser,
			winner: winner,
			draw: (gameDTO.winnerScore == gameDTO.loserScore),
			loserScore: gameDTO.loserScore,
			winnerScore: gameDTO.winnerScore,
			mode: gameDTO.mode,
		});

		/* Update user stats */
		if (game.draw == false) {
			loser.loses++;
			winner.wins++;
			this.userService.save(loser);
			this.userService.save(winner);
		}
		return this.gameRepo.save(game);
	}

	async getMatchByUser(userID: number, filter: string): Promise<GameHistory[]> {
		const user = await this.userService.findUserById(userID);
		if (!user) {
			throw new NotFoundException(`User Not Found`);
		}
		if (!filter) {
			return await this.listAll(user, userID);
		}
		else if (filter == 'won') {
			return await this.listWon(user, userID);
		}
		else if (filter == 'lost') {
			return await this.listLost(user, userID);
		}
		else if (filter == 'draw') {
			return await this.listDraw(user, userID);
		}
		else
			throw new BadRequestException(`Invalid filter`);
	}

	async getMatch(id: number): Promise<GameHistory> {
		const game = await this.gameRepo.findOneBy({ id: id });
		if (!game) {
			throw new NotFoundException(`Game Not Found`);
		}
		return game;
	}


	/* Helper Functions */
	private async listAll(user: User, id: number) : Promise<GameHistory[]> {
		return await this.gameRepo.find({
			relations: ['winner', 'loser'],
			where: [
				{ winner: { id: user.id } },
				{ loser: { id: user.id } },
			],
		});
	}
	private async listWon(user: User, id: number) : Promise<GameHistory[]> {
		return await this.gameRepo.find({
			relations: ['winner', 'loser'],
			where: [
				{ winner: { id: user.id }, draw: false },
			],
		});
	}
	private async listLost(user: User, id: number) : Promise<GameHistory[]> {
		return await this.gameRepo.find({
			relations: ['winner', 'loser'],
			where: [
				{ loser: { id: user.id }, draw: false },
			],
		});
	}
	private async listDraw(user: User, id: number) : Promise<GameHistory[]> {
		return await this.gameRepo.find({
			relations: ['winner', 'loser'],
			where: [
				{ winner: { id: user.id }, draw: true },
				{ loser: { id: user.id } , draw: true},
			],
		});
	}
}
