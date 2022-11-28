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
		console.log('JwtAuthGuard canActivate');

		const request = context.switchToHttp().getRequest();

		const token = request.cookies.jwt;
		if (token == undefined || token.accessToken == undefined) {
			throw new UnauthorizedException('No token provided');
		}
		const obj = await this.authService.verifyJWT(token.accessToken);
		console.log('obj', obj)

		if (!obj)
			throw new UnauthorizedException('Object is undefined');


		const user = await this.authService.validateUser({
			oauthID: obj.oauthID,
		});
		if (!user)
			throw new UnauthorizedException('No User Found');
		if (!user.username || user.username === '')
			throw new ImATeapotException("Missing information.");
		request.user = user;
		return true;
	}
}