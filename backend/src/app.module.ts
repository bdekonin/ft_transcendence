import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { Friend } from './entities/Friend.entity';
import { GameHistory } from './entities/GameHistory.entity';
import { User } from './entities/User.entity';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { Chat } from './entities/Chat.entity';
import { Message } from './entities/Message.entity';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { socketModule } from './gateway/socket.module';
import { SocialModule } from './social/social.module';

@Module({
  imports: [AuthModule, UserModule, GameModule, ChatModule, socketModule, SocialModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User, GameHistory, Friend, Chat, Message],
      synchronize: true,
    }),
    PassportModule.register({ session: true}),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
