import axios from 'axios'
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Protected = ({children}: any) => {

	const navigate = useNavigate();

	useEffect(() => {
		axios.get('http://localhost:3000/auth/jwt', {withCredentials: true})
		.catch(e => {
			navigate('/login');
		})
		.then(e => {
			console.log(e);
		})
	}, []);
	return children;
}

export default Protected;