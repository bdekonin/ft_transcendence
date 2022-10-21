import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { GameHistory } from "src/entities/GameHistory.entity";
import { User } from "src/entities/User.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(GameHistory) public GamesRepository:
		Repository<GameHistory>,
		@InjectRepository(User) public userRepository:
		Repository<User>, 
	) {}

	// constructor(
	// 	private userService: UserService,
	// 	@InjectRepository(Membership) public membershipRepo:
	// 	Repository<Membership>,
	// ) {}
	/* Find functions */
	async findUserById(idArg: number): Promise<User>
	{
		const user = await this.userRepository.findOneBy({
			id:idArg
		});
		return user;
	}
	async findUserByUsername(usernameArg: string): Promise<User>
	{
		const user = await this.userRepository.findOneBy({
			username:usernameArg
		});
		return user;

	}
	async findUserByIdUsername(idArg:number, usernameArg: string): Promise<User>
	{
		const user = await this.userRepository.findOneBy({
			id: idArg,
			username:usernameArg
		});
		return user;
	}

	async all(): Promise<User[]> {
		// this.GamesRepository.clear();
		return this.userRepository.find();
	}
}