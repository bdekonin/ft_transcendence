import axios from "axios";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import './style.css'


interface User {
	id: number;
	username: string;
	twofa: boolean;
	avatar: string;
}

const Settings:React.FC = () => {
	const navigate = useNavigate();
	const [user, setUser] = useState<User>();
	const [userNameDef, setUserNameDef] = useState('');
	const [avatar, setAvatar] = useState('');
	// let user: User;

	useEffect(() => {
		axios.get('http://localhost:3000/user', {withCredentials: true})
		.then(elem => {
			setUser(elem.data);
			console.log(elem.data);
			setUserNameDef(elem.data.username);
		})
		.catch(err => {
			console.log(err);
			navigate('/login');
		})

		axios.get('http://localhost:3000/user/avatar', {withCredentials: true, responseType: 'blob'})
		.then(elem => {
			setAvatar(URL.createObjectURL(elem.data));
		})
		.catch(err => {
			console.log(err);
		})

	}, [])
	
	function enable2FA() {

	}

	function changeAvatar(e: ChangeEvent<HTMLInputElement>) {
		const image: File = e.target.files![0];
		setAvatar(URL.createObjectURL(image));
	}

	return (
		<div className="settings">
			<button onClick={() => {navigate('/')}}>Home</button>
			<h1 className="header">Settings</h1>
			<div className="block1">
				<h2>Username: </h2>
				<input type="text" value={userNameDef} maxLength={14} onChange={(e) => {setUserNameDef(e.target.value)}}/>
				<h2>Avatar: </h2>
				<img className='avatar' src={avatar} />
				<br />
				<input type="file" id="img" name="img" accept="image/*" onChange={changeAvatar}/>
				<h2>2FA</h2>
				{ user && !user.twofa ? <button>Enable 2FA</button> : <button>Disable 2FA</button>}
				<button>Update</button>
			</div>
		</div>
	);
}

export default Settings;
