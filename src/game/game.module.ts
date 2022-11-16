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

@Module({
	imports: [
		UserModule, GameModule,
		TypeOrmModule.forFeature([GameHistory, User]),
		forwardRef(() => AppModule)
	],
	controllers: [
		UserController,
		GameController,
	],
	providers: [
		UserService,
		GameService,
	]
})
export class GameModule {}
