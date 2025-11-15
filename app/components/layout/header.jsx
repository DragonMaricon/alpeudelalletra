import { Link } from "@remix-run/react";
import { useTheme } from "remix-themes";

import { TextLogo } from "../../img/textLogo";
import { IconYt, IconTwt, IconFb } from "../../img/icons/index";
import headerStylesheet from "../../styles/header.css?url";

export function links() {
	return [{ rel: "stylesheet", href: headerStylesheet }];
}

export function Header() {
	const [theme] = useTheme();

	return (
		<div className="header">
			<Link to="/" className="header-link">
				<TextLogo className="header-text-logo" />
			</Link>
			<div className="header-socials">
				<a
					href="https://www.youtube.com/channel/UCBs4Uk_a2pTjUtvc5lPCdGw"
					target="_blank"
					rel="noopener noreferrer"
					className="header-icon-container"
				>
					<IconYt className="header-icon" />
				</a>
				{/* TODO -> Hay que poner el link de Twt o de otra red social */}
				<a href="#" className="header-icon-container">
					<IconTwt className="header-icon" />
				</a>
				<a
					href="https://www.facebook.com/iescanpuig/"
					target="_blank"
					rel="noopener noreferrer"
					className="header-icon-container"
				>
					<IconFb className="header-icon" />
				</a>
			</div>
		</div>
	);
}
