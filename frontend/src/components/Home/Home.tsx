import axios from 'axios';
import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/home.css';

const Home: FC = () => {

	const navigate = useNavigate();

	useEffect(() => {
		axios.get('http://localhost:3000/auth/status', {withCredentials: true})
		.catch(() => {
			navigate('/login');
		})
	}, []);

	return (
		<>
			<h1>This is the HomePage!</h1>
			<div className='navigator'>
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