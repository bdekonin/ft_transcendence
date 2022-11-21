import { Module } from '@nestjs/common';

@Module({})
export class ChatModule {
	imports: [
		TypeOrmModule.forFeature([Chat, User, Message]),
		
	],
	  controllers: [],
	  providers: [],
}
