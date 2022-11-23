import { HttpException } from "@nestjs/common";

export class NotModifiedException extends HttpException{
	constructor(message: string) { 
		super(message, 304); 
	} 
}

export class UserNotFoundException extends HttpException{
	constructor() { 
		super("User Not Found", 404); 
	} 
}

export class UnauthorizedTokenException extends HttpException{
	constructor() { 
		super('The access token is expired, revoked, malformed, or invalid.', 401); 
	} 
}
