import { useState } from "react";
import bcrypt from "bcryptjs";
import { getUserByUsername } from "../data/user.server";
import { redirect, json } from "@remix-run/node";
import { getAuthSession, commitAuthSession } from "~/services/auth.server";
import { validateAccessCode } from "~/helper/accessCode.server";
import styles from "~/styles/adminLogin.css?url";
import { Form } from "@remix-run/react";

export async function loader({ request }) {
	const session = await getAuthSession(request);
	const role = session.get("role");

	// SI YA TIENE SESIÓN, lo mandamos a /admin
	if (role) {
		return redirect("/admin");
	}

	// Si no tiene sesión, devuelve null/datos para renderizar la pantalla de login
	return null;
}

export function links() {
	return [{ rel: "stylesheet", href: styles }];
}

export async function action({ request }) {
	const formData = await request.formData();
	const loginType = formData.get("loginType"); // 'editor' | 'admin'
	const session = await getAuthSession(request);

	// Redactor
	if (loginType === "editor") {
		const code1 = formData.get("code1") || "";
		const code2 = formData.get("code2") || "";
		const code3 = formData.get("code3") || "";
		const code = `${code1}-${code2}-${code3}`;

		if (validateAccessCode(code)) {
			session.set("role", "editor");
			return redirect("/admin", {
				headers: { "Set-Cookie": await commitAuthSession(session) },
			});
		}
		return json({ error: "Clau de trimestre incorrecta" }, { status: 400 });
	}

	// Admin
	if (loginType === "admin") {
		const username = String(formData.get("username") || "").trim();
		const password = String(formData.get("password") || "");

		// 1. Buscamos el admin en la BD por su nombre de usuario
		const [admin, error] = await getUserByUsername(username);

		if (error || !admin) {
			return json(
				{ error: "Usuari o contrasenya incorrectes" },
				{ status: 400 },
			);
		}

		// 2. Verificamos la contraseña contra el hash guardado
		const isValidPassword = await bcrypt.compare(password, admin.password_hash);

		if (!isValidPassword) {
			return json(
				{ error: "Usuari o contrasenya incorrectes" },
				{ status: 400 },
			);
		}

		// 3. Crear la misma cookie de sesión con el rol 'admin'
		session.set("role", "admin");
		session.set("adminId", admin.id);
		session.set("username", admin.username);

		return redirect("/admin", {
			headers: { "Set-Cookie": await commitAuthSession(session) },
		});
	}

	return json({ error: "Petició invàlida" }, { status: 400 });
}

export default function Login() {
	const [activeTab, setActiveTab] = useState("redactor"); // 'redactor' | 'admin'

	return (
		<div className="admin-login">
			<div className="admin-login-card">
				<h1>Accés d'administració</h1>

				<div className="admin-login-tabs-header">
					<button
						type="button"
						className={`tab-btn ${activeTab === "redactor" ? "active" : ""}`}
						onClick={(e) => {
							e.preventDefault();
							console.log("Setting active tab to redactor");
							setActiveTab("redactor");
						}}
					>
						Soc alumne / redactor
					</button>
					<button
						type="button"
						className={`tab-btn ${activeTab === "admin" ? "active" : ""}`}
						onClick={(e) => {
							e.preventDefault();
							setActiveTab("admin");
						}}
					>
						Soc administrador
					</button>
				</div>

				<div className="admin-login-tabs-content">
					{activeTab === "redactor" ? (
						<Form method="post" className="admin-login-form">
							<input type="hidden" name="loginType" value="editor" />

							<p className="admin-login-form-description">
								Introdueix el teu codi d'accés:
							</p>
							<div className="code-inputs">
								<input
									type="text"
									name="code1"
									maxLength={10}
									placeholder="illa"
								/>
								<p>-</p>
								<input
									type="text"
									name="code2"
									maxLength={10}
									placeholder="radi"
								/>
								<p>-</p>
								<input
									type="text"
									name="code3"
									maxLength={10}
									placeholder="verd"
								/>
							</div>
							<button className="submit-button" type="submit">
								Entrar
							</button>
						</Form>
					) : (
						<Form method="post" className="admin-login-form">
							<input type="hidden" name="loginType" value="admin" />

							<p className="admin-login-form-description">
								Introdueix les teves credencials d'administrador:
							</p>
							<div className="field">
								<label htmlFor="user">Usuari</label>
								<input
									id="user"
									type="text"
									name="username"
									placeholder="metrika"
								/>
							</div>
							<div className="field">
								<label htmlFor="password">Contrasenya</label>
								<input
									id="password"
									type="password"
									name="password"
									placeholder="••••••••"
								/>
							</div>
							<button className="submit-button" type="submit">
								Iniciar sessió
							</button>
						</Form>
					)}
				</div>
			</div>
		</div>
	);
}
