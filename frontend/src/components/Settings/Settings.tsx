import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import axios from "axios";
import { useSnackbar } from "notistack";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showSnackbarNotification } from "../../App";
import './style.css';


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
	

	//Dialog states
	const [inputCode, setInputCode] = useState(['', '', '', '', '', '']);

	//Dialog states on enable
	const [dialogOpenE, setDialogOpenE] = useState(false);
	const [qrCodeE, setQrCodeE] = useState('');

	//Dialog states on disable
	const [dialogOpenD, setDialogOpenD] = useState(false);

	//Alerts
	// const enqueueSnackbar = useContext(SnackBarContext);
	const { enqueueSnackbar } = useSnackbar();



	useEffect(() => {
		getUserInfo();
		getAvatar();
		getQrCode();
	}, [])

	function getQrCode() {
		axios.get('http://' + process.env.HOST + ':3000/twofa', {withCredentials: true})
		.then(res => {
			setQrCodeE(res.data);
		})
		.catch(err => {
			if (err.response.data.statusCode === 401)
				navigate('/login');
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
		})
	}

	function getUserInfo() {
		axios.get('http://' + process.env.HOST + ':3000/user', {withCredentials: true})
		.then(elem => {
			setUser(elem.data);
			setUserNameDef(elem.data.username);
			setOriginUserName(elem.data.username);
		})
		.catch(err => {
			if (err.response.data.statusCode === 401)
				navigate('/login');
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
		})
	}

	const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

	async function getTwoFAStatus() {
		await sleep(300);
		axios.get('http://' + process.env.HOST + ':3000/twofa/status', {withCredentials: true})
		.then(res => {
			if (res.data === true)
			{
				var newUser: User | undefined = Object.assign({}, user);
				if (!newUser)
					return ;
				newUser.twofa = true;
				setUser(newUser);
			}
			else if (res.data === false)
			{
				var newUser: User | undefined = Object.assign({}, user);
				if (!newUser)
					return ;
				newUser.twofa = false;
				setUser(newUser);
			}
			setDialogOpenE(false);
			setDialogOpenD(false);
		})
		.catch(err => {
			if (err.response.data.statusCode === 401)
				navigate('/login');
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
		})
	}

	function getAvatar() {
		axios.get('http://' + process.env.HOST + ':3000/user/avatar', {withCredentials: true, responseType: 'blob'})
		.then(elem => {
			setAvatar(URL.createObjectURL(elem.data));
			setOriginAvatar(URL.createObjectURL(elem.data));
		})
		.catch(err => {
			if (err.response.data.statusCode === 401)
				navigate('/login');
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
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
			axios.patch('http://' + process.env.HOST + ':3000/user', {username: userNameDef}, {withCredentials: true})
			.then((res) => {
				showSnackbarNotification(enqueueSnackbar, 'Succesfully changed your username!', 'success');
				setOriginUserName(userNameDef);
			})
			.catch((err) => {
				if (err.response.data.statusCode === 401)
					navigate('/login');
				showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
			})
		}
		if (inputRef.current && inputRef.current.value)
		{
			//update Avatar here
			axios.post('http://' + process.env.HOST + ':3000/user/avatar', {file: inputRef.current.files![0]}, {withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' }})
			.then((res) => {
				showSnackbarNotification(enqueueSnackbar, 'Succesfully changed your avatar!', 'success');
			})
			.catch((err) => {
				if (err.response.data.statusCode === 401)
					navigate('/login');
				showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
			})
		}
	}

	function onDisableChange(e: ChangeEvent<HTMLInputElement>, num: number) {
		var data = [...inputCode];

		if (e.target.value.length > 1)
			data[num] = e.target.value[1];
		else
			data[num] = e.currentTarget.value;

		setInputCode(data);
		if (num === 0)
			document.getElementById('Dotc-2')?.focus()
		else if (num === 1)
			document.getElementById('Dotc-3')?.focus()
		else if (num === 2)
			document.getElementById('Dotc-4')?.focus()
		else if (num === 3)
			document.getElementById('Dotc-5')?.focus()
		else if (num === 4)
			document.getElementById('Dotc-6')?.focus()
		else if (num === 5)
		{
			var ret: string = '';
			for (var i: number = 0; i < 6; i++)
				ret = ret + data[i];
			if (ret.length !== 6)
				setInputCode(['', '', '', '', '', '']);
			else 
			{
				axios.patch('http://' + process.env.HOST + ':3000/twofa/disable', {token: ret}, {withCredentials: true})
				.then(() => {
						getTwoFAStatus();
						setDialogOpenD(false);
						setInputCode(['', '', '', '', '', '']);
				})
				.catch(err => {
					setInputCode(['', '', '', '', '', '']);
					document.getElementById('Dotc-1')?.focus()
					if (err.response.data.statusCode === 401)
						navigate('/login');
					showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
				})
			}
		}
	}

	function onEnableChange(e: ChangeEvent<HTMLInputElement>, num: number) {
		var data = [...inputCode];

		if (e.target.value.length > 1)
			data[num] = e.target.value[1];
		else
			data[num] = e.currentTarget.value;

		setInputCode(data);
		if (num === 0)
			document.getElementById('Eotc-2')?.focus()
		else if (num === 1)
			document.getElementById('Eotc-3')?.focus()
		else if (num === 2)
			document.getElementById('Eotc-4')?.focus()
		else if (num === 3)
			document.getElementById('Eotc-5')?.focus()
		else if (num === 4)
			document.getElementById('Eotc-6')?.focus()
		else if (num === 5)
		{
			var ret: string = '';
			for (var i: number = 0; i < 6; i++)
				ret = ret + data[i];
			if (ret.length !== 6)
				setInputCode(['', '', '', '', '', '']);
			else 
			{
				axios.patch('http://' + process.env.HOST + ':3000/twofa/enable', {token: ret}, {withCredentials: true})
				.then(() => {
					navigate('/login');
				})
				.catch(err => {
					setInputCode(['', '', '', '', '', '']);
					document.getElementById('Eotc-1')?.focus()
					if (err.response.data.statusCode === 401)
						navigate('/login');
					showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
				})
			}
		}
	}


	return (
		<div className="settings">
			<div className="background"/>
			<button onClick={() => {navigate('/')}}>Home</button>
			<img className='header' src={require('./images/logo.png')}/>
			<div className="block1">
				<h2>Username: </h2>
				<input type="text" value={userNameDef} maxLength={14} onChange={(e) => {setUserNameDef(e.target.value)}} required/>
				<h2>Avatar: </h2>
				<img className='avatar' src={avatar}/>
				<br />
				<input ref={inputRef} type="file" id="img" name="img" accept="image/*" onChange={onChangeAvatar}/>
				<h2>2FA</h2>
				{ user && !user.twofa ? <button onClick={() => {setDialogOpenE(true)}}>Enable 2FA</button> : <button onClick={() => {setDialogOpenD(true)}}>Disable 2FA</button>}
				{inputRef.current && inputRef.current.value ? <button onClick={onRemoveAvatar}>Reset avatar</button> : ''}
				<br />
				<button onClick={sumbit}>Update</button>
				
			</div>
			<Dialog open={dialogOpenE}
					onClose={() => {setDialogOpenE(false); setInputCode(['', '', '', '', '', '']);}}
					>
					<DialogTitle padding={0}>Setup 2FA Authenticator</DialogTitle>
				<img src={qrCodeE}/>
				<pre>Scan the qr code with Authenticator app and <br />
				enter the code below to activate!</pre>
				<form className="otc" name="one-time-code" action="#">
					<fieldset>
						<div>
							<input	type="number" pattern="[0-9]*" 
									maxLength={1} value={inputCode[0]} 
									autoComplete="one-time-code" id="Eotc-1" 
									onChange={(e) => onEnableChange(e, 0)} required/>
							<input 	type="number" pattern="[0-9]*" 
									min='0' max='9' value={inputCode[1]} 
									id="Eotc-2" 
									onChange={(e) => onEnableChange(e, 1)} required/>

							<input 	type="number" value={inputCode[2]} 
									id="Eotc-3" 
									onChange={(e) => onEnableChange(e, 2)} required/>

							<input 	type="number" value={inputCode[3]} 
									id="Eotc-4" 
									onChange={(e) => onEnableChange(e, 3)} required/>

							<input 	type="number" value={inputCode[4]} 
									id="Eotc-5" 
									onChange={(e) => onEnableChange(e, 4)} required/>

							<input 	type="number" value={inputCode[5]} 
									id="Eotc-6" 
									onChange={(e) => onEnableChange(e, 5)}  required/>
						</div>
					</fieldset>
				</form>
			</Dialog>
			<Dialog open={dialogOpenD}
					onClose={() => {setDialogOpenD(false); setInputCode(['', '', '', '', '', '']);}}
					>
					<DialogTitle padding={0}>Disable 2FA Authenticator</DialogTitle>
				<pre>Enter qr code to disable Authenticator. <br />
				If you lost your code contact administrator.</pre>
				{/* <input type="text" /> */}
				<form className="otc" name="one-time-code" action="#">
					<fieldset>
						<div>
							<input	type="number" pattern="[0-9]*" 
									maxLength={1} value={inputCode[0]} 
									autoComplete="one-time-code" id="Dotc-1" 
									onChange={(e) => onDisableChange(e, 0)} required/>

							<input 	type="number" pattern="[0-9]*" 
									min='0' max='9' value={inputCode[1]} 
									id="Dotc-2" 
									onChange={(e) => onDisableChange(e, 1)} required/>

							<input 	type="number" value={inputCode[2]} 
									id="Dotc-3" 
									onChange={(e) => onDisableChange(e, 2)} required/>

							<input 	type="number" value={inputCode[3]} 
									id="Dotc-4" 
									onChange={(e) => onDisableChange(e, 3)} required/>

							<input 	type="number" value={inputCode[4]} 
									id="Dotc-5" 
									onChange={(e) => onDisableChange(e, 4)} required/>

							<input 	type="number" value={inputCode[5]} 
									id="Dotc-6" 
									onChange={(e) => onDisableChange(e, 5)}  required/>
						</div>
					</fieldset>
				</form>
			</Dialog>
		</div>
	);
}

export default Settings;


