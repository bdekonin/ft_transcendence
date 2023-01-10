import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from 'src/app.module';
import { GameHistory } from 'src/entities/GameHistory.entity';
import { User } from 'src/entities/User.entity';
import { UserController } from 'src/user/user.controller';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';

@Module({
	imports: [
		forwardRef(() => AppModule),
		UserModule, GameModule,
		TypeOrmModule.forFeature([GameHistory, User]),
	],
	controllers: [
		// UserController,
		GameController,
	],
	providers: [
		{
			provide: 'AUTH_SERVICE',
			useClass: AuthService,
		},
		JwtService,
		UserService,
		GameService,
	]
})
export class GameModule {}
