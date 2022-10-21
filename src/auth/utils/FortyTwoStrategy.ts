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
			clientID: 'u-s4t2ud-31d739729a66569fa3753c24bec5a62d62557111a6b9bd51a690afe5061f8cfc',
			clientSecret: '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',
			callbackURL: 'http://localhost:3000/auth/42/redirect',
			scope: ['public', 'profile']
		});
	}
	async validate(accessToken: string, refreshToken: string, profile: Profile) {
		console.log(accessToken);
		console.log(refreshToken);
		console.log(profile);
		const user = await this.authService.validateUser({
			id: profile.id,
			username: profile.username,
			avatar: profile.photos[0].value,
		});
		console.log('Validate');
		console.log(user);
		return user || null;
	}
}