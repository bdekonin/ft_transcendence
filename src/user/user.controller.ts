import { Controller, Get } from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";
import { User } from "src/entities/User.entity";
import { UserService } from "./user.service";

@Controller()
export class UserController {
	constructor(private readonly userService: UserService) {}


	@Get('all')
	async all(): Promise<User[]> {
		return this.userService.all();
	}

	@Get('test')
	async test(): Promise<User[]> {
		return await this.userService.userRepository.find({
			relations: ['membership', 'game_history']
		});
	}

	@Get('addgame')
	async addgame() {
		const user = await this.userService.userRepository.findOne({
				where: {
					username: 'bdekonin',
				},
				relations: ['game_history', 'membership']
			});

		if (!user)
			return { msg: 'fail' };
		const newGame = this.userService.GamesRepository.create({
			winnerScore: Math.floor(Math.random() * 10),
			loserScore: Math.floor(Math.random() * 10),
		});

		const savedGame = await this.userService.GamesRepository.save(newGame);

		user.game_history.push(savedGame);
		return this.userService.userRepository.save(user)
	}
}