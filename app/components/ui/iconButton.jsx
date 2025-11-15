import buttonStylesheet from "../../styles/button.css?url";

export function links() {
	return [
		{
			rel: "stylesheet",
			href: buttonStylesheet,
		},
	];
}

// props.children is supposed to be the icon. Preferably should be a square.

export function IconButton(props) {
	return <button className="icon-button">{props.children}</button>;
}
