import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Player } from "src/typeorm/entities/Player";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
	imports: [TypeOrmModule.forFeature([Player])],
	controllers: [UserController],
	providers: [UserService]
})
export class UserModule {}