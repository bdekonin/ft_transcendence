import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useSnackbar } from 'notistack';
import { User } from "../Channel/Channels";
import Chat from "../Chat";
import { handleBan } from "./ButtonHandlers";


const BanDialog: React.FC<{
	currentUser: User;
	currentChat: Chat;
	bannedUser: User;
	open: boolean;
	setOpen: (open: boolean) => void;
}> = ({ currentUser, currentChat, bannedUser, open, setOpen }) => {

	const { enqueueSnackbar } = useSnackbar();

	const setClose = () => {
		setOpen(false);
	};

	function ban(time_in_seconds: number) {
		handleBan(enqueueSnackbar, currentUser, bannedUser, currentChat, time_in_seconds)
		setClose();
	}

	return (
		<Dialog open={open} onClose={setClose}>
		<DialogTitle>Create Group</DialogTitle>
		<DialogContent>
			<DialogContentText>
				How long to ban the user?
			</DialogContentText>
			<Button size="small" variant="contained"
				onClick={() => { ban(10) }}>
				10 Seconds
			</Button>
			<Button size="small" variant="contained"
				onClick={() => { ban(60) }}>
				1 Minute
			</Button>
			<Button size="small" variant="contained"
				onClick={() => { ban(60 * 10) }}>
				10 Minutes
			</Button>
			<Button size="small" variant="contained"
				onClick={() => { ban(60 * 60) }}>
				1 Hour
			</Button>
		</DialogContent>
		<DialogActions>
			<Button onClick={setClose} color='error'>Cancel</Button>
		</DialogActions>
	</Dialog>
	);
}
export default BanDialog;