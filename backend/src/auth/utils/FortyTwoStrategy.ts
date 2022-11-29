import { ConsoleLogger, Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from 'passport-42';
import { AuthService } from "../auth.service";

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy) {
	constructor(
		@Inject('AUTH_SERVICE') private readonly authService: AuthService,
	) {
		super({
			// grant_type: 'client_credentials',
			clientID: process.env.FORTYTWO_CLIENT_ID,
			clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
			callbackURL: process.env.FORTYTWO_CALLBACK_URL,
			scope: ['public', 'profile']
		});
	}
	async validate(accessToken: string, refreshToken: string, profile: Profile) {
		const user = await this.authService.validateUser({
			// username: profile.username
			oauthID: profile.id,
		});
		return user || null;
	}
}