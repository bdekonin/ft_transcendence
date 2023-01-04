import axios from "axios";
import { createRef, useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../../../context/socket";
import { User } from "../Channel/Channels";
import Chat from "../Chat";
import LeftMessage from "./LeftMessage";
import RightMessage from "./RightMessage";
import rightMessage from "./RightMessage";


interface Message {
	id: number;
	message: string;
	sender: User;
	parent: Chat;
	createdAt: string;
}
type Friendship = {
	user: User;
	status: string;
	sender: User;
}

const Messages: React.FC<{
	currentUser: User | null;
	currentChat: Chat | null;
	mutes : number[];
	friendships : Friendship[];
	admins : number[];
}> = ({ currentUser, currentChat, mutes, friendships, admins }) => {

	const socket = useContext(SocketContext);
	const [messages, setMessages] = useState<Message[]>([]);

	useEffect(() => {
		if (!currentChat) {
			return;
		}
		if (!currentUser) {
			return;
		}

		axios.get('http://localhost:3000/chat/' + currentUser.id + '/messages/' + currentChat.id, { withCredentials: true })
		.then(res => {
			setMessages(res.data);
		})
		.catch(err => {
			console.log('err', err);
			alert(err.response.data.message)
		}); 
	}, [currentChat, currentUser]);

	useEffect(() => {
		if (socket) { /* Socket stuff */
			socket.on('chat/refresh-message', (payload: Message) => {
				if (!currentChat)
					return; 
				if (payload.parent.id === currentChat?.id){
					setMessages((messages) => [...messages, payload]);
				}
				else {
					/* Enable notification for that channel */
					alert('New message in ' + payload.parent.name);
				}
			})
		}
		return () => {
			socket.off('chat/refresh-message');
		}
	}, [socket, currentChat]);

	/**
	 * Function to check if a user has a certain friendship status
	 * 
	 * @param {string} isWhat - The desired friendship status to check for
	 * @param {User} user - The user to check the friendship status of
	 * 
	 * @return {boolean} - Returns true if the user has the desired friendship status, false otherwise
	*/
	function isAlready(isWhat: string, user: User): boolean {
		const friendship = friendships.find(friendship => friendship.user.id == user.id);
		if (friendship)
			return friendship.status == isWhat;
		return false;
	}

	function renderMessage(message: Message) {
		if (!currentUser)
			return null;

		const sender = message.sender.id == currentUser.id;
		
		if (mutes && mutes.includes(message.sender.id)) {
			return null;
		}
		const isBlocked = isAlready('blocked', message.sender);
		if (isBlocked) {
			return null;
		}

		var username = message.sender.username;

		if (admins.includes(message.sender.id)) {
			username = username + " [admin]";
		}

		if (sender) {
			return (
				<RightMessage
					key={message.id}
					myKey={message.id}
					sender={username}
					content={message.message}
					sendTime={message.createdAt}
				/>
			)
		}
		else {
			return (
				<LeftMessage
					key={message.id}
					myKey={message.id}
					sender={username}
					content={message.message}
					sendTime={message.createdAt}
				/>
			)
		}
	}

	const [chatBoxMsg, setChatBoxMsg] = useState<string>('');

	function postMessage(event:any) {
		const payload = {
			"senderID": currentUser?.id,
			"chatID": currentChat?.id,
			"message": chatBoxMsg
		}
		console.log('Emitting message', payload);
		socket.emit('chat/new-chat', payload);
	}

	function renderChatBox() {
		if (!currentChat) {
			return <p>Loading</p>
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
					onClick={(event) => {
						postMessage(event)
						setChatBoxMsg('');
					}}>
						Send
				</button>
			</div>
		)
	}

	if (!currentChat)
		return (
			<div className="block messages">
				<h1 className='title'>Choose a chat</h1>
			</div>
		)

	return (
		<div className="block messages">
			<h1 className='title'>{currentChat.name}</h1>
			{messages.map((message) => (
					renderMessage(message)
				)
			)}
			{
				currentUser && mutes.includes(currentUser?.id) ? null :
				renderChatBox()
			}
		</div>
	)
}
export default Messages;