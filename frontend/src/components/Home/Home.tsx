import axios from 'axios';
import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/home.css';

const Home: FC = () => {

	const navigate = useNavigate();

	useEffect(() => {
		axios.get('http://localhost:3000/auth/status', {withCredentials: true})
		.catch(() => {
			// navigate('/login');
		})
	}, []);

	return (
		<>
			<h1>This is the HomePage!</h1>
			<div className='navigator'>
				<button></button>
				<br />
				<button></button>
				<br />
				<button></button>
				<br />
				<button></button>
				<br />
			</div>
		</>
	);

}

export default Home;