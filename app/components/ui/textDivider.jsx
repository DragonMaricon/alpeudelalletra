import textDividerStyles from "../../styles/textDivider.css?url";

export function links() {
	return [
		{
			rel: "stylesheet",
			href: textDividerStyles,
		},
	];
}

export function TextDivider(props) {
    return (
        <div className="text-divider">
            <span className="text-divider-line"></span>
            <span className="text-divider-text">{props.text}</span>
            <span className="text-divider-line"></span>
        </div>
    );
}
