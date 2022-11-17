import { ArgumentMetadata, BadRequestException, Injectable, NotFoundException, PipeTransform } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Friend } from "src/entities/Friend.entity";
import { GameHistory } from "src/entities/GameHistory.entity";
import { User } from "src/entities/User.entity";
import { Repository } from "typeorm";
import * as fs from 'fs'

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

	async getAvatar(userID: number, res: any) {
		const user = await this.findUserById(userID);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		res.set({
			'Content-Type': `image/jpeg`
		});
		return res.sendFile(user.avatar, { root: 'uploads' });
	}
	async postAvatar(userID: number, filename: string) {
		const user = await this.findUserById(userID);
		if (!user) {
			throw new NotFoundException('User not found');
		}

		if (user.avatar != 'default.jpeg') {
			this.deleteFile('uploads/' + user.avatar);
		}
		user.avatar = filename;
		return await this.save(user);
	}
	async deleteAvatar(userID: number) {
		const user = await this.findUserById(userID);
		if (!user) {
			throw new NotFoundException('User not found');
		}

		if (user.avatar != 'default.jpeg') {
			this.deleteFile('uploads/' + user.avatar);
		}
		user.avatar = 'default.jpeg';
		this.save(user)
		return 204;
	}






	/* Helper functions */
	async deleteFile(filePath: string) {
		fs.unlink(filePath, (err) => {
			if (err) {
				throw new BadRequestException('Could not delete old avatar');
			}
		});
	}


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