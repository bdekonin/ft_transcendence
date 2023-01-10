import axios from 'axios';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdditionalInfo from '../AdditionalInfo/AdditionalInfo';
import TwoFA from '../TwoFA/TwoFA';
import './style.css';

const Login: FC = () => {
	const [additionalInfo, setAdditionalInfo] = useState(false);
	const [twoFA, setTwoFA] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		axios.get('http://localhost:3000/auth/status', {withCredentials: true})
		.then(() => {
			navigate('/');
		})
		.catch((err) => {
			if (err.response.data.message === 'username')
				setAdditionalInfo(true);
			else if (err.response.data.message === 'twofa')
				setTwoFA(true);
		});
	}, []);
	if (additionalInfo)
		return (<AdditionalInfo/>);
	else if (twoFA)
		return <TwoFA/>;
	return (
		<div className='login'>
			<video
			className='background-video'
			 muted
			 autoPlay
			 loop >
				<source src={require("../../../videos/pongvideo.mp4")}
				type="video/mp4"/>
			</video>
			<div className='block1'>
			<h1>User login</h1>
			<a href="http://localhost:3000/auth/42/login">
				<img src={require("./42LogoBlue.png")}
					alt="42 Logo" 
					className='image1'
					/>
			</a>
			<a href="http://localhost:3000/auth/google/login">
				<img src={require("./googleLogo.png")}
					alt='Google logo'
					className='image2'
					/>
			</a>
		</div>
</div>
	);
}

export default Login;
