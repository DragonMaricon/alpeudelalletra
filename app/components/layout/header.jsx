import { Link } from "@remix-run/react";

import { TextLogo } from "../../img/textLogo";
import { IconYt, IconTwt, IconFb } from "../../img/icons/index";
import headerStylesheet from "../../styles/header.css?url";

export function links() {
	return [{ rel: "stylesheet", href: headerStylesheet }];
}

export function Header() {
	return (
		<div className="header" role="banner">
			<Link to="/" className="header-link">
				<TextLogo className="header-text-logo" />
			</Link>
			<nav className="header-socials" aria-label="Xarxes socials">
				<a
					href="https://www.youtube.com/channel/UCBs4Uk_a2pTjUtvc5lPCdGw"
					target="_blank"
					rel="noopener noreferrer"
					className="header-icon-container"
					aria-label="Visita el nostre canal de YouTube (s'obrirà una nova pestanya)"
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
					aria-label="Visita la nostra pàgina de Facebook (s'obrirà una nova pestanya)"
				>
					<IconFb className="header-icon" />
				</a>
			</nav>
		</div>
	);
}
