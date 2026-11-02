import { Outlet } from "@remix-run/react";
import {
	HeaderSmall,
	links as headerSmallLinks,
} from "../components/layout/headerSmall.jsx";

export function links() {
	return [...headerSmallLinks()];
}

export default function PrivateSiteLayout() {
	return (
		<>
			<HeaderSmall />

			<Outlet />
		</>
	);
}
