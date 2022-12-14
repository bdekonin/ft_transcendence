import { useEffect, useState , useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment, { Moment } from 'moment';
import './style.css'
import { SocketContext } from '../../context/socket';

import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import MessageIcon from '@mui/icons-material/Message';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Channels from './Channel/Channels';

interface User {
	id: number;
	username: string;
}

interface Chat {
	id: number;
	type: string;
	name: string;
	users: User[];
	unread: boolean;
}
interface Message {
	id: number;
	message: string;
	sender: User;
	parent: Chat;
	createdAt: string;
}
interface Avatar {
	id: number,
	avatar: string
}

const Chat: React.FC = () => {
	
	const socket = useContext(SocketContext);
	const navigate = useNavigate();
	const [user, setUser] = useState<User | null>(null);
	const [currentChat, setCurrentChat] = useState<Chat | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [chatBoxMsg, setChatBoxMsg] = useState<string>('');
	
	/* Chats */
	const [joinedChats, setJoinedChats] = useState<Chat[]>([]);
	const [publicChats, setPublicChats] = useState<Chat[]>([]);
	const [protectedChats, setProtectedChats] = useState<Chat[]>([]);

	/* Refresh Chats*/
	const [refreshChats, setRefreshChats] = useState('');

	/* Create Chat Dialog Options */
	const [chatDialogName, setChatDialogName] = useState<string>('');
	const [chatDialogPassword, setChatDialogPassword] = useState<string>('');
	const [open, setOpen] = useState(false);

	document.body.style.background = '#323232';

	useEffect(() => {
		axios.get('http://localhost:3000/user', { withCredentials: true })
		.then(res => {
			setUser(res.data);
		})
		.catch(err => {
			console.log('err', err);
			if (err.response.data.statusCode === 401)
				navigate('/login');
			alert(err.response.data.message)
		});
	}, []); /* Renders only once */

	/* Means there is a new message so update messages when the chatID == currentChatID*/
	useEffect(() => {
		socket.on('chat/refresh-message', (payload: Message) => {
			if (payload.parent.id === currentChat?.id){
				setMessages((messages) => [payload, ...messages]);
			}
			else {
				/* Enable notification for that channel */
			}
		})
		return () => {
			socket.off('chat/refresh-message');
		}
	}, [socket]);

	/* Retrieving User's Chats */
	useEffect(() => {
		if (!user)
			return;
		axios.get('http://localhost:3000/chat/' + user?.id + '/chats?filter=all', { withCredentials: true })
		.then(res => {
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
		if (joinedChats.length === 0) {
			setCurrentChat(null);
			return ;
		}
		joinedChats[0].users.sort((a, b) => {
			if (a.id === user?.id)
				return -1;
			else if (b.id === user?.id)
				return 1;
			else
				return 0;
		});
		setCurrentChat(joinedChats[0]);
	}, [joinedChats]);

	/* Retrieving stats of the currentChat */
	useEffect(() => {
		if (!currentChat)
			return;
		axios.get('http://localhost:3000/chat/' + user?.id + '/messages/' + currentChat.id, { withCredentials: true })
		.then(res => {
			setMessages(res.data);
		})
		.catch(err => {
			console.log('err', err);
			if (err.response.data.statusCode === 401)
				navigate('/login');
			alert(err.response.data.message)
		});
	}, [currentChat]);


	function renderMessages(divName: string) {
		if (currentChat == null)
		return (
			<div className={divName}>
					<h1>Choose a chat</h1>
				</div>
			)
		return (
			<div className={divName}>
				<h2 className='chatName'>{currentChat.name}</h2>
				{
					messages.map((message, index)=> {
						return (
							<div className={!(index % 2) ? 'container' : 'container darker'} key={index}>
								<p className={!(index % 2) ? 'right' : ''}>{!(index % 2) ? message.sender.username : ''}</p>
								<p>{message.message}</p>
								<span className="time-right">{moment(Number(message.createdAt)).format('DD dddd HH:mm:ss')}</span>
								<p className={(index % 2) ? '' : 'right'}>{(index % 2) ? message.sender.username : ''}</p>
							</div>
						);
					})
				}
			</div>
		)
	}
	function renderPlayers(divName: string) {
		if (!user) {
			return (
				<p>Loading ...</p>
			)
		}
			// <div className='block channels'>
			// 	<div className='title'>
			// 		<h1>Channels</h1>
			// 	</div>
			// 	<div className='content'></div>

		return (
			<div className={divName}>
				<h3>Players</h3>
				<ul>
					{
						currentChat == null ? <p>No players</p> :
						currentChat.users.map(player => {
							return (
								<li key={player.id}>
									<p className="room-name-clickable">{player.username}</p>
								</li>
							);
						})
					}
				</ul>
			</div>
		)
	}

	return (
		<div className="main-container">
			{/* {renderChannels()} */}

			<Channels
				user={user}
				currentChat={currentChat}
				setCurrentChat={setCurrentChat}
				/>
			{renderMessages('block messages')}
			{renderPlayers("block players")}
		</div>
	);
}
export default Chat;





