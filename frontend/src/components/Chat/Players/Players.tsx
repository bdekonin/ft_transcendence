import { Button, Collapse } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../../context/socket';
import Chat from '../Chat';
import Collapsible from 'react-collapsible';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { handleFollow, handleUnfollow, handleBlock, handleUnblock, handleMute, handleKick, handleBan, handlePromote, handleDemote, handleUnmute } from './ButtonHandlers';
import BanDialog from './BanDialog';

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
	sender: User;
}

const Players: React.FC<{
	currentUser: User | null;
	currentChat: Chat | null;
}> = ({ currentUser, currentChat }) => {

	const socket = useContext(SocketContext);
	const navigate = useNavigate();

	const [users, setUsers] = useState<User[]>([]);

	const [friendships, setFriendships] = useState<Friendship[]>([]);

	const [admins, setAdmins] = useState<number[]>([]);


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

			socket.on('chat/refresh-friendships', () => {
				axios.get('http://localhost:3000/social', { withCredentials: true })
				.then(res => {
					// parse data
					const parsedData: Friendship[] = res.data.map((friendship: any) => {
						const otherUser = friendship.sender.id == currentUser?.id ? friendship.reciever : friendship.sender;
						return {
							status: friendship.status,
							user: otherUser,
							sender: friendship.sender,
						}
					});
					setFriendships(parsedData);
				})
				console.log('chat/refresh-friendships');
			});

			socket.on('chat/refresh-admins', () => {
				axios.get('http://localhost:3000/chat/' + currentUser?.id + '/admins/' + currentChat?.id, { withCredentials: true })
				.then(res => {
					setAdmins(res.data);
				})
			});
		}

		return () => {
			socket.off('chat/refresh-users-join');
			socket.off('chat/refresh-users-leave');
			socket.off('chat/refresh-friendships');
			socket.off('chat/refresh-admins');
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
					sender: friendship.sender,
				}
			});
			setFriendships(parsedData);
		})

		axios.get('http://localhost:3000/chat/' + currentUser?.id + '/admins/' + currentChat?.id, { withCredentials: true })
		.then(res => {
			setAdmins(res.data);
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
	function isAlready(isWhat: string, user: User): boolean {
		const friendship = friendships.find(friendship => friendship.user.id == user.id);
		if (friendship)
			return friendship.status == isWhat;
		return false;
	}
	function isAdmin(user: User): boolean {
		if (currentChat?.type == 'PRIVATE')
			return false;
		return admins.includes(user.id) as boolean;
	}
	function isSender(user: User): boolean {
		const friendship = friendships.find(friendship => friendship.user.id == user.id);
		if (friendship)
			return friendship.sender.id == currentUser?.id;
		return false;
	}

	function render_add(user: User) {
		const isFriend = isAlready('accepted', user);
		const isPending = isAlready('pending', user);
		const isUserSender = isSender(user);

		if (isUserSender && isPending) {
			return (
				<Button variant='contained' className='action-button add'
					onClick={() => { handleUnfollow(user) }}>
						Cancel
				</Button>
			);
		}
		else if (isPending) {
			return (
				<>
					<Button variant='contained' className='action-button add'
						onClick={() => { handleUnfollow(user) }}>
							Decline
					</Button>
					<Button variant='contained' className='action-button add'
						onClick={() => { handleFollow(user) }}>
							Accept
					</Button>
				</>
			);
		}

		console.log('isFriend', isFriend, 'isPending', isPending, 'isBlocked', isAlready('blocked', user), 'isRequested', isAlready('requested', user), 'isSelf', user.id == currentUser?.id);

		if (isFriend) {
			return (
				<Button variant='contained' className='action-button add'
					onClick={() => { handleUnfollow(user) }}>
						Unfollow
				</Button>
			);
		}

		return (
			<Button variant='contained' className='action-button add'
				onClick={() => { handleFollow(user) }}>
					Follow
			</Button>
		)
	}

	function render_add_block(user: User) {
		const isBlocked = isAlready('blocked', user);
		return (
			<div className='add-block'>
				{
					render_add(user)
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
		)
	}

	function render_mute_kick(user: User) {
		const admin = isAdmin(currentUser as User);

		if (!currentChat)
			return ;

		return (
			<div className='mute-kick'>
				{
					admin && !currentChat.muted.includes(user.id) &&
					<Button variant='contained' className='action-button mute'
						onClick={() => { handleMute(currentUser as User, user, currentChat)}}>
						Mute
					</Button>
				}
				{
					admin && currentChat.muted.includes(user.id) &&
					<Button variant='contained' className='action-button mute'
						onClick={() => { handleUnmute(currentUser as User, user, currentChat)}}>
						Unmute
					</Button>
				}
				{
					admin &&
					<Button variant='contained' className='action-button kick'
						onClick={() => { handleKick(currentUser as User, user, currentChat) }}>
							Kick
					</Button>
				}
			</div>
		)
	}

	function render_ban_promote(user: User) {
		const admin = isAdmin(currentUser as User);

		if (!currentChat)
			return ;

		return (
			<div className='buttons'>
					{
						admin &&
						<Button variant='contained' className='action-button ban' 
							// onClick={() => { handleBan(currentUser as User, user, currentChat) }}>
							onClick={() => { handleBanDialogOpen(user) }}>
							Ban
						</Button>
					}
					{
						admin && !isAdmin(user) &&
						<Button variant='contained' className='action-button set-admin'
							onClick={() => { handlePromote(currentUser as User, user, currentChat) }}>
							Set Admin
						</Button>
					}
					{
						admin && isAdmin(user) &&
						<Button variant='contained' className='action-button set-admin'
							onClick={() => { handleDemote(currentUser as User, user, currentChat) }}>
							Unset Admin
						</Button>
					}
			</div>
		)
	}






	// https://github.com/glennflanagan/react-collapsible#readme

	function renderButtons(user: User) {
		if (!currentChat)
			return;

		if (currentChat.type != 'PRIVATE') {
			return (
				<div className='buttons'>
					{/* <Button variant='contained' className='action-button invite'>Invite To Game</Button> */}
					<Button variant='contained' className='action-button profile'
						onClick={() => { navigate('/profile?user=' + user.username) }}>
							Profile
					</Button>
					{render_add_block(user)}
					{render_mute_kick(user)}
					{render_ban_promote(user)}
				</div>
			);
		}
	}


	const [banDialogOpen, setBanDialogOpen] = useState(false);
	const [banUserDialog, setBanUserDialog] = useState<User | null>(null);

	const handleBanDialogClose = () => {
		setBanDialogOpen(false);
	};
	const handleBanDialogOpen = (user: User) => {
		setBanDialogOpen(true);
		setBanUserDialog(user);
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
										{
											isAdmin(user) ? '[YOU ADMIN] ' + user.username : '[YOU] ' + user.username
										}
									</div>	
								}
								{
									currentUser.id != user.id &&
									<Collapsible trigger={isAdmin(user) ? '[ADMIN] ' + user.username : '[USER] ' + user.username}>
										{renderButtons(user)}
									</Collapsible>
								}
							</div>
						);
					})
			}
			</div>
			<BanDialog
				currentUser={currentUser as User}
				currentChat={currentChat as Chat}
				bannedUser={banUserDialog as User}
				open={banDialogOpen}
				setOpen={handleBanDialogClose}
			/>
		</div>
	);
}
export default Players;