import { ArgumentMetadata, BadRequestException, HttpException, HttpStatus, Inject, Injectable, NotFoundException, PipeTransform, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/User.entity";
import { Repository } from "typeorm";
import * as fs from 'fs'
import { updateUserDto } from "./user.dto";
import { NotModifiedException, UserNotFoundException } from "src/utils/exceptions";
import * as qrcode from 'qrcode'
import { authenticator } from '@otplib/preset-default';
import { AuthService } from "src/auth/auth.service";
import { JwtService } from "@nestjs/jwt";
import { socketGateway } from 'src/gateway/socket.gateway';

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
		private jwtService: JwtService,
		@InjectRepository(User) public userRepository:
			Repository<User>,
	) { 
	}
	// let secretOrKey: string;
	/* Endpoints */

	/* Avatar */
	async getAvatar(userID: number, res: any) {
		const user = await this.findUserById(userID);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		res.set({
			'Content-Type': `image/png`
		});
		return res.sendFile(user.avatar, { root: 'uploads' });
	}
	async postAvatar(userID: number, filename: string) {
		const user = await this.findUserById(userID);
		if (!user) {
			throw new NotFoundException('User not found');
		}

		if (user.avatar != 'default.png') {
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

		if (user.avatar != 'default.png') {
			this.deleteFile('uploads/' + user.avatar);
		}
		user.avatar = 'default.png';
		this.save(user)
		return 204;
	}

	/* twofa */
	async getTwoFA(userID: number) {
		var qrCode: any;

		const user = await this.findUserById(userID);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		const otpauth = authenticator.keyuri(user.username, 'ft_transendence', user.twofa_secret);
		await qrcode.toDataURL(otpauth, {width: 350})
		.then(res => {
			qrCode = res;
		})
		return await qrCode;
	}

	async getTwoFAStatus(userID: number) {
		const user = await this.findUserById(userID);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user.twofa;
	}

	async verifyTwoFA(userID: number, res: any, token: string) {
		const user = await this.findUserById(userID);
		if (!user) {
			throw new NotFoundException('User not found');
		}

		if (authenticator.verify({token: token, secret: user.twofa_secret}) === false)
			throw new UnauthorizedException('Invalid 2fa code.');

		res.clearCookie('jwt')
		const newToken = this.jwtService.sign({ sub: user.id, oauthID: user.oauthID, twofa_verified: true }, { secret: process.env.JWT_SECRET });
		res.cookie('jwt', newToken);
		res.status(200).send();
	}

	async enableTwoFA(userID: number, token: string) {
		const user = await this.findUserById(userID);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		if (user.twofa)
			return null; //already enabled error!
		if (authenticator.verify({token: token, secret: user.twofa_secret})) {
			user.twofa = !user.twofa;
			this.userRepository.save(user);
			return 'OK';
		}
		throw new UnauthorizedException('Invalid 2fa code.');
	}

	async disableTwoFa(userID: number, token: string) {
		const user = await this.findUserById(userID);
		if (!user) {
			throw new NotFoundException('User not found');
		}

		if (!user.twofa)
			return null; //already enabled error!
		if (authenticator.verify({token: token, secret: user.twofa_secret})) {
			user.twofa = !user.twofa;
			this.userRepository.save(user);
			return 'OK';
		}
		throw new UnauthorizedException('Invalid 2fa code.');
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
			user.username = dto.username;
			// await this.userRepository.save(user)
			// .catch((err) => {
			// 	if (err.code === '23505') {
			// 		throw new BadRequestException('Username already exists');
			// 	}
			// });
		}
		if (dto.twofa) {
			if (user.twofa == dto.twofa) {
				throw new NotModifiedException('twofa is already set to ' + dto.twofa);
			}
			user.twofa = dto.twofa;
		}
		await this.userRepository.save(user)
		.catch((err) => {
			if (err.code === '23505') {
				throw new BadRequestException('Username already exists');
			}
		});
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
	async findUserByOauthID(oauthID: string): Promise<User> {
		const user = await this.userRepository.findOneBy({
			oauthID: oauthID
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