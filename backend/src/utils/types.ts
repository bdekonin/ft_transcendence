import { User as UserObject } from "src/entities/User.entity"

export type UserDetails = {
	id?: number;
	username?: string;
	avatar?: string;
}

export {};

// declare global {
//   namespace Express {
//     export interface Request {
//       user?: UserObject;
//     }
//   }
// }