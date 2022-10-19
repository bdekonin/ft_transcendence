import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Player } from "src/typeorm/entities/Player";
import { PlayerDetails } from "src/utils/types";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(Player) private readonly playerRepository:
		Repository<Player>,
	) {}

	async setWins(details: PlayerDetails)
	{
		const user = await this.findUserById(details.id);

		user.wins++;

		await this.playerRepository.save(user);
	}

	async findUserById(id: number)
	{
		const user = await this.playerRepository.findOneBy({ id });
		return user;
	}
}