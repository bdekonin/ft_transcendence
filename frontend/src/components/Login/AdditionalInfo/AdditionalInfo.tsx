import axios from "axios";
import { isAlphanumeric } from "class-validator";
import React from "react";
import { ChangeEvent, FC, useEffect, useRef, useState } from "react"
import { UNSAFE_LocationContext, useNavigate } from "react-router-dom";
// import '../../styles/additioninfo.css'
import './style.css'
import lottie from 'lottie-web'
import animation from './data.json'

const AdditionalInfo: FC = () => {
	const [selected, setSelected] = useState(1);
	const [userName, setUserName] = useState('');
	const [invalidInput, setInvalidInput] = useState(false);
	const [confirm, setConfirm] = useState(false);
	const navigate = useNavigate();
	const [image, setImage] = useState<File>();
	const [previewImage, setPreviewImage] = useState('');
	const animationContainer = useRef<HTMLDivElement | null>(null)

	var anim = null;

	// document.body.style.backgroundColor = "#474E68"; //very nice color

	useEffect(() => {
		checkUserNameInput();
	}, [userName]);

	useEffect(() => {
		if(animationContainer.current) // add this
		lottie.loadAnimation({
			container: animationContainer.current,
			animationData: animation,
			loop: true
		});
	}, [animationContainer])

	function checkUserNameInput() {
		const length = userName.length;

		// console.log('length = ' + length);
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

		for (var i = 1; i < 16; i++)
		{
			const numb = i;
			if (i === selected)
				image.push(
					<img src={require("../../../avatars/icons8-avatar-64-"+i+".png")} 
					className='selected'
					key={i}
					onClick={() => {setSelected(numb)}}/>);
			else
				image.push(<img src={require("../../../avatars/icons8-avatar-64-"+i+".png")}
				key={i}
				onClick={() => {setSelected(numb)}}/>);
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
		axios.post('http://localhost:3000/user/avatar', {file: image} , { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } })
		.then(res => {
			console.log(res);
			navigate('/');
		})
		.catch(err => {
			console.log(err);
		})
	}

	function onImgChange(event: ChangeEvent<HTMLInputElement>) {
		setImage(event.target.files![0]);
		setPreviewImage(URL.createObjectURL(event.target.files![0]));
	}

	return (
		<div className="additionalinfo">
			<div id="bm" ref={animationContainer}></div>

			<h1 className="header">Additional info</h1>
			<h3>Enter username:</h3>
			<input
				type="text"
				onChange={event => setUserName(event.currentTarget.value)}
				name={userName}
				maxLength={14}/>
				
			{invalidInput ?
			<p className="invalidinput">
				username can only characters or numbers!
			</p> : ''}

			{/* <h3 className="avatartext">Pick a Avatar</h3>
			 <div className="avatarlist">
				{getAllAvatars().map((elem) => {
					return elem;
				})}
			</div> */}
		{ confirm ?
			<button className="bubbly-button"
			onClick={sumbit}>
				Done
			</button> : ''}

			<br />
			<h3>Upload avatar:</h3>
			<form>
				<input type="file" id="img" name="img" accept="image/*" onChange={onImgChange}/>
			</form>
			{previewImage ? <img src={previewImage} className='previewimage' /> : ''}
		</div>
	)
}

export default AdditionalInfo;