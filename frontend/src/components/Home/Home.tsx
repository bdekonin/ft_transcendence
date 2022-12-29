import axios from 'axios';
import React, { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css'

const Home: FC = () => {

	const navigate = useNavigate();
  
	useEffect(() => {
		axios.get('http://localhost:3000/auth/status', {withCredentials: true})
		.catch(() => {
			navigate('/login');
		})
	}, []);

	return (
		
	<div className='homepage'>
	<div className='background'/>
			<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" />
			<img
				className='logo' 
				src={require('./logo.png')}/>
				<ul className='navigate'>
					<li><a
							onClick={() => {navigate('/game')}}>Game</a></li>
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