import { Button, Collapse } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../../context/socket';
import Chat from '../Chat';
import PlayerBox from './PlayerBox';
import Collapsible from 'react-collapsible';
import Stack from '@mui/material/Stack';

type User = {
	id: number;
	username: string;
};

type ChannelPayload = {
	id: number;
	user: User;
}

const Players: React.FC<{
	currentUser: User | null;
	currentChat: Chat | null;
}> = ({ currentUser, currentChat }) => {

	const socket = useContext(SocketContext);

	const [users, setUsers] = useState<User[]>([]);

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
		if (currentChat) {
			setUsers(currentChat.users);
		}
	}, [currentChat]);

	// https://github.com/glennflanagan/react-collapsible#readme

	function renderButtons(user: User) {
		if (!currentChat)
			return;

		const isOwner = true;

		if (currentChat.type != 'PRIVATE') {
			return (
				<div className='buttons'>
					<Button variant='contained' className='action-button invite'>Invite To Game</Button>
					<Button variant='contained' className='action-button profile'>Profile</Button>
					<Button variant='contained' className='action-button add'>Add</Button>
					<Button variant='contained' className='action-button block'>Block</Button>
					{
						isOwner &&
						<Button variant='contained' className='action-button mute'>Mute</Button>
					}
					{
						isOwner &&
						<Button variant='contained' className='action-button kick'>Kick</Button>
					}
					{
						isOwner &&
						<Button variant='contained' className='action-button ban'>Ban</Button>
					}
					{
						isOwner &&
						<Button variant='contained' className='action-button set-admin' >Set Admin</Button>
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
										{user.username + ' (You)'}
									</div>	
								}
								{
									currentUser.id != user.id &&
									<Collapsible tabIndex={user.id} trigger={user.username}>
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