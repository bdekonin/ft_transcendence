import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Friend } from "src/entities/Friend.entity";
import { GameHistory } from "src/entities/GameHistory.entity";
import { User } from "src/entities/User.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
	constructor(
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

	async save(user: User): Promise<User> {
		return await this.userRepository.save(user);
	}

	async all(): Promise<User[]> {
		return this.userRepository.find();
	}
}