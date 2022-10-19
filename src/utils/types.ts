export type PlayerDetails = {
	id: number;
	username: string;
	avatar: string;
	// wins: number;
	// loses: number;
	// twofa: boolean;
}

export {};

declare global {
  namespace Express {
    interface Request {
      user: string;
    }
  }
}