import { forwardRef, Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppModule } from "src/app.module";
import { Chat } from "src/entities/Chat.entity";
import { Friend } from "src/entities/Friend.entity";
import { Membership } from "src/entities/Membership.entity";
import { Message } from "src/entities/Message.entity";
import { User } from "src/entities/User.entity";
import { MembershipService } from "src/user/membership/membership.service";
import { UserController } from "src/user/user.controller";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";
import { AuthService } from "../auth.service";
import { TwoFAController } from "./TwoFA.controller";
// import { TwoFAService } from "./TwoFA.service";

@Module({
	imports: [
        forwardRef(() => AppModule),
        UserModule,
        TypeOrmModule.forFeature([Chat, User, Message, Membership, Friend]),
    ],
	controllers: [TwoFAController, UserController],
	providers: [
        MembershipService,
        {
            provide: 'AUTH_SERVICE',
            useClass: AuthService,
        },
        JwtService,
        UserService
    ],

})

export class TwoFAModule {}