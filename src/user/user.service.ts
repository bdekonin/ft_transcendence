import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Friend } from "src/entities/Friend.entity";
import { GameHistory } from "src/entities/GameHistory.entity";
import { User } from "src/entities/User.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(GameHistory) public GamesRepository:
			Repository<GameHistory>,
		@InjectRepository(Friend) public friendsRepository:
			Repository<Friend>,
		@InjectRepository(User) public userRepository:
			Repository<User>,
	) { }

	async findUserById(idArg: number): Promise<User> {
		const user = await this.userRepository.findOneBy({
			id: idArg
		});
		return user;
	}
	async findUserByUsername(usernameArg: string): Promise<User> {
		const user = await this.userRepository.findOneBy({
			username: usernameArg
		});
		return user;

	}
	async findUserByIdUsername(idArg: number, usernameArg: string): Promise<User> {
		const user = await this.userRepository.findOneBy({
			id: idArg,
			username: usernameArg
		});
		return user;
	}

	async all(): Promise<User[]> {
		// this.GamesRepository.clear();
		return this.userRepository.find();
	}
}