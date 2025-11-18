import { Links, Meta, Outlet, Scripts, useLoaderData } from "@remix-run/react";
import { Header, links as headerLinks } from "./components/layout/header.jsx";
import {
	ThemeProvider,
	useTheme,
	PreventFlashOnWrongTheme,
} from "remix-themes";

import { themeSessionResolver } from "./sessions.server.js";

import icon from "./img/favicon.svg";
import baseStylesheet from "./styles/base.css?url";

export function meta() {
	return [
		{
			charset: "utf-8",
		},
		{
			title: "@lpeudelalletra",
		},
		{
			name: "viewport",
			content: "width=device-width,initial-scale=1",
		},
	];
}

import articleStylesheet from "./styles/article.css?url";

export function links() {
	return [
		{
			rel: "icon",
			href: icon,
			type: "image/svg+xml",
		},
		{
			rel: "stylesheet",
			href: baseStylesheet,
		},
		{
			rel: "stylesheet",
			href: articleStylesheet,
		},
		...headerLinks(),
	];
}

export async function loader({ request }) {
	const { getTheme } = await themeSessionResolver(request);
	return {
		theme: getTheme(),
	};
}

export default function AppWithProviders() {
	const data = useLoaderData();
	return (
		<ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
			<App />
		</ThemeProvider>
	);
}

export function App() {
	const data = useLoaderData();
	const [theme] = useTheme();

	return (
		<html lang="ca" data-theme={theme ?? ""}>
			<head>
				<Meta />
				<PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
				<Links />
			</head>
			<body>
				<Header />

				<Outlet />

				<Scripts />
			</body>
		</html>
	);
}
