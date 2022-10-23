import { User } from "src/entities/User.entity";

export type UserDetails = {
	id: number;
	username: string;
	avatar: string;
}

export {};

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}