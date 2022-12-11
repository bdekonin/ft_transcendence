import { Ball, Game, Theme } from "./Game";
import { drawWaitingForClassicTheme, drawIntroForClassicTheme, drawPlayingForClassicTheme, drawEndForClassicTheme } from "./themes/classic";
import { drawEndForFootballTheme, drawIntroForFootballTheme, drawPlayingForFootballTheme, drawWaitingForFootballTheme } from "./themes/football";

/* This function makes it easier to store the variables */
export interface drawInterface {
	context: CanvasRenderingContext2D;
	canvas: HTMLCanvasElement;
	gameState: Game;
}

export class Draw {

	// private christmasBackgroundImage: HTMLImageElement;

	constructor() {
		// this.christmasBackgroundImage = new Image();
		// this.christmasBackgroundImage.src = "https://www.freepik.com/free-vector/christmas-background-pixel_961323.htm";

		// this.christmasBackgroundImage.onload = () => {
		// 	console.log("Loaded image");
		// }
	}

	drawWaiting(theme: Theme, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
		/* Will alwasy be classic theme, or choose random?? */
		if (theme == Theme.CLASSIC) {
			drawWaitingForClassicTheme(canvas, context);
		}
		else if (theme == Theme.FOOTBALL) {
			drawWaitingForFootballTheme(canvas, context);
		}
	}
	drawIntro(theme: Theme, i: number, socketID: string, dto: drawInterface) {
		/* Call the appropriate function based on the theme */
		if (theme == Theme.CLASSIC) {
			drawIntroForClassicTheme(i, socketID, dto);
		}
		else if (theme == Theme.FOOTBALL) {
			drawIntroForFootballTheme(i, socketID, dto);
		}
	}
	drawPlaying(theme: Theme, ball: Ball, dto: drawInterface) {
		/* Call the appropriate function based on the theme */
		if (theme == Theme.CLASSIC) {
			drawPlayingForClassicTheme(ball, dto);
		}
		else if (theme == Theme.FOOTBALL) {
			drawPlayingForFootballTheme(ball, dto);
		}
	}
	drawEnd(theme: Theme, i: number, winner: string, dto: drawInterface) {
		/* Call the appropriate function based on the theme */
		// dto.context.drawImage(this.christmasBackgroundImage, 0, 0, dto.canvas.width, dto.canvas.height);

		if (theme == Theme.CLASSIC) {
			drawEndForClassicTheme(winner, i, dto);
		}
		else if (theme == Theme.FOOTBALL) {
			drawEndForFootballTheme(winner, i, dto);
		}
	}
}



/* This function is called by the Game component to draw the game */
// function drawWaiting(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
// 	/* Will alwasy be classic theme, or choose random?? */
// 	drawWaitingForClassicTheme(canvas, context);
// }

// function drawIntro(theme: Theme, i: number, socketID: string, dto: drawInterface) {
// 	/* Call the appropriate function based on the theme */
// 	if (theme == Theme.CLASSIC) {
// 		drawIntroForClassicTheme(i, socketID, dto);
// 	}
// 	else if (theme == Theme.FOOTBALL) {
// 		drawIntroForFootballTheme(i, socketID, dto);
// 	}
// }

// function drawPlaying(theme: Theme, ball: Ball, dto: drawInterface) {
// 	/* Call the appropriate function based on the theme */
// 	if (theme == Theme.CLASSIC) {
// 		drawPlayingForClassicTheme(ball, dto);
// 	}
// 	else if (theme == Theme.FOOTBALL) {
// 		drawPlayingForFootballTheme(ball, dto);
// 	}
// }

// function drawEnd(theme: Theme, i: number, winner: string, dto: drawInterface) {
// 	/* Call the appropriate function based on the theme */
// 	if (theme == Theme.CLASSIC) {
// 		drawEndForClassicTheme(winner, i, dto);
// 	}
// 	else if (theme == Theme.FOOTBALL) {
// 		drawEndForFootballTheme(winner, i, dto);
// 	}
// }