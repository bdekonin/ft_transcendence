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