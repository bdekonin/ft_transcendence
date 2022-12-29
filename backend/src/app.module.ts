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
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { socketModule } from './gateway/socket.Module';
import { TwoFAModule } from './auth/2fa/TwoFA.module';

@Module({
  imports: [TwoFAModule, AuthModule, UserModule, GameModule, ChatModule, socketModule,
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
      entities: [User, Membership, GameHistory, Friend, Chat, Message],
      synchronize: true,
    }),
    PassportModule.register({ session: true}),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
