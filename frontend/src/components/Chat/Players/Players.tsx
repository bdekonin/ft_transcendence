import { Button, Collapse } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../../context/socket';
import Chat from '../Chat';
import Collapsible from 'react-collapsible';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { handleFollow, handleUnfollow, handleBlock, handleUnblock, handleMute, handleKick, handleBan, handleSetAdmin } from './ButtonHandlers';

type User = {
	id: number;
	username: string;
};

type ChannelPayload = {
	id: number;
	user: User;
}

type Friendship = {
	user: User;
	status: string;
}

const Players: React.FC<{
	currentUser: User | null;
	currentChat: Chat | null;
}> = ({ currentUser, currentChat }) => {

	const socket = useContext(SocketContext);
	const navigate = useNavigate();

	const [users, setUsers] = useState<User[]>([]);

	const [friendships, setFriendships] = useState<Friendship[]>([]);

	useEffect(() => {
		if (socket) {
			socket.on('chat/refresh-users-join', (payload: ChannelPayload) => {
				console.log('chat/refresh-users-join', payload);
				if (payload.id === currentChat?.id) {
					setUsers((users) => [...users, payload.user]);
				}
			});

			socket.on('chat/refresh-users-leave', (payload: ChannelPayload) => {
				console.log('chat/refresh-users-leave', payload);
				if (payload.id === currentChat?.id) {
					setUsers((users) => users.filter((user) => user.id !== payload.user.id));
				}
			});
		}

		return () => {
			socket.off('chat/refresh-users-join');
			socket.off('chat/refresh-users-leave');
		}
	});

	useEffect(() => {
		if (!currentChat)
			return ;
			
		setUsers(currentChat.users);

		axios.get('http://localhost:3000/social', { withCredentials: true })
		.then(res => {
			// parse data
			const parsedData: Friendship[] = res.data.map((friendship: any) => {
				const otherUser = friendship.sender.id == currentUser?.id ? friendship.reciever : friendship.sender;
				return {
					status: friendship.status,
					user: otherUser,
				}
			});
			setFriendships(parsedData);
		})

	}, [currentChat]);


	/**
	 * Function to check if a user has a certain friendship status
	 * 
	 * @param {string} isWhat - The desired friendship status to check for
	 * @param {User} user - The user to check the friendship status of
	 * 
	 * @return {boolean} - Returns true if the user has the desired friendship status, false otherwise
	*/
	function isAlready(isWhat: string, user: User) {
		const friendship = friendships.find(friendship => friendship.user.id == user.id);
		if (friendship)
			return friendship.status == isWhat;
		return false;
	}









	// https://github.com/glennflanagan/react-collapsible#readme

	function renderButtons(user: User) {
		if (!currentChat)
			return;

		const isOwner = true;

		console.log('friendships', friendships);

		const isFriend = isAlready('accepted', user);
		const isBlocked = isAlready('blocked', user);

		if (currentChat.type != 'PRIVATE') {
			return (
				<div className='buttons'>
					{/* <Button variant='contained' className='action-button invite'>Invite To Game</Button> */}
					<Button variant='contained' className='action-button profile'
						onClick={() => { navigate('/profile?user=' + user.username) }}>
							Profile
					</Button>

					<div className='add-block'>
						{
							!isFriend ?
							<Button variant='contained' className='action-button add'
								onClick={() => { handleFollow(user) }}>
									Follow
							</Button>
							:
							<Button variant='contained' className='action-button add'
								onClick={() => { handleUnfollow(user) }}>
									Unfollow
							</Button>
						}
						{
							!isBlocked ?
							<Button variant='contained' className='action-button block'
								onClick={() => { handleBlock(user) }}>
									Block
							</Button>
							:
							<Button variant='contained' className='action-button block'
								onClick={() => { handleUnblock(user) }}>
									Unblock
							</Button>
						}
					</div>
					<div className='mute-kick'>
						{
							isOwner &&
							<Button variant='contained' className='action-button mute'>
								Mute
							</Button>
						}
						{
							isOwner &&
							<Button variant='contained' className='action-button kick'>
								Kick
							</Button>
						}
					</div>
					{
						isOwner &&
						<Button variant='contained' className='action-button ban'>
							Ban
						</Button>
					}
					{
						isOwner &&
						<Button variant='contained' className='action-button set-admin' >
							Set Admin
						</Button>
					}
				</div>
			);
		}

	}

	return (
		<div className='block players'>
			<div className='title'>
				<h1>Players</h1>
			</div>

			<div className='content'>
			{
				currentChat == null || currentUser == null ? <p>No players</p> :
					users.map((user) => {
						return (
							<div>
								{
									currentUser.id == user.id &&
									<div className='Collapsible'>
										{'[YOU] ' + user.username}
									</div>	
								}
								{
									currentUser.id != user.id &&
									<Collapsible trigger={'[ADMIN] ' + user.username}>
										{renderButtons(user)}
									</Collapsible>
								}
							</div>
						);
					})
			}
			</div>
		</div>
	);
}
export default Players;