import { Inject, Injectable, ParseIntPipe } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
// import { Profile } from 'passport';
import { Strategy, Profile } from 'passport-google-oauth20'
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
	constructor(
		@Inject('AUTH_SERVICE') private readonly authService: AuthService
	) {
		super({
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_CALLBACK_URL,
			scope: ['profile', 'email'],
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile) {
		const user = await this.authService.validateUser({
			username: profile.displayName.replace(' ', ""),
		});
		console.log('Validate Google');
		console.log(user);
		return user || null;
	}
}