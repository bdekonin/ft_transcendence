import { Injectable} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserService } from "src/user/user.service";
import { Repository } from "typeorm";
import { UserDetails } from "./utils/types";
import { JwtService } from '@nestjs/jwt';
import { User } from "src/entities/User.entity";
import { jwtConstants } from "./utils/constants";

@Injectable()
export class AuthService {

	constructor(
		public userService: UserService,
		private jwtService: JwtService,
	) {}

	async validateUser(details: UserDetails) {
		const user = await this.getPlayerRepository().findOneBy({
			oauthID: details.oauthID,
		});

		if (user)
			return user;
		
		const newUser = this.getPlayerRepository().create(details);
		return this.getPlayerRepository().save(newUser);
	}

	getPlayerRepository() {
		return this.userService.userRepository;
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


	/* Jwt */

	createToken(user: User, twofa_verified: boolean) {		
		return (
			// expiresIn: 3600,
			this.jwtService.sign({ sub: user.id, oauthID: user.oauthID, twofa_verified: twofa_verified })
			// user,
		)
	}

	async verifyJWT(token: string): Promise<any> {
		const options = { secret: process.env.JWT_SECRET };
		try {
			return await this.jwtService.verify(token, options);
		} catch (error) {
			return null;
		}
	}
}
