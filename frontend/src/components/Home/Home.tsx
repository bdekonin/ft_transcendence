import axios from 'axios';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/home.css';
import io from 'socket.io-client'


const socket = io('ws://localhost:3000', {
		withCredentials: true,
		reconnectionAttempts: 3, /* Temporary */
	}
);

const Home: FC = () => {

	const navigate = useNavigate();
	const [isConnected, setIsConnected] = useState(socket.connected);
	const [lastPong, setLastPong] = useState(0);
  
	useEffect(() => {
		axios.get('http://localhost:3000/auth/status', {withCredentials: true})
		.catch(() => {
			navigate('/login');
		})

		socket.on('connect', () => {
			setIsConnected(true);
		});
	  

		socket.on('disconnect', () => {
			setIsConnected(false);
		});
	  
		socket.on('pong', () => {
			setLastPong(Date.now());
		});

		socket.on('pang', (payload: any) => {
			console.log('You are user: ' + payload.user + ' and your message is: ' + payload.message);
		});
		
		return () => {
			socket.off('connect');
			socket.off('connect');
			socket.off('disconnect');
			socket.off('pong');
		  };
	}, []);

	const sendPing = () => {
		socket.emit('ping');
	  }	

	// document.body.style.background = 'black';

	return (
		<>
			<h1>This is the HomePage!</h1>
			<div className='navigator'>
					<p>Connected: { '' + isConnected }</p>
					<p>Last pong: { lastPong || '-' }</p>
					<button onClick={ sendPing }>Send ping</button>
				<button>Game</button>
				<br />
				<button onClick={() => {navigate('/friends')}}>Friends</button>
				<br />
				<button onClick={() => {navigate('/social')}}>Socials</button>
				<br />
				<button onClick={() => {navigate('/profile')}}>Profile</button>
				<br />
				<button onClick={() => {navigate('/settings')}}>Settings</button>
			</div>
		</>
	);

}

export default Home;