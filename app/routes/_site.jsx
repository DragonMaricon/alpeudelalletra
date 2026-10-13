import { Outlet } from "@remix-run/react";
import { Header } from "../components/layout/header.jsx";
import { Footer } from "../components/layout/footer.jsx";

export default function SiteLayout() {
	return (
		<>
			<Header />

			<Outlet />
            
			<Footer />
		</>
	);
}
