import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../../../context/socket';
import Chat from '../Chat';

/* Materia UI */
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import MessageIcon from '@mui/icons-material/Message';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';


type User = {
	id: number;
	username: string;
};

const Channels: React.FC<{
	user: User | null;
	currentChat: Chat | null;
	setCurrentChat: (chat: Chat | null) => void;
}> = ({ user, currentChat, setCurrentChat }) => {

	/* Utilities */
	const socket = useContext(SocketContext);
	const navigate = useNavigate();

	/* Chats */
	const [joinedChats, setJoinedChats] = useState<Chat[]>([]);
	const [publicChats, setPublicChats] = useState<Chat[]>([]);
	const [protectedChats, setProtectedChats] = useState<Chat[]>([]);

	/* Refresh chats */
	const [refreshChats, setRefreshChats] = useState<string>('');


	/* Create Chat Dialog Options */
	const [chatDialogName, setChatDialogName] = useState<string>('');
	const [chatDialogPassword, setChatDialogPassword] = useState<string>('');
	const [open, setOpen] = useState(false);

	/* Gets all chats for the current user and sets them in the application state */

	useEffect(() => {
		console.log('getAndSetChatsForUser', user);
		/* Get all chats */
		if (!user)
			return;
		axios.get('http://localhost:3000/chat/' + user.id + '/chats?filter=all', { withCredentials: true })
		.then(res => {
			console.log('res', res.data);
			setJoinedChats(res.data.joined);
			setPublicChats(res.data.public);
			setProtectedChats(res.data.protected);
		})
		.catch(err => {
			console.log('err', err);
			if (err.response.data.statusCode === 401)
				navigate('/login');
			alert(err.response.data.message)
		});
	}, [user, refreshChats]);

	useEffect(() => {
		/* Listen to new and deleted created chats */
		socket.on('chat/refresh-chats', (chat: Chat) => {
			console.log('refresh-chats is called');
			setRefreshChats(new Date().toISOString());
		});
		return () => {
			socket.off('chat/refresh-chats');
		}
	}, [socket]);

	useEffect(() => {
		if (!user)
			return;
		
		if (!currentChat && joinedChats.length > 0) {
			/* set current chat to first chat */
			setCurrentChat(joinedChats[0]);
		}

		if (currentChat) {
			/* sort players */
			currentChat.users.sort((a, b) => {
				if (a.id === user?.id)
					return -1;
				else if (b.id === user?.id)
					return 1;
				else
					return 0;
			});
		}

	}, [currentChat]);


	function joinPublic(chat: Chat) {
		const payload = {
			chatID: chat.id
		}
		axios.patch('http://localhost:3000/chat/' + user?.id + '/join', payload, { withCredentials: true })
		.then(res => {
			socket.emit('chat/join', { chatID: chat.id });
			
		})
		.catch(err => {
			if (err.response.data.statusCode === 401)
				navigate('/login');
			alert(err.response.data.message)
		});
	}
	function joinProtected(chat: Chat) {
		const payload = {
			chatID: chat.id,
			password: prompt('Please enter the password')
		}
		axios.patch('http://localhost:3000/chat/' + user?.id + '/join', payload, { withCredentials: true })
		.then(res => {
			setRefreshChats(new Date().toISOString());
			socket.emit('chat/join', { chatID: chat.id });

			alert('Success');
		})
		.catch(err => {
			if (err.response.data.statusCode === 401)
				navigate('/login');
			alert(err.response.data.message)
		});
	}
	const handleChatClick = (chat: Chat, joined: boolean) => {
		if (currentChat?.id === chat.id)
			return;
		if (joined == true) {

			// sort players
			chat.users.sort((a, b) => {
				if (a.id === user?.id)
					return -1;
				else if (b.id === user?.id)
					return 1;
				else
					return 0;
			});
			setCurrentChat(chat);
			return;
		}
		else if (chat.type === 'GROUP') {
			joinPublic(chat);
		}
		else if (chat.type === 'GROUP_PROTECTED') {
			joinProtected(chat);
		}
	}

	const leaveChannel = (chatID: number) => {
		axios.delete('http://localhost:3000/chat/' + user?.id + '/leave/' + chatID, { withCredentials: true })
		.then(res => {
			socket.emit('chat/leave', { chatID: chatID });
			setRefreshChats(new Date().toISOString());
			if (currentChat?.id === chatID)
				setCurrentChat(null);
		})
		.catch(err => {
			if (err.response.data.statusCode === 401)
				navigate('/login');
			alert(err.response.data.message)
		});
	}

	useEffect(() => {
		if (!currentChat)
			return;


		if (joinedChats.length > 0) {
			console.log('joined chats!!!!!!!!!!!!!!!!!!!!!!!!!!');
			setCurrentChat(joinedChats[0]);
		}
		else {
			console.log('no joined chats');
			setCurrentChat(null);
		}
	}, [joinedChats]);





	function renderChannelBox(chat: any, joined: boolean) {
		let selected;
		if (!currentChat)
			selected = false;
		else
			selected = currentChat.id == chat.id;

		if (chat.type === 'PRIVATE') {
			return (
				<div className={selected ? 'chat selected' : 'chat' } key={chat.id} onClick={(event) => handleChatClick(chat, joined)}>
					<p className='title' >{ chat.name }</p>
					{
						joined == true ?
						<IconButton className='options' aria-label="options-button" sx={{ color: 'white' }}>
							<MessageIcon />
						</IconButton>
						:
						<IconButton className='options' aria-label="options-button" sx={{ color: 'white' }}>
							<AddIcon />
						</IconButton>
					}
					<p className='type' >{ 'private' }</p>
				</div>
			)
		}
		else {
			return (
				<div className={selected ? 'chat selected' : 'chat' } key={chat.id} onClick={(event) => handleChatClick(chat, joined)}>
					<p className='title' >{ chat.name }</p>
					{
						joined == true ?
						<IconButton className='options' aria-label="options-button" sx={{ color: 'white' }} onClick={() => { leaveChannel(chat.id) }}>
							<ClearIcon />
						</IconButton>
						:
						<IconButton className='options' aria-label="options-button" sx={{ color: 'white' }}>
							<AddIcon />
						</IconButton>
					}
					<p className='type' >{ chat.type == 'GROUP_PROTECTED' ? 'protected' : 'public' }</p>
				</div>
			)
		}
	}

	function renderJoinedChats() {
		return (
			<div>
				{
					/* Joined Chats */
					<div>
						<div className={ 'chat crossection' }>
							<p className='title' >{ 'Joined Chats' }</p>
						</div>
						{
							joinedChats.length == 0 ?
							<div className={'chat error'}>
								<p >{ 'No chats joined' }</p>
							</div>
							:
							<></>
						}
					</div>
				}
				{
					joinedChats.map((chat: Chat) => {
						return ( renderChannelBox(chat, true) )
					})
				}
			</div>
		)
	}

	function renderPublicChats() {
		return (
			<div>
				{
					/* Public Chats */
					publicChats.length > 0 &&
					<div className={ 'chat crossection' }>
						<p className='title' >{ 'Public Chats' }</p>
					</div>
				}
				{
					publicChats.map((chat: Chat) => {
						return ( renderChannelBox(chat, false) )
					})
				}
			</div>
		)
	}
	function renderProtectedChats() {
		return (
			<div>
				{
					/* Protected Chats */
					protectedChats.length > 0 &&
					<div className={ 'chat crossection' }>
						<p className='title' >{ 'Password Protected Chats' }</p>
					</div>
				}
				{
					protectedChats.map((chat: Chat) => {
						return ( renderChannelBox(chat, false) )
					})
				}
			</div>
		)
	}

	const handleChatCreateDialogClickOpen = () => {
		setOpen(true);
	};
	const handleChatCreateDialog = () => {
		/* Parsing chatDialogPassword and chatDialogName */
		if (chatDialogName === '') {
			alert('Name cannot be empty');
			return ;
		}
		if (chatDialogName.length > 20) {
			alert('Name cannot be longer than 20 characters');
			return ;
		}
		if (chatDialogName.length < 3) {
			alert('Name must be at least 3 characters long');
			return ;
		}
		if (chatDialogPassword && chatDialogPassword.length > 20) {
			alert('Password cannot be longer than 20 characters');
			return ;
		}
		if (chatDialogPassword && chatDialogPassword.length < 6) {
			alert('Password must be at least 6 characters long');
			return ;
		}
		let chatPayload;
		if (chatDialogPassword) { /* GROUP_PROTECTED */
			chatPayload = {
				name: chatDialogName,
				type: 'GROUP_PROTECTED',
				password: chatDialogPassword,
			}
		}
		else { /* GROUP_PUBLIC */
			chatPayload = {
				name: chatDialogName,
				type: 'GROUP',
			}
		}
		axios.post('http://localhost:3000/chat/' + user?.id + '/create', chatPayload, { withCredentials: true })
		.then(res => {
			setRefreshChats(new Date().toISOString());
			alert('Success');
			setOpen(false);
		})
		.catch(err => {
			console.log('err', err);
			if (err.response.data.statusCode === 401)
				navigate('/login');
			alert(err.response.data.message)
		});

		setChatDialogName('');
		setChatDialogPassword('');
	}
	const handleChatCreateDialogClose = () => {
		setOpen(false);
	};




	if (!user)
		return <CircularProgress />;

		return (
			<div className='block channels'>
				<div className='title'>
					<h1>Channels</h1>
				</div>
				<div className='content'>
					<button className='add' onClick={handleChatCreateDialogClickOpen}>+</button>
					<div className='general'>
						{ renderJoinedChats() }
						{ renderPublicChats() }
						{ renderProtectedChats() }
					</div>
				</div>

				<Dialog open={open} onClose={handleChatCreateDialogClose}>
					<DialogTitle>Create Group</DialogTitle>
					<DialogContent>
						<DialogContentText>
						To create a password-protected group, simply enter a password when prompted. If you do not enter a password, the group will be open to anyone. To create a private chat with another person, you must first follow that person.
						</DialogContentText>
						<TextField
							autoFocus
							margin="dense"
							id="groupname"
							label="Group Name"
							type="text"
							required={true}
							fullWidth
							onChange={event => setChatDialogName(event.currentTarget.value)}
							variant="standard"
						/>
						<TextField
							autoFocus
							margin="dense"
							id="password"
							label="Password"
							type="password"
							required={false}
							fullWidth
							onChange={event => setChatDialogPassword(event.currentTarget.value)}
							variant="standard"
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleChatCreateDialogClose} color='error'>Cancel</Button>
						<Button onClick={handleChatCreateDialog}>Subscribe</Button>
					</DialogActions>
				</Dialog>
			</div>
		);
};

export default Channels;
