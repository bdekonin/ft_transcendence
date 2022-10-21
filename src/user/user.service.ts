import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/User.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User) public playerRepository:
		Repository<User>,
	) {}
	/* Find functions */
	async findUserById(idArg: number): Promise<User>
	{
		const user = await this.playerRepository.findOneBy({
			id:idArg
		});
		return user;
	}
	async findUserByUsername(usernameArg: string): Promise<User>
	{
		const user = await this.playerRepository.findOneBy({
			username:usernameArg
		});
		return user;

	}
	async findUserByIdUsername(idArg:number, usernameArg: string): Promise<User>
	{
		const user = await this.playerRepository.findOneBy({
			id: idArg,
			username:usernameArg
		});
		return user;
	}

}