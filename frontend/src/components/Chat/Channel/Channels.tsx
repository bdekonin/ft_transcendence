import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../../../context/socket';
import Chat from '../Chat';

/* Materia UI */
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import MessageIcon from '@mui/icons-material/Message';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import PublicGroup from './PublicGroup';
import ProtectedGroup from './ProtectedGroup';
import { useSnackbar } from "notistack";
import { showSnackbarNotification } from '../../../App';


export type User = {
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
	const { enqueueSnackbar } = useSnackbar();

	/* Chats */
	const [joinedChats, setJoinedChats] = useState<Chat[]>([]);
	const [publicChats, setPublicChats] = useState<Chat[]>([]);
	const [protectedChats, setProtectedChats] = useState<Chat[]>([]);

	/* Refresh chats */
	const [refreshChats, setRefreshChats] = useState<string>('');

	/* Gets all chats for the current user and sets them in the application state */

	useEffect(() => {
		/* Get all chats */
		if (!user)
			return;
		axios.get('http://localhost:3000/chat/' + user.id + '/chats?filter=all', { withCredentials: true })
		.then(res => {
			setJoinedChats(res.data.joined);
			setPublicChats(res.data.public);
			setProtectedChats(res.data.protected);
		})
		.catch(err => {
			console.log('err', err);
			if (err.response.data.statusCode === 401)
				navigate('/login');
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
		});
	}, [user, refreshChats]);

	useEffect(() => {
		/* Listen to new and deleted created chats */
		socket.on('chat/refresh-chats', (chat: Chat) => {
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
			if (joinedChats.length != 1)
				setCurrentChat(joinedChats[0]);
			return ;
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
			return ;
		}

		setCurrentChat(null);
	}, [currentChat]);


	function joinPublic(chat: Chat) {
		const payload = {
			chatID: chat.id
		}
		axios.patch('http://localhost:3000/chat/' + user?.id + '/join', payload, { withCredentials: true })
		.then(res => {
			socket.emit('chat/join', { chatID: chat.id }); /* Join the room / Let other users know that a new user joined */
			setRefreshChats(new Date().toISOString());
		})
		.catch(err => {
			if (err.response.data.statusCode === 401)
				navigate('/login');
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
		});
	}
	function joinProtected(chat: Chat) {
		const payload = {
			chatID: chat.id,
			password: prompt('Please enter the password')
		}
		axios.patch('http://localhost:3000/chat/' + user?.id + '/join', payload, { withCredentials: true })
		.then(res => {
			socket.emit('chat/join', { chatID: chat.id }); /* Join the room / Let other users know that a new user joined */
			setRefreshChats(new Date().toISOString());

			alert('Success');
			showSnackbarNotification(enqueueSnackbar, 'Success', 'success');

		})
		.catch(err => {
			if (err.response.data.statusCode === 401)
				navigate('/login');
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
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
			if (currentChat?.id === chatID) {
				setCurrentChat(null);
			}
			if (joinedChats.length === 1) {
				setCurrentChat(null);
			}
		})
		.catch(err => {
			if (err.response.data.statusCode === 401)
				navigate('/login');
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
		});
	}

	useEffect(() => {
		if (!currentChat)
			return;


		const currentChatId = currentChat.id;
		const joinedChatIds = joinedChats.map(chat => chat.id);
		const hasCurrentChatId = joinedChatIds.some(id => id === currentChatId);

		if (hasCurrentChatId) {
			return ;
		}

		/* Check if currentChat.id is in joinedChats */
		if (joinedChats.length > 0) {
			setCurrentChat(joinedChats[0]);
		}
		else {
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

	const [publicDialogOpen, setPublicDialogOpen] = useState(false);
	const [protectedDialog, setprotectedDialog] = useState(false);
	const [joinPasswordDialog, setJoinPasswordDialog] = useState(false);

	const handlePublicDialogClose = () => {
		setPublicDialogOpen(false);
	};
	const handlePublicDialogOpen = () => {
		setPublicDialogOpen(true);
	}

	const handleProtectedDialogClose = () => {
		setprotectedDialog(false);
	};
	const handleProtectedDialogOpen = () => {
		setprotectedDialog(true);
	}

	const handleJoinPasswordDialogClose = () => {
		setJoinPasswordDialog(false);
	};
	const handleJoinPasswordDialogOpen = () => {
		setJoinPasswordDialog(true);
	}

	if (!user)
		return <CircularProgress />;

		return (
			<div className='block channels'>
				<div className='title'>
					<h1>Channels</h1>
				</div>
				<div className='content'>
					<button className='add' onClick={handlePublicDialogOpen}>Create Public Group</button>
					<button className='add' onClick={handleProtectedDialogOpen}>Create Protected Group</button>
					<div className='general'>
						{ renderJoinedChats() }
						{ renderPublicChats() }
						{ renderProtectedChats() }
					</div>
				</div>

				<PublicGroup
					user={user}
					open={publicDialogOpen}
					setOpen={handlePublicDialogClose}
				/>
				<ProtectedGroup
					user={user}
					open={protectedDialog}
					setOpen={handleProtectedDialogClose}
				/>
			</div>
		);
};

export default Channels;
