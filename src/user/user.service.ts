import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Player } from "src/typeorm/entities/Player";
import { PlayerDetails } from "src/utils/types";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(Player) public playerRepository:
		Repository<Player>,
	) {}
	/* Find functions */
	async findUserById(idArg: number)
	{
		const user = await this.playerRepository.findOneBy({
			id:idArg
		});
		return user;
	}
	async findUserByUsername(usernameArg: string)
	{
		const user = await this.playerRepository.findOneBy({
			username:usernameArg
		});
		return user;
	}
	async findUserByIdUsername(idArg:number, usernameArg: string)
	{
		const user = await this.playerRepository.findOneBy({
			id: idArg,
			username:usernameArg
		});
		return user;
	}

}