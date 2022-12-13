import { useEffect, useState , useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment, { Moment } from 'moment';
import './style.css'
import { SocketContext } from '../../context/socket';

import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ClearIcon from '@mui/icons-material/Clear';
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
	const [user, setUser] = useState<User>();
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
		if (!socket || !currentChat)
			return;
		socket.on('chat/refresh-message', (incomingPayload: Message) => {
			if (incomingPayload.parent.id === currentChat.id){
				setMessages((messages) => [incomingPayload, ...messages]);
			}
			else {
				/* Enable notification for that channel */
			}
		})
		socket.on('chat/refresh-chats', () => {
			console.log('refreshing chats');
			// window.location.reload();
			setPong(new Date().toISOString());
			/* Refresh chats */
		})
		return () => {
			socket.off('chat/refresh-message');
			socket.off('chat/refresh-chats');
		}
	});

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
	}, []);

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

	/* Setting the current chat after retrieving chats */
	useEffect(() => {
		if (joinedChats.length == 0) {
			if (pong == '')
				setCurrentChat({id: 0, name: '', users: [], unread: false, type: ''});
			}
		else {
			if (pong == '')
				setCurrentChat(joinedChats[0]);
		}
	}, [joinedChats, pong]);

	/* Retrieving messages and avatars of the currentChat */
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
	}, [currentChat, pong]);

	/* Retrieving avatars of the currentChat */
	// useEffect(() => {
	// 	if (currentChat.id == 0)
	// 		return;

	// 	currentChat.users.forEach((user) => {
	// 		axios.get('http://localhost:3000/user/' + user.id + '/avatar', { withCredentials: true })
	// 		.then(res => {
	// 			// user['avatar'] = res.data.avatar;
	// 			console.log('res');
	// 		})
	// 		.catch(err => {
	// 			console.log('err', err);
	// 			if (err.response.data.statusCode === 401)
	// 				navigate('/login');	
	// 			alert(err.response.data.message)
	// 		});
	// 	});
	// }, [currentChat, pong]);

	function sendJoinEmitter(chatID: number) {
		socket.emit('chat/join', { chatID: chatID });
	}

	function sendLeaveEmitter(chatID: number) {
		socket.emit('chat/leave', { chatID: chatID });
		joinedChats.forEach((chat, index) => {
			if (chat.id === chatID) {
				joinedChats.splice(index, 1);
				setJoinedChats([...joinedChats]);
			}
		});
	}

	function joinPublic(chat: Chat) {
		const payload = {
			chatID: chat.id
		}
		axios.patch('http://localhost:3000/chat/' + user?.id + '/join', payload, { withCredentials: true })
		.then(res => {
			// setPong(new Date().toISOString());			setCurrentChat(chat);
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

	const [channelBoxMode, setChannelBoxMode] = useState('general'); /* Change to enum */

	const leaveChannel = (chatID: number) => {
		socket.emit('chat/leave', { chatID: chatID });
		joinedChats.forEach((chatLoop, index) => {
			if (chatID === chatLoop.id) {
				joinedChats.splice(index, 1);
				setJoinedChats([...joinedChats]);
			}
		});
	}

	function renderChannelGeneral(divName: string) {
		if (!currentChat)
			return;
		return (
			<div>
				<h1>General</h1>
				<div className={divName}>
					<button className='add'>+</button>
					{
						joinedChats.map((chat: Chat) => {
							if (chat.type == 'GROUP_PROTECTED' || chat.type == 'GROUP')
								return (
									<div className={currentChat.id == chat.id ? 'chat selected' : 'chat' } key={chat.id}>
										<p className='title' >{ chat.name }</p>
										<IconButton className='options' aria-label="options-button" sx={{ color: 'white' }} onClick={() => { leaveChannel(chat.id) }}>
											<ClearIcon />
										</IconButton>
										<p className='type' >{ chat.type == 'GROUP_PROTECTED' ? 'private' : 'public' } </p>
									</div>
								)
						})
					}
				</div>
			</div>
		)
	}
	function renderChannelDM(divName: string) {
		return (
			<div>
				<h1>DM</h1>
				<div className={divName}>

				</div>
			</div>
		)
	}



	function buttonDM() {
		setChannelBoxMode('dm');
	}
	function buttonGeneral() {
		setChannelBoxMode('general');
	}


	function renderChannels(divName: string) {
			return (
				<div className={divName}>
					{
						channelBoxMode == 'general' ? renderChannelGeneral('general') : renderChannelDM('dm')
					}
					<div className='channel-buttons'>
						<button onClick={buttonGeneral}>General</button>
						<button onClick={buttonDM}>DM</button>
					</div>
				</div>
			)

		// return (
		// 	<div className={divName}>
		// 		<h3>Joined Rooms</h3>
		// 		<ul>
		// 			{
		// 				joinedChats.length == 0 ? <p>No joined rooms</p> :
		// 				joinedChats.map(chat => {
		// 					return (
		// 						<li key={chat.id}>
		// 							<p className={chat.unread ? 'room-name-clickable unread' : 'room-name-clickable'} onClick={() => setCurrentChat(chat)}>{chat.name}</p>
		// 						</li>
		// 					);
		// 				})
		// 			}
		// 		</ul>
		// 		<h3>Public Rooms</h3>
		// 		<ul>
		// 			{
		// 				publicChats.length == 0 ? <p>No public rooms</p> :
		// 				publicChats.map(chat => {
		// 					return (
		// 						<li key={chat.id}>
		// 							<p className="room-name-clickable" onClick={() => joinPublic(chat)}>{chat.name}</p>
		// 						</li>
		// 					);
		// 				})
		// 			}
		// 		</ul>
		// 		<h3>Private Rooms</h3>
		// 		<ul>
		// 			{
		// 				protectedChats.length == 0 ? <p>No private rooms</p> :
		// 				protectedChats.map(chat => {
		// 					return (
		// 						<li key={chat.id}>
		// 							<p className="room-name-clickable" onClick={() => joinProtected(chat)}>{chat.name}</p>
		// 						</li>
		// 					);
		// 				})
		// 			}
		// 		</ul>
		// 		<h3>Action Buttons</h3>
		// 		{renderActionButtons()}
		// 	</div>
		// )
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
	function renderChatBox(divName: string) {
		if (!currentChat) {
			return ;
		}
		return (
			<div className={divName}>
				<input
					type="text"
					placeholder="Type message.."
					onChange={event => setChatBoxMsg(event.currentTarget.value)}
					name={chatBoxMsg}
					maxLength={256}>
				</input>
				<button
					type="submit"
					onClick={(event) => postMessage(event)}>
						Send
				</button>
			</div>
		)
	}

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





