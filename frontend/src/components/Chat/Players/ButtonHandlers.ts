import axios from "axios";
import { User } from "../Channel/Channels";
import Chat from "../Chat";







/* Follow / Unfollow */
export function handleFollow(user: User) {
	axios.put("http://localhost:3000/social/" + user.id + "/follow", {}, {withCredentials: true})
	.catch((err) => {
		if (err.response.data.statusCode === 401)
			return ;
		else
			alert(err.response.data.message)
	});
}
export function handleUnfollow(user: User) {
	axios.delete("http://localhost:3000/social/" + user.id + "/unfollow", {withCredentials: true})
	.catch((err) => {
		if (err.response.data.statusCode === 401)
			return ;
		else
			alert(err.response.data.message)
	});
}


/* Block / Unblock */
export function handleBlock(user: User) {
	axios.put("http://localhost:3000/social/" + user.id + "/block", {}, {withCredentials: true})
	.then((payload) => {
	})
	.catch((err) => {
		if (err.response.data.statusCode === 401)
			return ;
		else
			alert(err.response.data.message)
	});
}
export function handleUnblock(user: User) {
	axios.delete("http://localhost:3000/social/" + user.id + "/unblock", {withCredentials: true})
	.catch((err) => {
		if (err.response.data.statusCode === 401)
			return ;
		else
			alert(err.response.data.message)
	});
}

export function handleMute(currentUser: User, user: User, currentChat: Chat) {
	if (currentUser.id === user.id)
		return ;
	if (!currentUser || !user || !currentChat)
		return ;

	const data = { muteUserID: user.id };

	axios.post("http://localhost:3000/chat/" + currentUser.id + "/mute/" + currentChat.id, data, {withCredentials: true})
	.catch((err) => {
		if (err.response.data.statusCode === 401)
			return ;
		else
			alert(err.response.data.message)
	});
}
export function handleUnmute(currentUser: User, user: User, currentChat: Chat) {
	if (currentUser.id === user.id)
		return ;
	if (!currentUser || !user || !currentChat)
		return ;

	const data = { unmuteUserID: user.id };

	axios.post("http://localhost:3000/chat/" + currentUser.id + "/unmute/" + currentChat.id, data, {withCredentials: true})
	.catch((err) => {
		if (err.response.data.statusCode === 401)
			return ;
		else
			alert(err.response.data.message)
	});
}

export function handleKick(currentUser: User, user: User, currentChat: Chat) {
	if (currentUser.id === user.id)
		return ;
	if (!currentUser || !user || !currentChat)
		return ;


	const data = { kickUserID: user.id };

	axios.post("http://localhost:3000/chat/" + currentUser.id + "/kick/" + currentChat.id, data, {withCredentials: true})
	.catch((err) => {
		if (err.response.data.statusCode === 401)
			return ;
		else
			alert(err.response.data.message)
	});
}

// @Param('userID', ParseIntPipe) userID: number, // Admin
// @Param('chatID', ParseIntPipe) chatID: number, // Chat
// @Body('bannedID') bannedID: number, // User to ban
// @Body('time') time: string, // Time to ban for
export function handleBan(currentUser: User, user: User, currentChat: Chat, time_in_seconds: number) {
	if (currentUser.id === user.id)
		return ;
	if (!currentUser || !user || !currentChat)
		return ;

	const data = {
		bannedID: user.id,
		time: time_in_seconds.toString()  /* Time in seconds */
	}
	axios.post("http://localhost:3000/chat/" + user.id + "/ban/" + currentChat.id, data, {withCredentials: true})
	.catch((err) => {
		if (err.response.data.statusCode === 401)
			return ;
		else
			alert(err.response.data.message)
	});
}

export function handlePromote(currentUser: User, user: User, currentChat: Chat) {
	if (currentUser.id === user.id)
		return ;
	if (!currentUser || !user || !currentChat)
		return ;


	const data = { promoteUserID: user.id };

	// ban/:chatID/:userID
	axios.post("http://localhost:3000/chat/" + currentUser.id + "/promote/" + currentChat.id, data, {withCredentials: true})
	.catch((err) => {
		if (err.response.data.statusCode === 401)
			return ;
		else
			alert(err.response.data.message)
	});
}

export function handleDemote(currentUser: User, user: User, currentChat: Chat) {
	if (currentUser.id === user.id)
		return ;
	if (!currentUser || !user || !currentChat)
		return ;


	const data = { demoteUserID: user.id };

	axios.post("http://localhost:3000/chat/" + currentUser.id + "/demote/" + currentChat.id, data, {withCredentials: true})
	.catch((err) => {
		if (err.response.data.statusCode === 401)
			return ;
		else
			alert(err.response.data.message)
	});
}
