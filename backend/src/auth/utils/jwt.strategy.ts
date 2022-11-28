import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
	console.log('JwtStrategy');
	super({
	  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	  ignoreExpiration: false,
	  secretOrKey: jwtConstants.secret,
	});
  }

  async validate(payload: any) {
	console.log('JwtStrategy', payload);
	return {
		userID: payload.sub,
	};
  }
}