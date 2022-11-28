import { ExtractJwt, Strategy, JwtPayload } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConsoleLogger, ImATeapotException, Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
	private readonly authService: AuthService,
  ) {
	console.log('JwtStrategy Constructor');
	super({
	  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	  ignoreExpiration: false,
	  secretOrKey: jwtConstants.secret,
	});
  }

  async validate({ iat, exp, sub, oauthID }: JwtPayload, done) {

	console.log(sub, oauthID);
	// const user = await
	const user = await this.authService.validateUser({
		oauthID: oauthID,
	});
	console.log('user jwt strategy', user);
	if (!user)
		return new UnauthorizedException('No User Found in validate:' + __filename);
	if (!user.username)
		throw new ImATeapotException('Missing information');

	console.log('validate IS DONE0');
	done(null, user);
  }
}