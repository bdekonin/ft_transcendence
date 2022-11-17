import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Friend } from "src/entities/Friend.entity";
import { GameHistory } from "src/entities/GameHistory.entity";
import { User } from "src/entities/User.entity";
import { Repository } from "typeorm";

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
	transform(value: any, metadata: ArgumentMetadata) {
		const oneKb = 1000;
		return value.size < oneKb * 3000; // 3MB
	}
}

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User) public userRepository:
			Repository<User>,
	) { }
	/* Endpoints */

	async postAvatar(userID: number) {

	}

	// {
	// 	fieldname: 'image',
	// 	originalname: 'bdekonin.jpeg',
	// 	encoding: '7bit',
	// 	mimetype: 'image/jpeg',
	// 	destination: './uploads',
	// 	filename: '7065bfe93b0d312f8c2c0fc8eda921f0',
	// 	path: 'uploads/7065bfe93b0d312f8c2c0fc8eda921f0',
	// 	size: 222726
	//   }


	/* Helper functions */
	async findUserById(idArg: number): Promise<User> {
		const user = await this.userRepository.findOneBy({
			id: idArg
		});
		return user;
	}
	async findUserByUsername(usernameArg: string): Promise<User> {
		const user = await this.userRepository.findOneBy({
			username: usernameArg
		});
		return user;

	}
	async findUserByIdUsername(idArg: number, usernameArg: string): Promise<User> {
		const user = await this.userRepository.findOneBy({
			id: idArg,
			username: usernameArg
		});
		return user;
	}

	async save(user: User): Promise<User> {
		return await this.userRepository.save(user);
	}

	async all(): Promise<User[]> {
		return this.userRepository.find();
	}
}