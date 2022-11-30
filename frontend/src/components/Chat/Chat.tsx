import { useEffect, useState , useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment, { Moment } from 'moment';
import './style.css'
import { SocketContext } from '../../context/socket';
import { Socket } from 'socket.io-client';

interface User {
	id: number;
	username: string;
}

interface Chat {
	id: number;
	name: string;
	users: User[];
	unread: boolean;
}
interface Message {
	id: number;
	message: string;
	sender: User;
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
	const [currentChat, setCurrentChat] = useState<Chat>({id: 0, name: '', users: [], unread: false});
	const [messages, setMessages] = useState<Message[]>([]);
	const [chatBoxMsg, setChatBoxMsg] = useState<string>('');
	
	/* Chats */
	const [joinedChats, setJoinedChats] = useState<Chat[]>([]);
	const [publicChats, setPublicChats] = useState<Chat[]>([]);
	const [protectedChats, setProtectedChats] = useState<Chat[]>([]);

	/* Refresh */
	const [pong, setPong] = useState('');

	const [refreshMessages, setRefreshMessages] = useState('');
	socket.on('chat/new-message', (payload: any) => {
		console.log('chat/new-message', payload);
		console.log('currentChat', currentChat);
		if (payload.chatID === currentChat.id) {
			// setMessages((messages) => [...messages, payload]);
			setRefreshMessages(new Date().toISOString());
		}
	})
	document.body.style.background = '#323232';
	useEffect(() => {
		axios.get('http://localhost:3000/user', { withCredentials: true })
		.then(res => {
			setUser(res.data);
		})
		.catch(err => {
			console.log('err', err);
			if (err.response.data.statusCode === 400)
				navigate('/login');
			alert(err.response.data.message)
		});

		return () => {
			console.log('unmounting');
			socket.off('chat/new-message');
		}

	}, []);

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
			if (err.response.data.statusCode === 400)
				navigate('/login');
			alert(err.response.data.message)
		});
	}, [user, pong]);

	/* Setting the current chat after retrieving chats */
	useEffect(() => {
		if (joinedChats.length == 0) {
			if (pong == '')
				setCurrentChat({id: 0, name: '', users: [], unread: false});
			}
		else {
			if (pong == '')
				setCurrentChat(joinedChats[0]);
		}
	}, [joinedChats, pong]);

	useEffect(() => {
		if (currentChat.id == 0)
			return;
		socket.emit('chat/join-multiple', {
			chatIDs: joinedChats.map(chat => chat.id)
		});
	}, [joinedChats]);

	/* Retrieving messages and avatars of the currentChat */
	useEffect(() => {
		if (currentChat.id == 0)
			return;
		axios.get('http://localhost:3000/chat/' + user?.id + '/messages/' + currentChat.id, { withCredentials: true })
		.then(res => {
			setMessages(res.data);
		})
		.catch(err => {
			console.log('err', err);
			if (err.response.data.statusCode === 400)
				navigate('/login');
			alert(err.response.data.message)
		});
	}, [currentChat, pong, refreshMessages]);




	function joinPublic(chat: Chat) {
		const payload = {
			chatID: chat.id
		}
		axios.patch('http://localhost:3000/chat/' + user?.id + '/join', payload, { withCredentials: true })
		.then(res => {
			setPong(new Date().toISOString());
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
		})
		.catch(err => {
			if (err.response.data.statusCode === 418)
				navigate('/login');
			alert(err.response.data.message)
		});
	}

	function renderUsers() {
		return (
			<div className='user-icons'>
				<img src={require("../../avatars/icons8-avatar-64-1.png")} alt="" />
				<img src={require("../../avatars/icons8-avatar-64-1.png")} alt="" />
				<img src={require("../../avatars/icons8-avatar-64-1.png")} alt="" />
				<img src={require("../../avatars/icons8-avatar-64-1.png")} alt="" />
				<img src={require("../../avatars/icons8-avatar-64-1.png")} alt="" />

			</div>
		)
	}
	function renderActionButtons() {
		return (
			<div className='action-buttons'>
				<button onClick={() => {
					axios.delete('http://localhost:3000/chat/' + user?.id + '/leave/' + currentChat.id, { withCredentials: true })
					.then(res => {
						socket.emit('chat/leave', {chatID: currentChat.id, userID: user?.id});
						setJoinedChats(joinedChats.filter(chat => chat.id != currentChat.id));
					})
					.catch(err => {
						console.log('err', err);
						if (err.response.data.statusCode === 400)
							navigate('/login');
						alert(err.response.data.message)
					});
				}}>Leave Current Chat</button>
			</div>
		)
	}
	function renderRooms() {
		return (
			<div className="rooms">
				<h3>Users in this chat</h3>
				{renderUsers()}
				<h3>Joined Rooms</h3>
				<ul>
					{
						joinedChats.length == 0 ? <p>No joined rooms</p> :
						joinedChats.map(chat => {
							return (
								<li key={chat.id}>
									<p className={chat.unread ? 'room-name-clickable unread' : 'room-name-clickable'} onClick={() => setCurrentChat(chat)}>{chat.name}</p>
								</li>
							);
						})
					}
				</ul>
				<h3>Public Rooms</h3>
				<ul>
					{
						publicChats.length == 0 ? <p>No public rooms</p> :
						publicChats.map(chat => {
							return (
								<li key={chat.id}>
									<p className="room-name-clickable" onClick={() => joinPublic(chat)}>{chat.name}</p>
								</li>
							);
						})
					}
				</ul>
				<h3>Private Rooms</h3>
				<ul>
					{
						protectedChats.length == 0 ? <p>No private rooms</p> :
						protectedChats.map(chat => {
							return (
								<li key={chat.id}>
									<p className="room-name-clickable" onClick={() => joinProtected(chat)}>{chat.name}</p>
								</li>
							);
						})
					}
				</ul>
				<h3>Action Buttons</h3>
				{renderActionButtons()}
			</div>
		)
	}
	function renderMessages() {
		return (
			<div className="messages">
				<h2 className='chatName'>{currentChat.name}</h2>
				{
					messages.map((message, index)=> {
						return (
							<div className={!(index % 2) ? 'container' : 'container darker'} key={message.id}>
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
	function renderChatBox() {
		if (currentChat.id == 0) {
			return ;
		}
		return (
			<div className="chat-box">
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
		console.log('client', event);
		const payload = {
			"senderID": user?.id,
			"chatID": currentChat.id,
			"message": chatBoxMsg
		}
		console.log('Emitting message', payload);
		socket.emit('chat/new-chat', payload);
		setRefreshMessages(new Date().toISOString());
	}
	
	return (
		<div className="main-container">
			{renderRooms()}
			{renderMessages()}
			{renderChatBox()}
		</div>
	);
}
export default Chat;





