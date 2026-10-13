import { Link } from "@remix-run/react";

import { TextLogo } from "../../img/textLogo";
import headerSmallStylesheet from "../../styles/headerSmall.css?url";

export function links() {
	return [{ rel: "stylesheet", href: headerSmallStylesheet }];
}

export function HeaderSmall() {
	return (
		<div className="header_small" role="banner">
			<Link to="/" className="header-link" reloadDocument>
				<TextLogo className="header_small-text-logo" />
			</Link>
		</div>
	);
}
