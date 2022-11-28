import { Injectable} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Membership, UserRole } from "src/entities/Membership.entity";
import { UserService } from "src/user/user.service";
import { Repository } from "typeorm";
import { UserDetails } from "./utils/types";
import { JwtService } from '@nestjs/jwt';
import { User } from "src/entities/User.entity";
import { jwtConstants } from "./utils/constants";

@Injectable()
export class AuthService {

	constructor(
		private userService: UserService,
		private jwtService: JwtService,
		@InjectRepository(Membership) public membershipRepo:
		Repository<Membership>,
	) {}

	async validateUser(details: UserDetails) {
		const user = await this.getPlayerRepository().findOneBy({
			oauthID: details.oauthID,
		});

		if (user)
			return user;
		
		const newMembership = this.membershipRepo.create();
		const savedMembership = await this.membershipRepo.save(newMembership);
		
		const newUser = this.getPlayerRepository().create(details);
		newUser.membership = savedMembership;
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

	createToken(user: User) {		
		return {
			// expiresIn: 3600,
			accessToken: this.jwtService.sign({ sub: user.id, oauthID: user.oauthID }),
			// user,
		}


	}

	async verifyJWT(token: string): Promise<any> {
		const options = { secret: jwtConstants.secret };
		// if (!token)
			// console.log('token', token);
			// catch error

		try {
			return await this.jwtService.verify(token, options);
		} catch (error) {
			console.log('error', error);
			return null;
		}
	}
}

