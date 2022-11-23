import axios from "axios";
import { isAlphanumeric } from "class-validator";
import { FC, useEffect, useState } from "react"
import '../../styles/additioninfo.css'

const AdditionalInfo: FC = () => {
	const [selected, setSelected] = useState(1);
	const [userName, setUserName] = useState('');
	const [invalidInput, setInvalidInput] = useState(false);
	const [confirm, setConfirm] = useState(false);
	

	useEffect(() => {
		checkUserNameInput();
	}, [userName]);

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
					<img src={require("../../avatars/icons8-avatar-64-"+i+".png")} 
					className='selected'
					key={i}
					onClick={() => {setSelected(numb)}}/>);
			else
				image.push(<img src={require("../../avatars/icons8-avatar-64-"+i+".png")}
				key={i}
				onClick={() => {setSelected(numb)}}/>);
		}
		return image;
	}

	function sumbit() {
		// axios.patch('http://localhost:3000/user', { 'username': userName }, { withCredentials: true })
		// .then(res => {
		// 	console.log(res);
		// })
		// .catch(err => {
		// 	console.log(err);
		// })

		const file = new File([''], "../../avatars/icons8-avatar-64-"+selected+".png");
		
		var form = new FormData();
		form.append('file', file);

		console.log(file);

		axios.post('http://localhost:3000/user/avatar', form, {
			headers: {
				'Content-Type': 'image/png'
			},
			withCredentials: true
		})
		.then(res => {
			console.log(res);
		})
		.catch(err => {
			console.log(err);
		})
	}

	return (
		<div className="additionalinfo">
			<h1>Additional info</h1>
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

			<h3 className="avatartext">Pick a Avatar</h3>
			<div className="avatarlist">
			{/* <img src={require("../../images/1200px-Plus_symbol.svg.png")}
				onClick={() => {
					{input}
				}} /> */}
			{/* <input type="file" /> */}
			{getAllAvatars().map((elem) => {
				return elem;
			})}
			
			</div>
		{ confirm ?
			<button className="bubbly-button"
			onClick={sumbit}>
				Done
			</button> : ''}
			{/* <video
			 muted
			 autoPlay
			 loop >
				<source src={require("../../videos/pongvideo.mp4")}
				type="video/mp4"/>
			</video> */}
		</div>
	)
}

export default AdditionalInfo;