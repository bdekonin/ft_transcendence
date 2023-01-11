import axios from "axios";
import { User } from "../Channel/Channels";
import Chat from "../Chat";
import { showSnackbarNotification } from '../../../App';

/* Follow / Unfollow */
export function handleFollow(enqueueSnackbar: any, user: User) {
	axios.put("http://" + process.env.HOST + ":3000/social/" + user.id + "/follow", {}, {withCredentials: true})
	.catch((err) => {
		if (err.response.data.statusCode === 401)
			return ;
		else
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
	});
}
export function handleUnfollow(enqueueSnackbar: any, user: User) {
	axios.delete("http://" + process.env.HOST + ":3000/social/" + user.id + "/unfollow", {withCredentials: true})
	.catch((err) => {
		if (err.response.data.statusCode === 401)
			return ;
		else
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
	});
}


/* Block / Unblock */
export function handleBlock(enqueueSnackbar: any, user: User) {
	axios.put("http://" + process.env.HOST + ":3000/social/" + user.id + "/block", {}, {withCredentials: true})
	.then((payload) => {
	})
	.catch((err) => {
		if (err.response.data.statusCode === 401)
			return ;
		else
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
	});
}
export function handleUnblock(enqueueSnackbar: any, user: User) {
	axios.delete("http://" + process.env.HOST + ":3000/social/" + user.id + "/unblock", {withCredentials: true})
	.catch((err) => {
		if (err.response.data.statusCode === 401)
			return ;
		else
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
	});
}

export function handleMute(enqueueSnackbar: any, currentUser: User, user: User, currentChat: Chat) {
	if (currentUser.id === user.id)
		return ;
	if (!currentUser || !user || !currentChat)
		return ;

	const data = { muteUserID: user.id };

	axios.post("http://" + process.env.HOST + ":3000/chat/" + currentUser.id + "/mute/" + currentChat.id, data, {withCredentials: true})
	.catch((err) => {
		if (err.response.data.statusCode === 401)
			return ;
		else
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
	});
}
export function handleUnmute(enqueueSnackbar: any, currentUser: User, user: User, currentChat: Chat) {
	if (currentUser.id === user.id)
		return ;
	if (!currentUser || !user || !currentChat)
		return ;

	const data = { unmuteUserID: user.id };

	axios.post("http://" + process.env.HOST + ":3000/chat/" + currentUser.id + "/unmute/" + currentChat.id, data, {withCredentials: true})
	.catch((err) => {
		if (err.response.data.statusCode === 401)
			return ;
		else
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
	});
}

export function handleKick(enqueueSnackbar: any, currentUser: User, user: User, currentChat: Chat) {
	if (currentUser.id === user.id)
		return ;
	if (!currentUser || !user || !currentChat)
		return ;


	const data = { kickUserID: user.id };

	axios.post("http://" + process.env.HOST + ":3000/chat/" + currentUser.id + "/kick/" + currentChat.id, data, {withCredentials: true})
	.catch((err) => {
		if (err.response.data.statusCode === 401)
			return ;
		else
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
	});
}

// @Param('userID', ParseIntPipe) userID: number, // Admin
// @Param('chatID', ParseIntPipe) chatID: number, // Chat
// @Body('bannedID') bannedID: number, // User to ban
// @Body('time') time: string, // Time to ban for
export function handleBan(enqueueSnackbar: any, currentUser: User, user: User, currentChat: Chat, time_in_seconds: number) {
	if (currentUser.id === user.id)
		return ;
	if (!currentUser || !user || !currentChat)
		return ;

	const data = {
		bannedID: user.id,
		time: time_in_seconds.toString()  /* Time in seconds */
	}
	axios.post("http://" + process.env.HOST + ":3000/chat/" + user.id + "/ban/" + currentChat.id, data, {withCredentials: true})
	.catch((err) => {
		if (err.response.data.statusCode === 401)
			return ;
		else
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
	});
}

export function handlePromote(enqueueSnackbar: any, currentUser: User, user: User, currentChat: Chat) {
	if (currentUser.id === user.id)
		return ;
	if (!currentUser || !user || !currentChat)
		return ;


	const data = { promoteUserID: user.id };

	// ban/:chatID/:userID
	axios.post("http://" + process.env.HOST + ":3000/chat/" + currentUser.id + "/promote/" + currentChat.id, data, {withCredentials: true})
	.catch((err) => {
		if (err.response.data.statusCode === 401)
			return ;
		else
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
	});
}

export function handleDemote(enqueueSnackbar: any, currentUser: User, user: User, currentChat: Chat) {
	if (currentUser.id === user.id)
		return ;
	if (!currentUser || !user || !currentChat)
		return ;


	const data = { demoteUserID: user.id };

	axios.post("http://" + process.env.HOST + ":3000/chat/" + currentUser.id + "/demote/" + currentChat.id, data, {withCredentials: true})
	.catch((err) => {
		if (err.response.data.statusCode === 401)
			return ;
		else
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
	});
}

export function handleInviteToGame(enqueueSnackbar: any, currentUser: User, currentChat: Chat) {
	if (!currentUser  || !currentChat)
		return ;

	axios.post("http://" + process.env.HOST + ":3000/chat/" + currentUser.id + "/game-invite/" + currentChat.id, { }, {withCredentials: true})
	.catch((err) => {
		if (err.response.data.statusCode === 401)
			return ;
		else
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
	});
}
