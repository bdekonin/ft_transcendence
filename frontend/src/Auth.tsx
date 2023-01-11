import axios from 'axios';
import { SnackbarProvider } from 'notistack';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Protected = ({children}: any) => {

	const navigate = useNavigate();

	useEffect(() => {
		axios.get('http://' + process.env.HOST + ':3000/auth/jwt', {withCredentials: true})
		.catch(e => {
			navigate('/login');
		})
	});

	return (
		<SnackbarProvider maxSnack={5}>
			{children}
		</SnackbarProvider>
		);
}

export default Protected;