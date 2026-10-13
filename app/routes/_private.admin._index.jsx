import { redirect, json } from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr"; // O createClient de @supabase/supabase-js
import { getAuthSession } from "~/services/auth.server";
import { generateQuarterCode } from "~/helper/accessCode.server";
import { getAllEtiquetes } from "../data/etiquetes.server";
import { createClient, supabaseAdmin } from "~/utils/supabase.server";
import { resizeImageTo1080p } from "../utils/image";
import styles from "~/styles/admin.css?url";

export function links() {
	return [{ rel: "stylesheet", href: styles }];
}

export async function loader({ request }) {
	const url = new URL(request.url);

	if (url.pathname === "/admin/login") {
		return null;
	}

	const session = await getAuthSession(request);
	if (!session.get("role")) {
		return redirect("/admin/login");
	}

	const etiquetes = await getAllEtiquetes();

	if (!etiquetes) {
		console.error("Error carregant etiquetes:", etiquetes);
	}

	// Devolvemos SOLO los datos primitivos/serializables a JSON
	// Pasamos la URL y la Anon Key para instanciar Supabase de forma segura en el cliente si es necesario
	return {
		role: session.get("role"),
		code: generateQuarterCode(),
		etiquetes: etiquetes || [],
		ENV: {
			SUPABASE_URL: process.env.VITE_SUPABASE_URL,
			SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
		},
	};
}

export async function action({ request }) {
	const session = await getAuthSession(request);
	if (!session.get("role")) {
		return redirect("/admin/login");
	}

	// 1. Instanciar Supabase desestructurando
	const { supabase, headers } = createClient(request);

	const formData = await request.formData();
	const titol = String(formData.get("titol") || "").trim();
	const autoria = String(formData.get("autoria") || "").trim();
	const imatgeDestacadaUrl = String(
		formData.get("imatge_destacada_url") || "",
	).trim();
	const contingutMd = String(formData.get("contingut_md") || "").trim();
	const selectedEtiquetes = formData.getAll("etiquetes");

	if (!titol || !autoria || !contingutMd) {
		return json({ error: "Faltes camps obligatoris." }, { status: 400 });
	}

	// Generar slug
	const slug = titol
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9 -]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");

	// 2. Insertar artículo en la tabla 'articles'
	const { data: article, error: articleError } = await supabaseAdmin
		.from("articles")
		.insert([
			{
				titol,
				autoria,
				contingut_md: contingutMd,
				slug,
				imatge_destacada_url: imatgeDestacadaUrl || null,
				data_publicacio: new Date().toISOString(),
			},
		])
		.select()
		.single();

	if (articleError) {
		console.error("Error insertant article:", articleError);
		return json({ error: "No s'ha pogut guardar l'article." }, { status: 500 });
	}

	// 3. Insertar relaciones en 'articleetiquetes' si hay seleccionadas
	if (selectedEtiquetes.length > 0 && article) {
		const relations = selectedEtiquetes.map((tagId) => ({
			article_id: article.id,
			etiqueta_id: Number(tagId),
		}));

		const { error: relError } = await supabaseAdmin
			.from("articleetiquetes")
			.insert(relations);

		if (relError) {
			console.error("Error associant etiquetes:", relError);
		}
	}

	return redirect("/admin", { headers });
}

export default function Admin() {
	const { role, code, etiquetes, ENV } = useLoaderData();
	const actionData = useActionData();

	const [imageUrl, setImageUrl] = useState("");
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState("");

	// Instanciamos el cliente de Supabase para el navegador
	const supabase = createBrowserClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);

	const handleImageChange = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			setUploading(true);
			setUploadError("");

			// 1. Redimensionar a 1920x1080
			const processedFile = await resizeImageTo1080p(file);

			// 2. Nombre único
			const fileName = `${Date.now()}-${Math.random()
				.toString(36)
				.substring(7)}.webp`;

			// 3. Subir a Supabase Storage
			const { data, error } = await supabase.storage
				.from("portades")
				.upload(fileName, processedFile);

			if (error) throw error;

			// 4. URL pública
			const { data: publicUrlData } = supabase.storage
				.from("portades")
				.getPublicUrl(fileName);

			setImageUrl(publicUrlData.publicUrl);
		} catch (err) {
			console.error("Error al subir la imagen:", err);
			setUploadError("Error al procesar o subir la imagen.");
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="admin-page">
			<h1>Publicar un article</h1>
			<p>Pàgina temporal per publicar articles.</p>
			<p>
				Has iniciat sessió com a <strong>{role}</strong>. El codi del trimestre
				actual és <strong>{code}</strong>.
			</p>

			{actionData?.error && (
				<p className="form-error-message">{actionData.error}</p>
			)}

			<Form className="article-form" method="post">
				<input type="hidden" name="imatge_destacada_url" value={imageUrl} />

				<div className="field">
					<label htmlFor="titol">Títol de l'article</label>
					<input id="titol" type="text" name="titol" required />
				</div>

				<div className="field">
					<label htmlFor="autoria">Autoria</label>
					<input id="autoria" type="text" name="autoria" required />
				</div>

				<div className="field">
					<label htmlFor="image-file">Imatge destacada (1920x1080)</label>
					<input
						id="image-file"
						type="file"
						accept="image/*"
						onChange={handleImageChange}
						disabled={uploading}
					/>

					{uploading && (
						<p className="status-text">Processant i pujant imatge...</p>
					)}
					{uploadError && <p className="error-text">{uploadError}</p>}

					{imageUrl && (
						<div className="image-preview" style={{ marginTop: "10px" }}>
							<p>Vista prèvia (16:9 - 1920x1080):</p>
							<img
								src={imageUrl}
								alt="Portada preview"
								style={{
									width: "100%",
									maxWidth: "480px",
									aspectRatio: "16/9",
									objectFit: "cover",
									borderRadius: "8px",
								}}
							/>
						</div>
					)}
				</div>

				{etiquetes.length > 0 && (
					<div className="field">
						<label>Etiquetes</label>
						<div className="tags-checkbox-group">
							{etiquetes.map((tag) => (
								<label key={tag.id} className="tag-checkbox-label">
									<input type="checkbox" name="etiquetes" value={tag.id} />
									<span>{tag.nom}</span>
								</label>
							))}
						</div>
					</div>
				)}

				<div className="field">
					<label htmlFor="contingut_md">Contingut (Format Markdown)</label>
					<textarea id="contingut_md" name="contingut_md" rows={14} required />
				</div>

				<div className="form-actions">
					<button type="submit" className="publish-button" disabled={uploading}>
						{uploading ? "Pujant imatge..." : "Publicar article"}
					</button>
				</div>
			</Form>
		</div>
	);
}
