import { drawInterface } from "../draw";
import { Ball } from "../Game";



export class Space {
	private starPositions: number[][];
	private starVelocities: number[][];

	constructor() {
		this.starPositions = this.generateStarPositions();
		this.starVelocities = this.generateStarVelocities(this.starPositions.length, 0.05, 0.09);
	}

	private generateStarPositions() {
		// create an empty array to store the star positions
		const starPositions = [];
		const canvasHeight = 400;
		const canvasWidth = 700;

		// generate the positions of the stars randomly
		for (let i = 0; i < 100; i++) {
			// generate a random position for the star
			const x = Math.random() * canvasWidth;
			const y = Math.random() * canvasHeight;
		
			// add the position of the star to the array
			starPositions.push([x, y]);
		}
		return starPositions;
	}

	private generateStarVelocities(numStars: number, minVelocity: number, maxVelocity: number) {
		let velocities = [];
	
		for (let i = 0; i < numStars; i++) {
			let xVelocity = Math.random() * (maxVelocity - minVelocity) + minVelocity; // Random x-velocity between minVelocity and maxVelocity
			let yVelocity = Math.random() * (maxVelocity - minVelocity) + minVelocity; // Random y-velocity between minVelocity and maxVelocity
			let velocity = [xVelocity, yVelocity];
			velocities.push(velocity);
		}
	
		return velocities;
	}
	

	update() {
		// loop through the star positions and update their positions
		for (let i = 0; i < this.starPositions.length; i++) {
			const pos = this.starPositions[i];
			const vel = this.starVelocities[0];
		
			// update the position of the star based on its velocity
			pos[0] += vel[0];
			pos[1] += vel[1];

			const canvasHeight = 400;
			const canvasWidth = 700;
		
			// if the star has moved off the edge of the canvas, wrap it around to the other side
			if (pos[0] < 0)
				pos[0] = canvasWidth;
			if (pos[0] > canvasWidth)
				pos[0] = 0;
			if (pos[1] < 0)
				pos[1] = canvasHeight;
			if (pos[1] > canvasHeight)
				pos[1] = 0;
		}
	}

	private drawStars(context: CanvasRenderingContext2D) {
		context.fillStyle = "white"; // Set the fill color to white

		for (let i = 0; i < this.starPositions.length; i++) {
			let pos = this.starPositions[i];
			let x = pos[0]; // The x-coordinate of the star
			let y = pos[1]; // The y-coordinate of the star
		
			// Draw a circle at the position of the star
			context.beginPath();
			context.arc(x, y, 2, 0, 2 * Math.PI);
			context.fill();
		}
		this.update();
	}

	drawWaiting(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		this.drawStars(context);

		context.font = "30px Arial Narrow";
		context.fillStyle = "white";
		const prompt = "Waiting for other player...";
		const promptWidth = context.measureText(prompt).width;
		context.fillText(prompt, (canvas.width / 2) - (promptWidth / 2), canvas.height / 2);
	}

	drawIntro(i: number, socketID: string, dto: drawInterface) {
		dto.context.clearRect(0, 0, dto.canvas.width, dto.canvas.height);
		this.drawStars(dto.context);

		dto.context.font = "30px Arial Narrow";
		dto.context.fillStyle = "white";
		if (i > 5) {
			const username = dto.gameState.left.socket != socketID ? dto.gameState.left.username : dto.gameState.right.username;
			const prompt = "Playing against " + username;
			const promptWidth = dto.context.measureText(prompt).width;
			dto.context?.fillText(prompt, (dto.canvas.width / 2) - (promptWidth / 2), dto.canvas.height / 2);
		}
		else if (i > 3) {
			const prompt = "Ready?";
			const promptWidth = dto.context.measureText(prompt).width;
			dto.context?.fillText(prompt, (dto.canvas.width / 2) - (promptWidth / 2), dto.canvas.height / 2);
		}
		else {
			const prompt = i.toString();
			const promptWidth = dto.context.measureText(prompt).width;
			dto.context?.fillText(prompt, (dto.canvas.width / 2) - (promptWidth / 2), dto.canvas.height / 2);
		}
	}

	drawPlaying(ball: Ball, dto: drawInterface) {
		dto.context.clearRect(0, 0, dto.canvas.width, dto.canvas.height);
		this.drawStars(dto.context);

		/* Paddles */
		dto.context.fillStyle = "white";
		dto.context.fillRect(dto.gameState.left.x, dto.gameState.left.y, dto.gameState.left.width, dto.gameState.left.height);
		dto.context.fillStyle = "white";
		dto.context.fillRect(dto.gameState.right.x, dto.gameState.right.y, dto.gameState.right.width, dto.gameState.right.height);
		dto.context.fillRect(dto.gameState.left.x, dto.gameState.left.y, dto.gameState.left.width, dto.gameState.left.height);

		/* Score */
		dto.context.font = "30px Arial Narrow";
		dto.context.fillStyle = "white";
		dto.context?.fillText(dto.gameState.leftScore.toString(), 300, 40); /* Left */
		dto.context?.fillText(dto.gameState.rightScore.toString(), 390, 40); /* Right */

		/* Ball */
		dto.context.beginPath();
		dto.context.arc(ball.x, ball.y, ball.height, 0, Math.PI * 2);
		dto.context.fillStyle = "white";
		dto.context.fill();
	}

	drawEnd(winner: string, i:number, dto: drawInterface) {
		dto.context.clearRect(0, 0, dto.canvas.width, dto.canvas.height);
		this.drawStars(dto.context);

		dto.context.font = "30px Arial Narrow";
		dto.context.fillStyle = "white";
		if (!winner) {
			const prompt = "Draw!";
			const promptWidth = dto.context.measureText(prompt).width;
			dto.context?.fillText(prompt, (dto.canvas.width / 2) - (promptWidth / 2), dto.canvas.height / 3);
			return;
		}
		const prompt = "Winner: " + winner;
		const promptWidth = dto.context.measureText(prompt).width;
		dto.context?.fillText(prompt, (dto.canvas.width / 2) - (promptWidth / 2), dto.canvas.height / 3);
	
		/* Sending the user back to the lobby after 5 seconds */
		if (i > 1) {
			const prompt = "Sending you back to the lobby in " + (i).toString() + " seconds";
			const promptWidth = dto.context.measureText(prompt).width;
			dto.context?.fillText(prompt, (dto.canvas.width / 2) - (promptWidth / 2), (dto.canvas.height / 3) * 2);
		}
	}
}