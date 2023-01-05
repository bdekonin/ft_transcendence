import { Dialog, DialogTitle } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import React, { ChangeEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { showSnackbarNotification } from '../../../App';

export default function TwoFA() {
	const navigate = useNavigate();
	const [inputCode, setInputCode] = useState(['', '', '', '', '', '']);

	function onChange(e: ChangeEvent<HTMLInputElement>, num: number) {
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
			console.log(ret);
			if (ret.length !== 6)
				setInputCode(['', '', '', '', '', '']);
			else 
			{
				axios.post('http://localhost:3000/twofa/verify', {token: ret}, {withCredentials: true})
				.then(res => {
					setInputCode(['', '', '', '', '', '']);
					navigate('/');
				})
				.catch(err => {
					alert(err.response.data.message);
					setInputCode(['', '', '', '', '', '']);
					document.getElementById('Dotc-1')?.focus()
				})
			}
		}
	}

	return (
		<div>
			<Dialog fullWidth={true} open={true}>
					<DialogTitle >2FA Authenticator</DialogTitle>
				<pre>Enter qr code to login. <br />
				If you lost your code contact administrator.</pre>
				<form className="otc" name="one-time-code" action="#">
					<fieldset>
						<div>
							<input	type="number" pattern="[0-9]*" 
									maxLength={1} value={inputCode[0]} 
									autoComplete="one-time-code" id="Dotc-1" 
									onChange={(e) => onChange(e, 0)} required/>

							<input 	type="number" pattern="[0-9]*" 
									min='0' max='9' value={inputCode[1]} 
									id="Dotc-2" 
									onChange={(e) => onChange(e, 1)} required/>

							<input 	type="number" value={inputCode[2]} 
									id="Dotc-3" 
									onChange={(e) => onChange(e, 2)} required/>

							<input 	type="number" value={inputCode[3]} 
									id="Dotc-4" 
									onChange={(e) => onChange(e, 3)} required/>

							<input 	type="number" value={inputCode[4]} 
									id="Dotc-5" 
									onChange={(e) => onChange(e, 4)} required/>

							<input 	type="number" value={inputCode[5]} 
									id="Dotc-6" 
									onChange={(e) => onChange(e, 5)}  required/>
						</div>
					</fieldset>
				</form>
			</Dialog>
		</div>
	)
}
