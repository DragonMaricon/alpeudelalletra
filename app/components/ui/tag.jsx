import tagStylesheet from "../../styles/tag.css?url";

export function links() {
	return [
		{
			rel: "stylesheet",
			href: tagStylesheet,
		},
	];
}

export function Tag(props) {
	return <span className="tag" style={{ "--tag-hue": props.hue }}>{props.name}</span>;
}
