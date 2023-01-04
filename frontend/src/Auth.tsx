import axios from 'axios'
import { SnackbarProvider } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdditionalInfo from './components/Login/AdditionalInfo/AdditionalInfo';
import TwoFA from './components/Login/TwoFA/TwoFA';

const Protected = ({children}: any) => {

	const navigate = useNavigate();

	useEffect(() => {
		axios.get('http://localhost:3000/auth/jwt', {withCredentials: true})
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