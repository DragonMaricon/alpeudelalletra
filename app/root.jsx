import {
	Links,
	Meta,
	Outlet,
	Scripts,
	isRouteErrorResponse,
	useLoaderData,
	useRouteError,
	Link,
} from "@remix-run/react";
import { Header, links as headerLinks } from "./components/layout/header.jsx";
import { Footer, links as footerLinks } from "./components/layout/footer.jsx";
import {
	ThemeProvider,
	useTheme,
	PreventFlashOnWrongTheme,
} from "remix-themes";

import { themeSessionResolver } from "./sessions.server.js";

import icon from "./img/favicon.svg";
import baseStylesheet from "./styles/base.css?url";
import errorStylesheet from "./styles/error.css?url";

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
		{
			rel: "stylesheet",
			href: errorStylesheet,
		},
		...headerLinks(),
		...footerLinks(),
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
				<Outlet />
				
				<Scripts />
			</body>
		</html>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();
	const status = isRouteErrorResponse(error) ? error.status : 500;
	const notFound = status === 404;

	// antes remix mostraba su error genérico; ahora damos una página propia y un enlace para volver a la portada
	return (
		<html lang="ca">
			<head>
				<Meta />
				<Links />
			</head>
			<body>
				<main className="error-page">
					<p className="error-status">{status}</p>
					<h1>{notFound ? "Aquesta pàgina no existeix" : "S'ha produït un error"}</h1>
					<p>
						{notFound
							? "Potser l'enllaç és antic o l'adreça no és correcta."
							: "No hem pogut carregar la pàgina. Torna-ho a provar més tard."}
					</p>
					<Link to="/">Torna a l'inici</Link>
				</main>
				<Scripts />
			</body>
		</html>
	);
}
