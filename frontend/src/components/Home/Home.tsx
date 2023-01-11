import axios from 'axios';
import { useSnackbar } from 'notistack';
import { FC, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showSnackbarNotification } from '../../App';
import { SocketContext } from '../../context/socket';
import './style.css';

const Home: FC = () => {

	const navigate = useNavigate();
	const socket = useContext(SocketContext);
	const { enqueueSnackbar } = useSnackbar();
  
	useEffect(() => {
		axios.get('http://' + process.env.HOST + ':3000/auth/status', {withCredentials: true})
		// .catch((err) => {
		// 	if (err.data.message === 'username')
		// 		navigate('/login');
		// 	else if (err.data.message === 'twofa')
		// 		return (<TwoFA/>);
		// })
	}, []);

	useEffect(() => {
		if (socket) { /* Socket stuff */
			socket.on('chat/refresh-message', (payload: any) => {
				/* Enable notification for that channel */
				if (payload.parent.type == 'PRIVATE')
					showSnackbarNotification(enqueueSnackbar, "New message from " + payload.sender.username, 'info');
				else
					showSnackbarNotification(enqueueSnackbar, "New message in groupchat \'" + payload.parent.name + "\'", 'info');
			});
		}
		return () => {
			socket.off('chat/refresh-message');
		}
	}, [socket]);

	return (
		
	<div className='homepage'>
	<div className='background'/>
			<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" />
			<img
				className='logo' 
				src={require('./logo.png')}/>
				<ul className='navigate'>
					<li><a
							onClick={() => {navigate('/gamescreen')}}>Game</a></li>
					<li><a
							onClick={() => {navigate('/chat')}}>Chat</a></li>
					<li><a
							onClick={() => {navigate('/friends')}}>Friends</a></li>
					<li><a
							onClick={() => {navigate('/social')}}>Social</a></li>
					<li><a
							onClick={() => {navigate('/profile')}}>Profile</a></li>
					<li><a
							onClick={() => {navigate('/settings')}}>Settings</a></li>
					<li><a
							onClick={() => { axios.get('http://' + process.env.HOST + ':3000/auth/logout', { withCredentials: true }).then(() => { navigate('/login') }) }}>Logout</a></li>
				</ul>





			{/* <h1>This is the HomePage!</h1>
			<div className='navigator'>s
			<button onClick={() => {navigate('/game')}}>Game</button>
			<br />
			<button onClick={() => {navigate('/chat')}}>Chat</button>
			<br />
			<button onClick={() => {navigate('/friends')}}>Friends</button>
			<br />
			<button onClick={() => {navigate('/social')}}>Socials</button>
			<br />
			<button onClick={() => {navigate('/profile')}}>Profile</button>
			<br />
		<button onClick={() => {navigate('/settings')}}>Settings</button> */}
			{/* </div> */}
		</div>
	);

}

export default Home;