import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { FortyTwoStrategy } from "./utils/FortyTwoStrategy";

@Module({
	controllers: [AuthController],
	providers: [AuthService, FortyTwoStrategy],
})
export class AuthModule {}