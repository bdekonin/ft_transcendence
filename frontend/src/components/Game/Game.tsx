import { containerClasses } from '@mui/material';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { SocketContext } from '../../context/socket';
import './style.css'

interface Game {
	id: string;
	left: Paddle;
	right: Paddle;
	ball: Ball;
	leftScore: number;
	rightScore: number;
}

interface Paddle {
	readonly socket: string;
	readonly username: string;
	left: boolean;
	right: boolean;

	readonly x: number;
	y: number;

	readonly width: number;
	readonly height: number;
}

interface Ball {
	readonly speed: number;

	x: number;
	y: number;
	xVel:number;
	yVel:number;

	readonly width: number;
	readonly height: number;
}

export enum STATE {
	SPECTATOR, /* Spectator */
	WAITING, /* Default state */
	INTRO, /* Intro animation */
	PLAYING, /* Playing */
	END /* End of game */
}


const Game: React.FC = () => {

	/* Canvas */
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const context = useRef<CanvasRenderingContext2D | null>();

	const getCanvasContext = () => {
		if (!canvasRef.current) {
		  return;
		}
		context.current = canvasRef.current.getContext("2d");
	  };
	
	useEffect(getCanvasContext, []);
	
	const socket = useContext(SocketContext);
	const [gameState, setGameState] = useState<Game>();
	const [ball, setBall] = useState<Ball>();

	const [state, setState] = useState<STATE>(STATE.WAITING);

	useEffect(() => {
		if (state == STATE.WAITING) {
			socket.emit("game/waiting");
		}
		socket.on("game/start", (data: Game) => {
			setGameState(data);
			setBall(data.ball)
			setState(STATE.INTRO);
		});
		return () => {
		  socket.off("game/start");
		};
	}, [socket]);

	useEffect(() => {
		socket.on("game/update", (data: Game) => {
			setGameState(data);
			setState(STATE.PLAYING);
		});
		return () => {
		  socket.off("game/update");
		};
	}, [socket]);

	useEffect(() => {
		socket.on("game/ball", (data: Ball) => {
			setBall(data);
		});
		return () => {
			socket.off("game/ball");
		};
	}, [socket]);

	useEffect(() => {
		socket.on("game/end", () => {
			setState(STATE.END);
		});
		return () => {
			socket.off("game/end");
		};
	}, [socket]);



	/* Mouse move handler */
	const mouseMoveHandler = useCallback(
		(e: MouseEvent) => {
			if (typeof gameState != "undefined" && state == STATE.PLAYING) {
				socket.emit("game/move", {y: e.clientY, id: gameState.id});
			}
		},
		[socket, state, gameState]
	);

	useEffect(() => {
		window.addEventListener("mousemove", mouseMoveHandler, false);
		return () => {
			window.removeEventListener("mousemove", mouseMoveHandler, false);
		};
	}, [mouseMoveHandler]);

	let interval: NodeJS.Timeout;
	/* Render next frame */
	const render = () => {
		if (!canvasRef.current || !context.current)
			return;
		if (state == STATE.WAITING) {
			context.current.font = "30px Arial Narrow";
			context.current.fillStyle = "white";
			context.current?.fillText("Waiting for other player...", 200, 200);
		}
		else if (state == STATE.INTRO && gameState) {
			let i = 7;
			if (!interval) {
				interval = setInterval(() => {
					if (i === 0) {
						clearInterval(interval);
						setState(STATE.PLAYING);
						return;
					}
					if (!canvasRef.current || !context.current) return;
					context.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
					context.current.font = "30px Arial Narrow";
					context.current.fillStyle = "white";
					if (i > 5) {
						context.current?.fillText("Playing against " + gameState.right.username, canvasRef.current.width / 2 - 100, canvasRef.current.height / 2);
					}
					else if (i > 3) {
						context.current?.fillText("Ready?", canvasRef.current.width / 2 - 50, canvasRef.current.height / 2);
					}
					else {
						context.current?.fillText(i.toString(), canvasRef.current.width / 2 - 10, canvasRef.current.height / 2);
					}
					i--;
				}, 1000);
			}
		}
		else if (state == STATE.PLAYING && gameState && ball) {
			/* Paddles */
			context.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
			context.current.fillStyle = "white";
			context.current.fillRect(gameState.left.x, gameState.left.y, gameState.left.width, gameState.left.height);
			context.current.fillStyle = "white";
			context.current.fillRect(gameState.right.x, gameState.right.y, gameState.right.width, gameState.right.height);
			context.current.fillRect(gameState.left.x, gameState.left.y, gameState.left.width, gameState.left.height);

			/* Draw middle dotted line */
			context.current.beginPath();
			for (let i = 0; i < canvasRef.current.height; i += 30) {
				context.current.moveTo(canvasRef.current.width / 2, i);
				context.current.lineTo(canvasRef.current.width / 2, i + 15);
			}
			context.current.strokeStyle = "white";
			context.current.lineWidth = 2;
			context.current.stroke();

			/* Score */
			context.current.font = "30px Arial Narrow";
			context.current.fillStyle = "white";
			context.current?.fillText(gameState.leftScore.toString(), 300, 40); /* Left */
			context.current?.fillText(gameState.rightScore.toString(), 390, 40); /* Right */

			/* Ball */
			context.current.beginPath();
			context.current.arc(ball.x, ball.y, ball.height, 0, Math.PI * 2);
			context.current.fillStyle = "white";
			context.current.fill();
		}
		else if (state == STATE.END && gameState) {
			context.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
			context.current.font = "30px Arial Narrow";
			context.current.fillStyle = "white";
			context.current?.fillText("Game over!", canvasRef.current.width / 2 - 50, canvasRef.current.height / 2);
			// context.current?.fillText("Winner: " + gameState.winner.username, canvasRef.current.width / 2 - 100, canvasRef.current.height / 2 + 50);
		}
	};

	const update = () => {
		if (state == STATE.PLAYING && gameState) {

		}
		if (state == STATE.PLAYING && gameState && ball) {
			//check top canvas bounds
			if(ball.y <= 10){
				ball.yVel = 1;
			}
			
			//check bottom canvas bounds
			if(ball.y + ball.height >= 400 - 10){
				ball.yVel = -1;
			}
			
			//check left canvas bounds
			if(ball.x <= 0){  
				socket.emit("game/score", {side: "right", id: gameState.id});
			}
			
			//check right canvas bounds
			if(ball.x + ball.width >= 700){
				socket.emit("game/score", {side: "left", id: gameState.id});
			}

			//check player collision
			if(ball.x <= gameState.left.x + gameState.left.width){
				if(ball.y >= gameState.left.y && ball.y + ball.height <= gameState.left.y + gameState.left.height){
					ball.xVel = 1;
				}
			}
			
			//check computer collision
			if(ball.x + ball.width >= gameState.right.x){
				if(ball.y >= gameState.right.y && ball.y + ball.height <= gameState.right.y + gameState.right.height){
					ball.xVel = -1;
				}
			}
			ball.x += ball.xVel * ball.speed;
			ball.y += ball.yVel * ball.speed;
		}
	};

	const requestIdRef = useRef<number>(0);
	const tick = () => {
		render();
		update();
		if (requestIdRef.current) {
			requestIdRef.current = requestAnimationFrame(tick);
		}
	};
	
	/* Launch game + cleanup */
	useEffect(() => {
		requestIdRef.current = requestAnimationFrame(tick);
		return () => {
			cancelAnimationFrame(requestIdRef.current);
		};
	});

	return (
		<canvas
			ref={canvasRef}
			width={700}
			height={400}
			className="pong-canvas"
			style={{ border: "2px solid white" }}
		/>
	  );
}

export default Game;
