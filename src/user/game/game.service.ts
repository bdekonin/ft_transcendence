import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
		const loserScore = createGameDto.loserScore;
		const winnerScore = createGameDto.winnerScore;
		const draw = winnerScore === loserScore;

		if (loser == null)
			throw new HttpException('Loser does not exist.', HttpStatus.BAD_REQUEST);
		if (winner == null)
			throw new HttpException('Winner does not exist.', HttpStatus.BAD_REQUEST);
		if (loser.id == winner.id)
			throw new HttpException('Loser is equal to winner.', HttpStatus.BAD_REQUEST);
		if (loserScore < 0 || winnerScore < 0)
			throw new HttpException('Score cannot be negative.', HttpStatus.BAD_REQUEST);
		if (loserScore > winnerScore)
			throw new HttpException('Loserscore cannot be higher then the winners score.', HttpStatus.BAD_REQUEST);

		const game = this.gameRepo.create({
			loser: loser,
			winner: winner,
			draw: draw,
			loserScore: createGameDto.loserScore,
			winnerScore: createGameDto.winnerScore,
			mode: createGameDto.mode,
		});

		loser.loses++;
		winner.wins++;
		this.userService.save(loser);
		this.userService.save(winner);

		return this.gameRepo.save(game);
	}

	async delete(gameID: number) : Promise<GameHistory> {
		const game = await this.gameRepo.findOneBy({ id: gameID });
		if (game == null)
			throw new HttpException('Game does not exist.', HttpStatus.BAD_REQUEST);
		
		const winner = game.winner;
		const loser = game.loser;

		if (loser.loses == 0)
			throw new HttpException('Loser has never lost before.', HttpStatus.INTERNAL_SERVER_ERROR);
		if (winner.wins == 0)
			throw new HttpException('Winner has never won before.', HttpStatus.INTERNAL_SERVER_ERROR);
		loser.loses--;
		winner.wins--;
		this.userService.save(loser);
		this.userService.save(winner);

		return this.gameRepo.remove(game);
	}

	async list(id: number, status: string) : Promise<GameHistory[]> {
		if (status == 'all')
			return await this.listAll(id);
		else if (status == 'won')
			return await this.listWon(id);
		else if (status == 'lost')
			return await this.listLost(id);
		else if (status == 'draw')
			return await this.listDraw(id);
		console.log("error");
		throw new HttpException('Query does not match ("all", "won", "lost", "draw").', HttpStatus.BAD_REQUEST)
	}

	private async listAll(id: number) : Promise<GameHistory[]> {
		const user = await this.userService.findUserById(id);
		if (user == null)
			throw new HttpException('User does not exist.', HttpStatus.BAD_REQUEST);

		const games = await this.gameRepo.find({
			relations: ['winner', 'loser'],
			where: [
				{ winner: { id: user.id } },
				{ loser: { id: user.id } },
			],
		});
		return games;
	}
	private async listWon(id: number) : Promise<GameHistory[]> {
		const user = await this.userService.findUserById(id);
		if (user == null)
			throw new HttpException('User does not exist.', HttpStatus.BAD_REQUEST);

		const games = await this.gameRepo.find({
			relations: ['winner', 'loser'],
			where: [
				{ winner: { id: user.id }, draw: false },
				// { winner: { id: user.id } },
				// { loser: { id: user.id } },
				// { winner: { id: user.id }, draw: true },
				// { loser: { id: user.id } , draw: true},
			],
		});
		return games;
	}
	private async listLost(id: number) : Promise<GameHistory[]> {
		const user = await this.userService.findUserById(id);
		if (user == null)
			throw new HttpException('User does not exist.', HttpStatus.BAD_REQUEST);

		const games = await this.gameRepo.find({
			relations: ['winner', 'loser'],
			where: [
				{ loser: { id: user.id }, draw: false },
				// { winner: { id: user.id } },
				// { loser: { id: user.id } },
				// { winner: { id: user.id }, draw: true },
				// { loser: { id: user.id } , draw: true},
			],
		});
		return games;
	}
	private async listDraw(id: number) : Promise<GameHistory[]> {
		const user = await this.userService.findUserById(id);
		if (user == null)
			throw new HttpException('User does not exist.', HttpStatus.BAD_REQUEST);

		const games = await this.gameRepo.find({
			relations: ['winner', 'loser'],
			where: [
				{ winner: { id: user.id }, draw: true },
				{ loser: { id: user.id } , draw: true},
			],
		});
		return games;
	}
}
