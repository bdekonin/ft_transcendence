import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../../../context/socket";
import Chat from "../Chat";
import { User } from "./Channels";





const PasswordDialog: React.FC<{
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

	const update = () => {
		/* Create channel */

		if (channelName.length == 0 && channelPassword.length == 0) {
			alert('Cannot update empty values')
			return ;
		}

		const payload = {
			name: channelName,
			password: channelPassword.length == 0 ? null : channelPassword
		};

		axios.patch('http://localhost:3000/chat/' + currentUser.id + '/update/' + currentChat?.id, payload, { withCredentials: true })
		.then(res => {
			alert('Group updated successfully.');
			setClose();
		})
		.catch(err => {
			if (err.response.data.statusCode === 401)
				navigate('/login');
			alert(err.response.data.message)
		});
		setChannelName('');
		setChannelPassword('');
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
				  <Button color='success' variant="contained" onClick={() => update()}> Update The Channel </Button>
				  <Button color='error' variant="contained" onClick={() => { leaveChannel(currentChat.id); setClose() }}> Leave The Channel </Button>
				</DialogActions>
			  </Dialog>
			}
		</>
	);
}
export default PasswordDialog;