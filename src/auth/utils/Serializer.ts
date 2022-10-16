import { Inject, Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { Player } from "src/typeorm/entities/Player";
import { AuthService } from "../auth.service";

@Injectable()
export class SessionSerializer extends PassportSerializer {
	constructor(
		@Inject('AUTH_SERVICE') private readonly authService: AuthService,
	) {
		super();
	}

	serializeUser(user: Player, done: Function) {
		console.log('Serialize User');
		// console.log(user);
		done(null, user);
	}
	async deserializeUser(payload: Player, done: Function) {
		const user = await this.authService.findUserById(payload.id);
		console.log('Deserialize User');
		console.log(user);
		return user ? done(null, user) : done(null, null);
	}
}