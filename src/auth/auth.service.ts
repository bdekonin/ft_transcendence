import { Injectable} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Player } from "src/typeorm/entities/Player";
import { PlayerDetails } from "src/utils/types";
import { Repository } from "typeorm";

@Injectable()
export class AuthService {

	constructor(
		@InjectRepository(Player) private readonly playerRepository:
		Repository<Player>,
	) {}

	async validateUser(details: PlayerDetails) {
		console.log('AuthService');
		console.log(details);

		const user = await this.playerRepository.findOneBy({id: details.id})

		if (user)
			return user;
		console.log('User not found. Creating...');
		const newUser = this.playerRepository.create(details);
		return this.playerRepository.save(newUser);
	}

	async findUserById(id: number)
	{
		const user = await this.playerRepository.findOneBy({ id });
		return user;
	}
}

