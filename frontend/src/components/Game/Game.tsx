import { FormControl, InputLabel, MenuItem, Radio, Select, SelectChangeEvent, Switch } from '@mui/material';
import { ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SocketContext } from '../../context/socket';
import { Draw } from './draw';
import './style.css'

export interface Game {
	id: string;
	theme: Theme;
	left: Paddle;
	right: Paddle;
	ball: Ball;
	leftScore: number;
	rightScore: number;
}

export interface Paddle {
	readonly socket: string;
	readonly username: string;
	left: boolean;
	right: boolean;

	readonly x: number;
	y: number;

	readonly width: number;
	readonly height: number;
}

export interface Ball {
	readonly speed: number;

	x: number;
	y: number;
	xVel:number;
	yVel:number;

	readonly width: number;
	readonly height: number;
}

// This enum represents the possible states of the game
export enum STATE {
	// The spectator state, where the user is watching the game but not participating
	SPECTATOR,
	
	// The default state, where the user is waiting for the game to start
	WAITING,
	
	// The intro animation state, where the game is playing the intro animation
	INTRO,
	
	// The playing state, where the user is actively participating in the game
	PLAYING,
	
	// The end of game state, where the game is over and the user is no longer participating
	END
}

// This enum represents the available themes for the game
export enum Theme {
	// The classic theme
	CLASSIC,
	
	// The football theme
	FOOTBALL,
}


const Game: React.FC = () => {

	const socket = useContext(SocketContext);
	const [state, setState] = useState<STATE>(STATE.WAITING);
	const location = useLocation();
	const navigate = useNavigate();
	const [theme, setTheme] = useState<Theme>(Theme.CLASSIC);
	
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
	
	const [gameState, setGameState] = useState<Game>();
	const [ball, setBall] = useState<Ball>();
	const [winner, setWinner] = useState<string | null>(null);
	const draw = new Draw();

	useEffect(() => {
		if (location.hash) {
			socket.emit("game/request-spectate", {id: location.hash.substring(1)});
			socket.on('game/spectate', (data: Game) => {
				setGameState(data);
				setBall(data.ball)
				setState(STATE.SPECTATOR);
			});
		}

		return () => {
			socket.off("game/spectate");
		}
	}, [socket]);

	useEffect(() => {
		if (state == STATE.WAITING) {
			socket.emit("game/waiting");
		}
		socket.on("game/start", (data: Game) => {
			setGameState(data);
			setBall(data.ball)
			if (state != STATE.SPECTATOR) {
				setState(STATE.INTRO);
			}
		});
		return () => {
			socket.off("game/start");
			socket.emit("game/leave");
		};
	}, [socket]);

	useEffect(() => {
		socket.on('game/rejoin', (data: Game) => {
			setGameState(data);
			setBall(data.ball)
			if (state != STATE.SPECTATOR) {
				setState(STATE.PLAYING);
			}
		});
		return () => {
			socket.off("game/rejoin");
		}
	}, [socket]);

	useEffect(() => {
		socket.on("game/update", (data: Game) => {
			/* Update game state */
			setGameState(data);
			if (state != STATE.SPECTATOR) {
				if (socket.id == data.left.socket || socket.id == data.right.socket)
					setState(STATE.PLAYING);
			}
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
		socket.on("game/end", (payload?: any) => {
			if (payload) {
				setWinner(payload.winner);
			}
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
			draw.drawWaiting(canvasRef.current, context.current)
		}
		else if (state == STATE.INTRO && gameState) {
			let i = 10;
			if (!interval) {
				interval = setInterval(() => {
					if (i === 0) {
						clearInterval(interval);
						setState(STATE.PLAYING);
						return;
					}
					if (!canvasRef.current || !context.current)
						return;
						draw.drawIntro(theme, i, socket.id, {
						context: context.current,
						canvas: canvasRef.current,
						gameState: gameState,
					});
					i--;
				}, 1000);
			}
		}
		else if ((state == STATE.SPECTATOR || state == STATE.PLAYING) && gameState && ball) {
			draw.drawPlaying(theme, ball, {
				context: context.current,
				canvas: canvasRef.current,
				gameState: gameState,
			});
		}
		else if (state == STATE.END && gameState && winner) {
			let i = 10;
			if (!interval) {
				interval = setInterval(() => {
					if (i === 1) {
						clearInterval(interval);
						// navigete to home page
						navigate("/");
						return;
					}
					if (!canvasRef.current || !context.current)
						return;
						draw.drawEnd(theme, i, winner, {
						context: context.current,
						canvas: canvasRef.current,
						gameState: gameState,
					});
					i--;
				}, 1000);
			}
		}
	};

	const update = () => {
		if ((state == STATE.SPECTATOR || state == STATE.PLAYING) && gameState && ball) {
			//check top canvas bounds
			if(ball.y < 10){
				ball.yVel = 1;
			}
			
			//check bottom canvas bounds
			if(ball.y + ball.height > 400 - 10){
				ball.yVel = -1;
			}
			
			//check left canvas bounds
			if(ball.x < 0){
				if (state == STATE.PLAYING)
					socket.emit("game/score", {side: "right", id: gameState.id});
			}
			
			//check right canvas bounds
			if(ball.x + ball.width > 700){
				if (state == STATE.PLAYING)
					socket.emit("game/score", {side: "left", id: gameState.id});
			}

			//check left player collision
			if(ball.x + ball.width<= gameState.left.x + gameState.left.width){
				if(ball.y >= gameState.left.y && ball.y + ball.height <= gameState.left.y + gameState.left.height){
					ball.xVel = 1;
				}
			} 
			
			//check right player collision
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

	const handleChange = (event: SelectChangeEvent<number>, child: ReactNode) => {
		// Change the theme based on the selected value
		console.log('Changing theme');
		if (event.target.value === Theme.CLASSIC) {
			setTheme(Theme.CLASSIC);
		} else if (event.target.value === Theme.FOOTBALL) {
			setTheme(Theme.FOOTBALL);
		}
	};

	return (
		<div>
			<canvas
				ref={canvasRef}
				width={700}
				height={400}
				className="pong-canvas"
				style={{ border: "1px solid white" }}
			/>
			<FormControl variant="outlined">
			<InputLabel id="demo-simple-select-label">Theme</InputLabel>
			<Select
				labelId="demo-simple-select-label"
				id="demo-simple-select"
				defaultValue={theme}
				value={theme}
				label="Theme"
				onChange={handleChange}
			>
				<MenuItem value={Theme.CLASSIC}>Classic</MenuItem>
				<MenuItem value={Theme.FOOTBALL}>Football</MenuItem>
			</Select>
			</FormControl>
		</div>
	  );
}

export default Game;
