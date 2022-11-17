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
			clientID: '998440667106-hkk273j2gjau9jlbg3871es81ta3ejfh.apps.googleusercontent.com',
			clientSecret: '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',
			callbackURL: 'http://localhost:3000/auth/google/redirect',
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