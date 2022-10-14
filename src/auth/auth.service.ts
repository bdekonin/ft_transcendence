import { Body, Injectable, Ip } from "@nestjs/common";

@Injectable()
export class AuthService {

	signup() {
		return {msg: "I have signed up"}
	}
	
	signin() {
		return {msg: "I have signed sign"};
	}
}

