import { drawInterface } from "../draw";
import { Ball } from "../Game";
import { drawEndForClassicTheme, drawIntroForClassicTheme, drawWaitingForClassicTheme } from "./classic";


export function drawWaitingForChristmasTheme(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
	drawWaitingForClassicTheme(canvas, context);
}
export function drawIntroForChristmasTheme(i: number, socketID: string, dto: drawInterface) {
	drawIntroForClassicTheme(i, socketID, dto)
}
export function drawPlayingForChristmasTheme(ball: Ball, dto: drawInterface) {
	/* Draw this image on the canvas https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Ffree-vector%2Fchristmas-background-pixel_961323.htm&psig=AOvVaw3w1F5wzXCXPFMSPmlrtBcJ&ust=1670779100513000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCPi3t6jH7_sCFQAAAAAdAAAAABAI */
	

}
export function drawEndForChristmasTheme(winner: string, i:number, dto: drawInterface) {
}