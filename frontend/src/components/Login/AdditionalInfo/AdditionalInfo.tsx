import axios from "axios";
import { isAlphanumeric } from "class-validator";
import { url } from "inspector";
import { ChangeEvent, FC, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import './style.css'

const AdditionalInfo: FC = () => {
	const [selected, setSelected] = useState(1);
	const [userName, setUserName] = useState('');
	const [invalidInput, setInvalidInput] = useState(false);
	const [confirm, setConfirm] = useState(false);
	const navigate = useNavigate();
	const [image, setImage] = useState<File>();
	const [previewImage, setPreviewImage] = useState('');

	useEffect(() => {
		checkUserNameInput();
	}, [userName]);

	function checkUserNameInput() {
		const length = userName.length;

		if (!isAlphanumeric(userName) && length != 0)
			setInvalidInput(true);
		else
		{
			setInvalidInput(false);
			if (length != 0)
			{
				setConfirm(true);
				return ;
			}
		}
		setConfirm(false);
	}

	function getAllAvatars() {
		const image = [];

		if (previewImage) {
			image.push(<img src={previewImage} className='previewimage' onClick={() => {document.getElementById('avatarupload')?.click()}} />);
			image.push(<img src={require('./images/remove-icon-png-7123.png')} id="remove" onClick={resetPreviewImage}/>);
		}
		else
			image.push(<img src={require('./images/kisspng-computer-icons-symbol-plus-and-minus-signs-5ae5a8ce966e56.3419481815250003986162.png')} onClick={() => {document.getElementById('avatarupload')?.click()}} /> )

		for (var i = 1; i < 16; i++) 
		{
			const numb = i;
			if (i === selected && !previewImage)
				image.push(
					<img src={require("./images/avatars/icons8-avatar-64-"+i+".png")} 
					className='selected'
					key={i}
					onClick={() => {setSelected(numb)}}/>);
			else
				image.push(<img src={require("./images/avatars/icons8-avatar-64-"+i+".png")}
				key={i}
				onClick={() => {setSelected(numb); resetPreviewImage();}}/>);
		}
		return image;
	}

	function sumbit() {
		axios.patch('http://localhost:3000/user', { username: userName }, { withCredentials: true })
		.then(res => {
			console.log(res);
			navigate('/');
		})
		.catch(err => {
			console.log(err);
		})
		if (!previewImage)
		{
			setImage(require('./images/avatars/icons8-avatar-64-'+ selected +'.png'));
		}

		axios.post('http://localhost:3000/user/avatar', {file: image} , { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } })
		.then(res => {
			console.log(res);
			navigate('/');
		})
		.catch(err => {
			console.log(err);
		})
	}

	function resetPreviewImage() {
		setImage(undefined);
		setPreviewImage('');
	}

	function changePreviewImage(event: ChangeEvent<HTMLInputElement>) {
		console.log('Changing preview image!');
		setImage(event.target.files![0]);
		setPreviewImage(URL.createObjectURL(event.target.files![0]));
	}

	return (
		<div className="additionalinfo">
			<div className="background"/>

			<h1 className="header">Additional info</h1>
			<h3 className="text">Enter username:</h3>
			<input
				className="input"
				type="text"
				onChange={event => setUserName(event.currentTarget.value)}
				name={userName}
				maxLength={14}/>
				
			{invalidInput ?
			<p className="invalidinput">
				username can only characters or numbers!
			</p> : ''}

			<h3 className="text">Pick a Avatar:</h3>
			 <div className="avatarlist">
				{getAllAvatars().map((elem) => {
					return elem;
				})}
			</div>
		{ confirm ?
			<button
				onClick={sumbit}>
				Done
			</button> : ''}

			{/* <br />
			<h3 className="text">Upload avatar:</h3>
			<form>
				<input type="file" name="img" accept="image/*" onChange={onImgChange}/>
			</form>
			{previewImage ? <img src={previewImage} className='previewimage' /> : ''} */}
			<input id="avatarupload" type="file" onChange={changePreviewImage} hidden/>
		</div>
	)
}

export default AdditionalInfo;