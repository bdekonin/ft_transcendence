import { Injectable} from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { PlayerDetails } from "src/utils/types";

@Injectable()
export class AuthService {

	constructor(
		private userService: UserService
	) {}

	async validateUser(details: PlayerDetails) {
		console.log('AuthService');
		console.log(details);

		const user = await this.getPlayerRepository().findOneBy({
			id: details.id,
			username: details.username
		});

		if (user)
			return user;
		console.log('User not found. Creating...');
		const newUser = this.getPlayerRepository().create(details);
		return this.getPlayerRepository().save(newUser);
	}

	getPlayerRepository() {
		return this.userService.playerRepository;
	}

	async findUserById(id: number)
	{
		return await this.userService.findUserById(id)
	}
	async findUserByUsername(username: string)
	{
		return await this.userService.findUserByUsername(username);
	}
	async findUserByIdUsername(idArg:number, usernameArg: string)
	{
		return await this.userService.findUserByIdUsername(idArg, usernameArg)
	}
}

