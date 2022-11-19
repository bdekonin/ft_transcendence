import { ExecutionContext, Injectable, CanActivate, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

@Injectable()
export class FortyTwoAuthGuard extends AuthGuard('42') {
	async canActivate(context: ExecutionContext) {
		const activate = (await super.canActivate(context)) as boolean;
		const request = context.switchToHttp().getRequest();
		await super.logIn(request);
		return activate;
	}
}

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
	async canActivate(context: ExecutionContext) {
		const activate = (await super.canActivate(context)) as boolean;
		const request = context.switchToHttp().getRequest();
		await super.logIn(request);
		return activate;
	}
}

/* This function checks if there is a session and returns true if is correct. Else false.
// Can be used to check if the incoming request if authenticated or not */
@Injectable()
export class AuthenticateGuard implements CanActivate {
	canActivate(
		context: ExecutionContext,
	  ): boolean | Promise<boolean> | Observable<boolean> {
		const request = context.switchToHttp().getRequest();
		if (request.user)
			return true;
		throw new UnauthorizedException('The access token is expired, revoked, malformed, or invalid.');
	}
}
