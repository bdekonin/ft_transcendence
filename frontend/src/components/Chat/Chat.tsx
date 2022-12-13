import { useEffect, useState , useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment, { Moment } from 'moment';
import './style.css'
import { SocketContext } from '../../context/socket';

import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ClearIcon from '@mui/icons-material/Clear';
import MessageIcon from '@mui/icons-material/Message';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

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

	/* Refresh */
	const [pong, setPong] = useState('');

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
			console.log('joinedChats', res.data.joined);
			setPublicChats(res.data.public);
			setProtectedChats(res.data.protected);
		})
		.catch(err => {
			console.log('err', err);
			if (err.response.data.statusCode === 401)
				navigate('/login');
			alert(err.response.data.message)
		});
	}, [user, pong]);

	useEffect(() => {
		if (currentChat && joinedChats)
			return ;

		if (joinedChats.length === 0)
			return ;
		
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






	function sendJoinEmitter(chatID: number) {
		socket.emit('chat/join', { chatID: chatID });
	}

	const leaveChannel = (chatID: number) => {
		socket.emit('chat/leave', { chatID: chatID });
		joinedChats.forEach((chatLoop, index) => {
			if (chatID === chatLoop.id) {
				joinedChats.splice(index, 1);
				setJoinedChats([...joinedChats]);
			}
		});
		if (currentChat?.id === chatID) {
			setCurrentChat(null);
		}
	}

	function joinPublic(chat: Chat) {
		const payload = {
			chatID: chat.id
		}
		axios.patch('http://localhost:3000/chat/' + user?.id + '/join', payload, { withCredentials: true })
		.then(res => {
			sendJoinEmitter( chat.id );
		})
		.catch(err => {
			navigate('/login');
		});
	}
	function joinProtected(chat: Chat) {
		const payload = {
			chatID: chat.id,
			password: prompt('Please enter the password')
		}
		axios.patch('http://localhost:3000/chat/' + user?.id + '/join', payload, { withCredentials: true })
		.then(res => {
			setPong(new Date().toISOString());
			alert('Success');
			sendJoinEmitter( chat.id );
		})
		.catch(err => {
			if (err.response.data.statusCode === 418)
				navigate('/login');
			alert(err.response.data.message)
		});
	}

	function renderPrivateChatBox() {

	}

	function renderChatBox(chat: any) {
		if (!currentChat)
			return;

		const selected = currentChat.id == chat.id;
		if (chat.type === 'PRIVATE') {
			return (
				<div className={selected ? 'chat selected' : 'chat' } key={chat.id}>
					<p className='title' >{ chat.name }</p>
					<IconButton className='options' aria-label="options-button" sx={{ color: 'white' }}>
						<MessageIcon />
					</IconButton>
					<p className='type' >{ 'private' }</p>
				</div>
			)
		}
		else {
			return (
				<div className={selected ? 'chat selected' : 'chat' } key={chat.id}>
					<p className='title' >{ chat.name }</p>
					<IconButton className='options' aria-label="options-button" sx={{ color: 'white' }} onClick={() => { leaveChannel(chat.id) }}>
						<ClearIcon />
					</IconButton>
					<p className='type' >{ chat.type == 'GROUP_PROTECTED' ? 'protected' : 'public' }</p>
				</div>
			)
		}
	}

	function renderChannelChats(divName: string) {
		if (!currentChat)
			return;
		return (
			<div>
				<h1>General</h1>
				<div className={divName}>
					<button className='add'>+</button>
					{
						joinedChats.map((chat: Chat) => {
							return ( renderChatBox(chat) )
						})
					}
				</div>
			</div>
		)
	}


	function renderChannels(divName: string) {
		return (
			<div className={divName}>
				{
					renderChannelChats('general')
				}
			</div>
		)
	}
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
	// function renderChatBox(divName: string) {
	// 	if (!currentChat) {
	// 		return ;
	// 	}
	// 	return (
	// 		<div className={divName}>
	// 			<input
	// 				type="text"
	// 				placeholder="Type message.."
	// 				onChange={event => setChatBoxMsg(event.currentTarget.value)}
	// 				name={chatBoxMsg}
	// 				maxLength={256}>
	// 			</input>
	// 			<button
	// 				type="submit"
	// 				onClick={(event) => postMessage(event)}>
	// 					Send
	// 			</button>
	// 		</div>
	// 	)
	// }

	function postMessage(event:any) {
		if (!currentChat)
			return ;
		const payload = {
			"senderID": user?.id,
			"chatID": currentChat.id,
			"message": chatBoxMsg
		}
		console.log('Emitting message', payload);
		socket.emit('chat/new-chat', payload);
	}

	function renderPlayers(divName: string) {
		if (!currentChat)
			return ;
		return (
			<div className={divName}>
				<h3>Players</h3>
				<ul>
					{
						currentChat.users.length == 0 ? <p>No players</p> :
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
			{renderChannels("block channels")}
			{renderMessages("block messages")}
			{/* {renderChatBox("chat-box")} */}
			{renderPlayers("block players")}
		</div>
	);
}
export default Chat;





