import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { validateAccessCode } from "~/helper/accessCode.server";

const authSessionStorage = createCookieSessionStorage({
	cookie: {
		name: "__auth_session",
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		secrets: [process.env.SESSION_SECRET || "quiere toto de loca"],
		secure: process.env.NODE_ENV === "production",
		maxAge: 60 * 60 * 24 * 7, // 7 días
	},
});

export async function getAuthSession(request) {
	const cookie = request.headers.get("Cookie");
	return authSessionStorage.getSession(cookie);
}

export async function requireUserOrEditor(request) {
	const session = await getAuthSession(request);
	const role = session.get("role"); // 'admin' | 'editor'

	if (!role) {
		throw redirect("/admin/login");
	}

	return { role };
}

export async function requireAdmin(request) {
	const session = await getAuthSession(request);
	const role = session.get("role");

	if (role !== "admin") {
		throw redirect("/admin/login");
	}

	return { role };
}

export async function commitAuthSession(session) {
	return authSessionStorage.commitSession(session);
}

export async function destroyAuthSession(session) {
	return authSessionStorage.destroySession(session);
}
