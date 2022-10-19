import { Body, Controller, Post, Req, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { json } from "stream/consumers";
import { UserService } from "./user.service";

@Controller()
export class UserController {
	constructor(private readonly userService: UserService) {}
}