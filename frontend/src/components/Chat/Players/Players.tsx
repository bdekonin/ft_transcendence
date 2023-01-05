import { Button, Collapse } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../../context/socket';
import Chat from '../Chat';
import Collapsible from 'react-collapsible';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { handleFollow, handleUnfollow, handleBlock, handleUnblock, handleMute, handleKick, handleBan, handlePromote, handleDemote, handleUnmute, handleInviteToGame } from './ButtonHandlers';
import BanDialog from './BanDialog';
import { showSnackbarNotification } from '../../../App';
import { useSnackbar } from 'notistack';


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
	mutes : number[];
	friendships : Friendship[];
	admins : number[];
}> = ({ currentUser, currentChat, mutes, friendships, admins }) => {

	const socket = useContext(SocketContext);
	const navigate = useNavigate();
	const { enqueueSnackbar } = useSnackbar();
	const [users, setUsers] = useState<User[]>([]);

	useEffect(() => {
		if (socket) {
			socket.on('chat/refresh-users-join', (payload: ChannelPayload) => {
				if (payload.id === currentChat?.id) {
					setUsers((users) => [...users, payload.user]);
				}
			});

			socket.on('chat/refresh-users-leave', (payload: ChannelPayload) => {
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
		if (!currentChat) {
			return;
		}
		if (!currentUser) {
			return;
		}
			
		setUsers(currentChat.users);
	}, [currentChat, currentUser]);


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
					onClick={() => { handleUnfollow(enqueueSnackbar, user) }}>
						Cancel
				</Button>
			);
		}
		else if (isPending) {
			return (
				<>
					<Button variant='contained' className='action-button add'
						onClick={() => { handleUnfollow(enqueueSnackbar, user) }}>
							Decline
					</Button>
					<Button variant='contained' className='action-button add'
						onClick={() => { handleFollow(enqueueSnackbar, user) }}>
							Accept
					</Button>
				</>
			);
		}

		if (isFriend) {
			return (
				<Button variant='contained' className='action-button add'
					onClick={() => { handleUnfollow(enqueueSnackbar, user) }}>
						Unfollow
				</Button>
			);
		}

		return (
			<Button variant='contained' className='action-button add'
				onClick={() => { handleFollow(enqueueSnackbar, user) }}>
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
						onClick={() => { handleBlock(enqueueSnackbar, user) }}>
							Block
					</Button>
					:
					<Button variant='contained' className='action-button block'
						onClick={() => { handleUnblock(enqueueSnackbar, user) }}>
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
					admin && !mutes?.includes(user.id) &&
					<Button variant='contained' className='action-button mute'
						onClick={() => { handleMute(enqueueSnackbar, currentUser as User, user, currentChat)}}>
						Mute
					</Button>
				}
				{
					admin && mutes && mutes.includes(user.id) &&
					<Button variant='contained' className='action-button mute'
						onClick={() => { handleUnmute(enqueueSnackbar, currentUser as User, user, currentChat)}}>
						Unmute
					</Button>
				}
				{
					admin &&
					<Button variant='contained' className='action-button kick'
						onClick={() => { handleKick(enqueueSnackbar, currentUser as User, user, currentChat) }}>
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
							// onClick={() => { handleBan(enqueueSnackbar, currentUser as User, user, currentChat) }}>
							onClick={() => { handleBanDialogOpen(user) }}>
							Ban
						</Button>
					}
					{
						admin && !isAdmin(user) &&
						<Button variant='contained' className='action-button set-admin'
							onClick={() => { handlePromote(enqueueSnackbar, currentUser as User, user, currentChat) }}>
							Set Admin
						</Button>
					}
					{
						admin && isAdmin(user) &&
						<Button variant='contained' className='action-button set-admin'
							onClick={() => { handleDemote(enqueueSnackbar, currentUser as User, user, currentChat) }}>
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
		else {
			return (
				<div className='buttons'>
					<Button variant='contained' className='action-button invite'
						onClick={() => { handleInviteToGame(enqueueSnackbar, currentUser as User, currentChat) }}>
							Invite to game
					</Button>
					<Button variant='contained' className='action-button profile'
						onClick={() => { navigate('/profile?user=' + user.username) }}>
							Profile
					</Button>
				</div>
			)
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
							<div key={user.id}>
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