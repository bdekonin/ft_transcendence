import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import axios from "axios";
import { useSnackbar } from 'notistack';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showSnackbarNotification } from '../../../App';
import Chat from "../Chat";
import { User } from "./Channels";




const SettingsDialog: React.FC<{
	currentUser: User;
	currentChat: Chat | null;
	open: boolean;
	setClose: () => void;
	setCurrentChat: (chat: Chat | null) => void;
	leaveChannel: (chatID: number) => void;
}> = ({ currentUser, currentChat, open, setClose, setCurrentChat, leaveChannel}) => {
	
	const navigate = useNavigate();

	const [channelPassword, setChannelPassword] = useState<string>('');
	const [channelName, setChannelName] = useState<string>('');
	const { enqueueSnackbar } = useSnackbar();


	const update = () => {
		/* Create channel */

		if (channelName.length == 0 && channelPassword.length == 0) {
			showSnackbarNotification(enqueueSnackbar, 'Cannot update empty values.', 'error');
			return ;
		}

		const payload = {
			name: channelName,
			password: channelPassword.length == 0 ? null : channelPassword
		};

		axios.patch('http://localhost:3000/chat/' + currentUser.id + '/update/' + currentChat?.id, payload, { withCredentials: true })
		.then(res => {
			showSnackbarNotification(enqueueSnackbar, 'Group updated successfully.', 'success');
			setClose();
		})
		.catch(err => {
			if (err.response.data.statusCode === 401)
				navigate('/login');
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
		});
		setChannelName('');
		setChannelPassword('');
	}

	const change = () => {
		const isProtected = currentChat?.type == 'GROUP_PROTECTED'

		let password = null;

		if (!isProtected) {
			password = prompt('Enter the password for the channel');
			if (password == null || password.length == 0) {
				alert('Cannot create a channel with empty password');
				return ;
			}
			if (password.length < 3) {
				alert("Protected group chat password must be at least 3 characters long");
			}
			if (password.length > 20) {
				alert("Protected group chat password cannot be longer then 20 characters");
			}
		}

		axios.patch('http://localhost:3000/chat/' + currentUser.id + '/switch/' + currentChat?.id, { password: password }, { withCredentials: true })
		.then(res => {
			showSnackbarNotification(enqueueSnackbar, 'Group updated successfully.', 'success');
			setClose();
		})
		.catch(err => {
			if (err.response.data.statusCode === 401)
				navigate('/login');
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
		});

		return null;
	}

	return (
		<>
			{
				currentChat && 
				<Dialog open={open} onClose={setClose}>
				<DialogTitle>Settings</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Update the password for the channel or leave the channel.
					</DialogContentText>
					<TextField
						autoFocus
						margin="dense"
						id="name"
						label="Channel name"
						type="text"
						defaultValue={currentChat.name}
						fullWidth
						onChange={event => setChannelName(event.currentTarget.value)}
						variant="standard"
					/>
					{
						currentChat.type == 'GROUP_PROTECTED' &&
						<TextField
							autoFocus
							margin="dense"
							id="password"
							label="Password"
							type="password"
							fullWidth
							onChange={event => setChannelPassword(event.currentTarget.value)}
							variant="standard"
						/>
					}
				</DialogContent>
				<DialogActions>
					<Button color='secondary' variant="contained" onClick={setClose}> Cancel </Button>
					{
						currentChat.type == 'GROUP_PROTECTED' ?
						<Button color='primary' variant="contained" onClick={() => change()}> Remove the password </Button>
						:
						<Button color='primary' variant="contained" onClick={() => change()}> Set a password </Button>
					}
					<Button color='error' variant="contained" onClick={() => { leaveChannel(currentChat.id); setClose() }}> Leave The Channel </Button>
					<Button color='success' variant="contained" onClick={() => update()}> Update The Channel </Button>
				</DialogActions>
			  </Dialog>
			}
		</>
	);
}
export default SettingsDialog;