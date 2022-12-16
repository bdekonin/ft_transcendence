import React, { useState } from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import IconButton from "@mui/material/IconButton";

interface IProps {
	open?: boolean;
	username: string;
}

const PlayerBox: React.FC<IProps> = ({ open, username }) => {
	const [isOpen, setIsOpen] = useState(open);

	const handleFilterOpening = () => {
		setIsOpen((prev) => !prev);
	};

	return (
		<div>
			<div className="player-box">
				<p>{username}</p>
				{/* <button type="button" className="options" onClick={handleFilterOpening}> */}
					{
						isOpen && 
						<IconButton className='options' aria-label="options-button" sx={{ color: 'white' }} onClick={handleFilterOpening}>
							<KeyboardArrowUpIcon />
						</IconButton>
					}
					{
						!isOpen &&
						<IconButton className='options' aria-label="options-button" sx={{ color: 'white' }} onClick={handleFilterOpening}>
							<KeyboardArrowDownIcon />
						</IconButton>
					}
				{/* </button> */}

				<div>
					{
						isOpen &&
						<div className="menu">
							{'childrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildrenchildren'}
						</div>
					}
				</div>
			</div>
		</div>
	);

	// return (
	// 	<div>
	// 		<div className="card">
	// 			<div>
	// 				<div className="p-3 border-bottom d-flex justify-content-between">
	// 					<h6 className="font-weight-bold">{title}</h6>
	// 					<button type="button" className="btn" onClick={handleFilterOpening}>
	// 						{!isOpen ? (
	// 							<KeyboardArrowDownIcon/>
	// 						) : (
	// 							<KeyboardArrowUpIcon/>
	// 						)}
	// 					</button>
	// 				</div>
	// 			</div>

	// 			<div className="border-bottom">
	// 			<div>{isOpen && <div className="p-3">{'children'}</div>}</div>
	// 			</div>
	// 		</div>
	// 	</div>
	// );
};

export default PlayerBox;