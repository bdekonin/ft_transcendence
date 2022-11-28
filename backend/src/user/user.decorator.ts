import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UnauthorizedTokenException } from "src/utils/exceptions";

export const UserRequest = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();
		// if (request.user)
		console.log('UserRequest', request.user);
		return request.user;
		// throw new UnauthorizedTokenException();
	},
);