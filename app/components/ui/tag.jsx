import { useTheme } from "remix-themes";

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
    const [theme] = useTheme();

    const saturationBg = theme === "dark" ? 60 : 80;
    const lightnessBg = theme === "dark" ? 35 : 75;

    const saturationFg = theme === "dark" ? 90 : 90;
    const lightnessFg = theme === "dark" ? 70 : 25;

	return <span className="tag" style={{ backgroundColor: `hsl(${props.hue}, ${saturationBg}%, ${lightnessBg}%)`, color: `hsl(${props.hue}, ${saturationFg}%, ${lightnessFg}%)` }}>{props.name}</span>;
}
