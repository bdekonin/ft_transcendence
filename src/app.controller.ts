import { Controller, Get, Redirect, Req, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from "express";
import { AuthenticateGuard } from './auth/utils/Guards';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('home')
	@UseGuards(AuthenticateGuard)
  getHome(@Req() request: Request) {
    return { msg: request.user }
  }
}
