import { Ball, Game, Theme } from "./Game";
import { drawWaitingForClassicTheme, drawIntroForClassicTheme, drawPlayingForClassicTheme, drawEndForClassicTheme } from "./themes/classic";
import { drawPlayingForFootballTheme } from "./themes/football";

/* This function makes it easier to store the variables */
export interface drawInterface {
	context: CanvasRenderingContext2D;
	canvas: HTMLCanvasElement;
	gameState: Game;
}


/* This function is called by the Game component to draw the game */
export function drawWaiting(context: CanvasRenderingContext2D) {
	/* Will alwasy be classic theme, or choose random?? */
	drawWaitingForClassicTheme(context);
}

export function drawIntro(theme: Theme, i: number, socketID: string, dto: drawInterface) {
	/* Call the appropriate function based on the theme */
	if (theme == Theme.CLASSIC) {
		drawIntroForClassicTheme(i, socketID, dto);
	}
	else if (theme == Theme.FOOTBALL) {
		drawIntroForClassicTheme(i, socketID, dto);
		// drawIntroForFootballTheme(i, dto);
	}
}

export function drawPlaying(theme: Theme, ball: Ball, dto: drawInterface) {
	/* Call the appropriate function based on the theme */
	if (theme == Theme.CLASSIC) {
		drawPlayingForClassicTheme(ball, dto);
	}
	else if (theme == Theme.FOOTBALL) {
		drawPlayingForFootballTheme(ball, dto);
	}
}

export function drawEnd(theme: Theme, winner: string, dto: drawInterface) {
	/* Call the appropriate function based on the theme */
	if (theme == Theme.CLASSIC) {
		drawEndForClassicTheme(winner, dto);
	}
	else if (theme == Theme.FOOTBALL) {
		drawEndForClassicTheme(winner, dto);
		// drawEndForFootballTheme(dto);
	}
}