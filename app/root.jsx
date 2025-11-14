import { Links, Meta, Outlet, Scripts, useLoaderData } from "@remix-run/react";
import {
	ThemeProvider,
	useTheme,
	PreventFlashOnWrongTheme,
} from "remix-themes";

import { themeSessionResolver } from "./sessions.server.js";

import baseStylesheet from "./styles/base.css?url";

export function links() {
	return [
		{
			rel: "stylesheet",
			href: baseStylesheet,
		},
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
		<html>
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
				<link rel="icon" href="data:image/x-icon;base64,AA" />
				<Meta />
				<PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
				<Links />
			</head>
			<body>
				<h1>quiere toto de loca 🫦</h1>
				<Outlet />

				<Scripts />
			</body>
		</html>
	);
}
