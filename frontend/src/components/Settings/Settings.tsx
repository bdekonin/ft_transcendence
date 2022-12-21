import axios from "axios";
import { ChangeEvent, LegacyRef, RefObject, useEffect, useRef, useState } from "react";
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
	const [originUserName, setOriginUserName] = useState('');
	const [originAvatar, setOriginAvatar] = useState('');
	const [avatar, setAvatar] = useState('');
	const inputRef = useRef<HTMLInputElement | null> (null);

	useEffect(() => {
		getUserInfo();
		getAvatar();
	}, [])

	function getUserInfo() {
		axios.get('http://localhost:3000/user', {withCredentials: true})
		.then(elem => {
			setUser(elem.data);
			console.log(elem.data);
			setUserNameDef(elem.data.username);
			setOriginUserName(elem.data.username);
		})
		.catch(err => {
			console.log(err);
			navigate('/login');
		})
	}

	function getAvatar() {
		axios.get('http://localhost:3000/user/avatar', {withCredentials: true, responseType: 'blob'})
		.then(elem => {
			setAvatar(URL.createObjectURL(elem.data));
			setOriginAvatar(URL.createObjectURL(elem.data));
		})
		.catch(err => {
			console.log(err);
		})
	}

	function onChangeAvatar(e: ChangeEvent<HTMLInputElement>) {
		const image: File = e.target.files![0];
		setAvatar(URL.createObjectURL(image));
	}

	function onRemoveAvatar() {
		//set Originial avatar
		setAvatar(originAvatar);

		//Remove selected image
		if (inputRef.current?.value)
			inputRef.current.value = "";
		if (inputRef && inputRef.current)
			inputRef.current.files = null;
	}

	function sumbit() {
		if (userNameDef !== originUserName)
		{
			//Update username here
			axios.patch('http://localhost:3000/user', {username: userNameDef}, {withCredentials: true})
			.then((res) => {
				console.log('Succesfully changed name!');
			})
			.catch((err) => {
				console.log(err);
			})
		}
		if (inputRef.current && inputRef.current.value)
		{
			//update Avatar here
			axios.post('http://localhost:3000/user/avatar', {file: inputRef.current.files![0]}, {withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' }})
			.then((res) => {
				console.log('Avatar uploaded succesfully!');
			})
			.catch((err) => {
				console.log(err);
			})
		}
	}

	return (
		<div className="settings">
			<div className="background"/>
			<button onClick={() => {navigate('/')}}>Home</button>
			<img className='header' src={require('./images/logo.png')}/>
			<div className="block1">
				<h2>Username: </h2>
				<input type="text" value={userNameDef} maxLength={14} onChange={(e) => {setUserNameDef(e.target.value)}}/>
				<h2>Avatar: </h2>
				<img className='avatar' src={avatar}/>
				<br />
				<input ref={inputRef} type="file" id="img" name="img" accept="image/*" onChange={onChangeAvatar}/>
				<h2>2FA</h2>
				{ user && !user.twofa ? <button>Enable 2FA</button> : <button>Disable 2FA</button>}
				{inputRef.current && inputRef.current.value ? <button onClick={onRemoveAvatar}>Reset avatar</button> : ''}
				<br />
				<button onClick={sumbit}>Update</button>
			</div>
		</div>
	);
}

export default Settings;
