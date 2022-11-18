import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { Friend } from './entities/Friend.entity';
import { GameHistory } from './entities/GameHistory.entity';
import { Membership } from './entities/Membership.entity';
import { User } from './entities/User.entity';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { Chat } from './entities/Chat.entity';
import { Message } from './entities/Message.entity';

@Module({
  imports: [AuthModule, UserModule, GameModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'root',
      password: 'root',
      database: 'ft_trans',
      entities: [User, Membership, GameHistory, Friend, Chat, Message],
      synchronize: true,
    }),
    PassportModule.register({ session: true}),
    GameModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
