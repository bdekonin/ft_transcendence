import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	ImATeapotException,
	Inject,
	Injectable,
	UnauthorizedException,
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';
  
@Injectable()
export class JwtAuthGuard implements CanActivate {
		constructor(
			@Inject('AUTH_SERVICE') private authService: AuthService,
		) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();

		const token = request.cookies.jwt;
		if (token == undefined || token == '') {
			throw new UnauthorizedException('No token provided');
		}
		const obj = await this.authService.verifyJWT(token);
		if (!obj)
			throw new UnauthorizedException('Object is undefined');


		const user = await this.authService.validateUser({
			oauthID: obj.oauthID,
		});
		if (!user)
			throw new UnauthorizedException('No User Found');
		if (!user.username || user.username === '')
			throw new ImATeapotException("Missing information. Please contact the administrator");

		request.user = user;
		return true;
	}
}

  @Injectable()
  export class JwtAuthGuardPatch implements CanActivate {
		constructor(
			@Inject('AUTH_SERVICE') private authService: AuthService,
		) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();

		const token = request.cookies.jwt;
		if (token == undefined || token == '') {
			throw new UnauthorizedException('No token provided');
		}
		const obj = await this.authService.verifyJWT(token);
		if (!obj)
			throw new UnauthorizedException('Object is undefined');


		const user = await this.authService.validateUser({
			oauthID: obj.oauthID,
		});
		request.user = user;
		return true;
	}
}