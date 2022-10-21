import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Membership } from "src/entities/Membership.entity";
import { User } from "src/entities/User.entity";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { FortyTwoStrategy } from "./utils/FortyTwoStrategy";
import { SessionSerializer } from "./utils/Serializer";

@Module({
	imports: [UserModule, TypeOrmModule.forFeature([User, Membership])],
	controllers: [AuthController],
	providers: [
		UserService, FortyTwoStrategy, AuthService, SessionSerializer,
		{
			provide: 'AUTH_SERVICE',
			useClass: AuthService,
		},
	],
})
export class AuthModule {}