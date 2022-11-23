import { ArgumentMetadata, BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, PipeTransform } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/User.entity";
import { Repository } from "typeorm";
import * as fs from 'fs'
import { updateUserDto } from "./user.dto";
import { NotModifiedException, UserNotFoundException } from "src/utils/exceptions";
import { createChatDto } from "src/chat/chat.controller";

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

	/* Avatar */
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

	/* twofa */
	async getTwoFA(userID: number): Promise<boolean> {
		const user = await this.findUserById(userID);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user.twofa;
	}

	/* user */
	async getUser(id: number): Promise<User> {
		const user = await this.findUserById(id);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	// patch user
	async updateUser(userID: number, dto: updateUserDto) {
		const user = await this.findUserById(userID);
		if (!user) {
			throw new UserNotFoundException();
		}
		if (dto.username) {
			if (user.username == dto.username) {
				throw new NotModifiedException('Username is already set to ' + dto.username);
			}
			const usernameRegex = /^[a-zA-Z0-9]+$/;
	
			if (!usernameRegex.test(dto.username))
				throw new BadRequestException('Username must be between 3 and 20 characters long and can only contain letters, numbers, underscores and dashes');
	
			user.username = dto.username;
			await this.userRepository.save(user).catch((err) => {
				if (err.code === '23505') {
					throw new BadRequestException('Username already exists');
				}
			});
		}
		if (dto.twofa) {
			if (user.twofa == dto.twofa) {
				throw new NotModifiedException('twofa is already set to ' + dto.twofa);
			}
			user.twofa = dto.twofa;
			this.userRepository.save(user);
		}
		return { msg: "OK" };
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