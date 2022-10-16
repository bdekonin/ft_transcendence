import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Player } from "src/typeorm/entities/Player";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { FortyTwoStrategy } from "./utils/FortyTwoStrategy";
import { SessionSerializer } from "./utils/Serializer";

@Module({
	imports: [TypeOrmModule.forFeature([Player])],
	controllers: [AuthController],
	providers: [
		FortyTwoStrategy, AuthService, SessionSerializer,
		{
			provide: 'AUTH_SERVICE',
			useClass: AuthService,
		},
	],
})
export class AuthModule {}