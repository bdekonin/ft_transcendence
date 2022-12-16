import axios from "axios";
import { User } from "../Channel/Channels";







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
		console.log('block!', payload);
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

export function handleMute() {

}

export function handleKick() {

}

export function handleBan() {

}

export function handleSetAdmin() {

}

