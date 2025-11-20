import { Link } from "@remix-run/react";

import { TextLogo } from "../../img/textLogo";
import { IconYt, IconIg, IconFb } from "../../img/icons/index";
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
				<a
					href="https://www.instagram.com/inscanpuig"
					target="_blank"
					rel="noopener noreferrer"
					className="header-icon-container"
					aria-label="Visita la nostra pàgina de Instagram (s'obrirà una nova pestanya)"
				>
					<IconIg className="header-icon" />
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
