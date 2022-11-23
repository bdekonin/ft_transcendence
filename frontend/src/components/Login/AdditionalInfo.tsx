import { ClassNames } from "@emotion/react";
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

		console.log('length = ' + length);
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

		for (var i = 1; i < 17; i++)
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
			{getAllAvatars().map((elem) => {
				return elem;
			})}
			</div>
		{ confirm ?
			<button>
				
			</button> : ''}
		</div>
	)
}

export default AdditionalInfo;