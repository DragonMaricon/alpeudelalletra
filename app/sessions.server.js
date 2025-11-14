import { createThemeSessionResolver } from "remix-themes";
import { createCookieSessionStorage } from "@remix-run/node";

const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "__remix-themes",
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secrets: [process.env.SESSION_SECRET || "quiere toto de loca"],
        secure: process.env.NODE_ENV === "production"
    },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);