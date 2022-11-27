import axios from 'axios';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdditionalInfo from './AdditionalInfo';
import '../../styles/login.css'

const Login: FC = () => {
	const [additionalInfo, setAdditionalInfo] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		axios.get('http://localhost:3000/auth/status', {withCredentials: true})
		.then(() => {
			navigate('/');
		})
		.catch((err) => {
			if (err.response.data.statusCode === 418)
				setAdditionalInfo(true);
			else
				console.log(err.response.data.error);
		});
	}, []);
	document.body.style.backgroundColor = 'black';
	if (additionalInfo)
		return (<AdditionalInfo/>); //Display additional info Page!
	return (
		<div className='login'>
			<video
			className='background-video'
			 muted
			 autoPlay
			 loop >
				<source src={require("../../videos/pongvideo.mp4")}
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
