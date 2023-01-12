/* Materia UI */
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showSnackbarNotification } from '../../../App';
import { hostname } from '../../../context/host';
import { SocketContext } from '../../../context/socket';
import { User } from './Channels';

const ProtectedGroup: React.FC<{
	user: User;
	open: boolean;
	setClose: () => void;
}> = ({ user, open, setClose }) => {

	const navigate = useNavigate();
	const socket = useContext(SocketContext);
	const { enqueueSnackbar } = useSnackbar();

	const [channelName, setChannelName] = useState<string>('');
	const [channelPassword, setChannelPassword] = useState<string>('');


	const create = () => {
		/* Parsing chatDialogPassword and chatDialogName */
		if (channelName.length < 3) {
			showSnackbarNotification(enqueueSnackbar, 'Group name must be at least 3 characters long.', 'error');
			return;
		}
		if (channelName.length > 20) {
			showSnackbarNotification(enqueueSnackbar, 'Group name must be at most 20 characters long.', 'error');
			return;
		}
		if (channelName.includes(' ')) {
			showSnackbarNotification(enqueueSnackbar, 'Group name must not contain spaces.', 'error');
			return;
		}
		if (channelPassword.length < 3) {
			showSnackbarNotification(enqueueSnackbar, 'Password must be at least 3 characters long.', 'error');
			return;
		}
		if (channelPassword.length > 20) {
			showSnackbarNotification(enqueueSnackbar, 'Password must be at most 20 characters long.', 'error');
			return;
		}
		if (channelPassword.includes(' ')) {
			showSnackbarNotification(enqueueSnackbar, 'Password must not contain spaces.', 'error');
			return;
		}

		/* Create channel */
		const payload = {
			name: channelName,
			type: 'GROUP_PROTECTED',
			password: channelPassword
		};

		axios.post('http://' + hostname + ':3000/chat/' + user?.id + '/create', payload, { withCredentials: true })
		.then(res => {
			if (socket)
				socket.emit('chat/join', { chatID: res.data.id });
			showSnackbarNotification(enqueueSnackbar, 'Group created successfully.', 'success');
			setClose();
		})
		.catch(err => {
			if (err.response.data.statusCode === 401)
				navigate('/login');
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
		});
		setChannelName('');
	}

	return (
		<>
			{ !socket && <CircularProgress /> }
			{
				socket && 
				<Dialog open={open} onClose={setClose}>
					<DialogTitle>Create Group</DialogTitle>
					<DialogContent>
						<DialogContentText>
							Create a new group without a password.
						</DialogContentText>
						<TextField
							autoFocus
							margin="dense"
							id="groupname"
							label="Group Name"
							type="text"
							required={true}
							fullWidth
							onChange={event => setChannelName(event.currentTarget.value)}
							variant="standard"
							/>
						<TextField
							autoFocus
							margin="dense"
							id="password"
							label="Password"
							type="password"
							required={true}
							fullWidth
							onChange={event => setChannelPassword(event.currentTarget.value)}
							variant="standard"
							/>
					</DialogContent>
					<DialogActions>
						<Button onClick={setClose} color='error'>Cancel</Button>
						<Button onClick={create} color='success'>Create</Button>
					</DialogActions>
				</Dialog>
			}
		</>
	);
}
export default ProtectedGroup;