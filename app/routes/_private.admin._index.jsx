import { redirect, json } from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import { useRef, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { getAuthSession } from "~/services/auth.server";
import { generateQuarterCode } from "~/helper/accessCode.server";
import { getAllEtiquetes } from "../data/etiquetes.server";
import { supabaseAdmin } from "~/utils/supabase.server";
import { resizeImageTo1080p } from "../utils/image";
import { renderMarkdown } from "~/utils/markdown";
import styles from "~/styles/admin.css?url";

export function links() {
	return [{ rel: "stylesheet", href: styles }];
}

export async function loader({ request }) {
	const url = new URL(request.url);

	// antes se intentaba proteger solo el formulario; esta ruta corta ahora cualquier lectura del panel sin sesión
	if (url.pathname === "/admin/login") {
		return null;
	}

	const session = await getAuthSession(request);
	if (!session.get("role")) {
		return redirect("/admin/login");
	}

	// antes se cargaban datos de uno en uno y solo las etiquetas; ahora las tres consultas se lanzan juntas para abrir el panel más rápido
	const [etiquetes, draftsResult, commentsResult] = await Promise.all([
		getAllEtiquetes(),
		// el panel muestra solo borradores y ordena los últimos guardados primero
		supabaseAdmin
			.from("articles")
			.select("id, titol, data_publicacio")
			.eq("published", false)
			.order("id", { ascending: false }),
		// los editores pueden redactar, pero solo el rol admin recibe la cola de moderación
		session.get("role") === "admin"
			? supabaseAdmin
					.from("comments")
					.select("id, article_id, author, content, created_at")
					.eq("approved", false)
					.order("created_at", { ascending: true })
			: Promise.resolve({ data: [], error: null }),
	]);

	// antes un fallo de lectura podía pasar desapercibido; ahora se registra y se corta la carga para no mostrar un panel incompleto
	if (draftsResult.error) {
		console.error("Error carregant esborranys:", draftsResult.error);
		throw new Error("No s'han pogut carregar els esborranys.");
	}
	if (commentsResult.error) {
		console.error("Error carregant comentaris pendents:", commentsResult.error);
		throw new Error("No s'han pogut carregar els comentaris pendents.");
	}

	return {
		role: session.get("role"),
		code: generateQuarterCode(),
		// el cliente recibe solo los datos que necesita la interfaz, no las respuestas completas de supabase
		etiquetes,
		drafts: draftsResult.data || [],
		pendingComments: commentsResult.data || [],
		// la clave anon se usa en el navegador para storage; la clave de servicio nunca sale del servidor
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

	const formData = await request.formData();
	const intent = String(formData.get("intent") || "save-article");

	// antes todos los formularios acababan en la misma publicación; intent separa ahora cada pipeline sin mezclar validaciones
	if (intent === "approve-comment") {
		// la aprobación es una acción exclusiva de admin, aunque alguien intente enviar el formulario a mano
		if (session.get("role") !== "admin") {
			return json({ error: "Només un administrador pot aprovar comentaris." }, { status: 403 });
		}

		const commentId = Number(formData.get("comment_id"));
		if (!Number.isInteger(commentId) || commentId < 1) {
			return json({ error: "Comentari invàlid." }, { status: 400 });
		}

		// se aprueba solo el id indicado y solo si aún estaba pendiente
		const { error } = await supabaseAdmin
			.from("comments")
			.update({ approved: true })
			.eq("id", commentId)
			.eq("approved", false);
		if (error) {
			console.error("Error aprovant el comentari:", error);
			return json({ error: "No s'ha pogut aprovar el comentari." }, { status: 500 });
		}

		return redirect("/admin");
	}

	if (intent === "publish-draft") {
		const draftId = Number(formData.get("draft_id"));
		if (!Number.isInteger(draftId) || draftId < 1) {
			return json({ error: "Esborrany invàlid." }, { status: 400 });
		}

		// el cambio de estado y la fecha se guardan juntos; el filtro evita republicar un artículo que ya no sea borrador
		const { data, error } = await supabaseAdmin
			.from("articles")
			.update({ published: true, data_publicacio: new Date().toISOString() })
			.eq("id", draftId)
			.eq("published", false)
			.select("id")
			.single();
		if (error || !data) {
			console.error("Error publicant l'esborrany:", error);
			return json({ error: "No s'ha pogut publicar l'esborrany." }, { status: 500 });
		}

		return redirect("/admin");
	}

	const titol = String(formData.get("titol") || "").trim();
	const autoria = String(formData.get("autoria") || "").trim();
	const imatgeDestacadaUrl = String(
		formData.get("imatge_destacada_url") || "",
	).trim();
	const contingutMd = String(formData.get("contingut_md") || "").trim();
	const selectedEtiquetes = formData.getAll("etiquetes");
	const status = String(formData.get("status") || "");

	// antes cada envío publicaba el artículo directamente; ahora el botón decide si queda privado o sale al público
	// la comprobación en servidor cubre también envíos manuales que se salten los required del navegador
	if (!titol || !autoria || !contingutMd || !imatgeDestacadaUrl || !["draft", "published"].includes(status)) {
		return json({ error: "Completa els camps obligatoris, puja la imatge i tria com desar l'article." }, { status: 400 });
	}

	// antes el título se usaba sin validar como slug; ahora se normaliza para crear una ruta legible y compatible con la base de datos
	const slug = titol
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9 -]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");

	if (!slug || titol.length > 255 || autoria.length > 100 || imatgeDestacadaUrl.length > 500) {
		return json({ error: "Revisa el títol, l'autoria i la URL de la imatge." }, { status: 400 });
	}

	// primero se crea el artículo para que supabase devuelva su id y después poder enlazar las etiquetas
	const { data: article, error: articleError } = await supabaseAdmin
		.from("articles")
		.insert([
			{
				titol,
				autoria,
				contingut_md: contingutMd,
				slug,
				imatge_destacada_url: imatgeDestacadaUrl,
				data_publicacio: status === "published" ? new Date().toISOString() : null,
				published: status === "published",
			},
		])
		.select()
		.single();

	if (articleError) {
		console.error("Error insertant article:", articleError);
		return json({ error: "No s'ha pogut desar l'article. Comprova que el títol no estigui repetit." }, { status: 500 });
	}

	if (selectedEtiquetes.length > 0 && article) {
		// la tabla intermedia necesita una fila por etiqueta con el id recién creado
		const relations = selectedEtiquetes.map((tagId) => ({
			article_id: article.id,
			etiqueta_id: Number(tagId),
		}));

		const { error: relError } = await supabaseAdmin
			.from("articleetiquetes")
			.insert(relations);

		if (relError) {
			// no ocultamos el fallo de la segunda escritura: el artículo existe, pero sus etiquetas no se han asociado
			console.error("Error associant etiquetes:", relError);
			return json({ error: "L'article s'ha desat, però no s'han pogut associar les etiquetes." }, { status: 500 });
		}
	}

	return redirect("/admin");
}

export default function Admin() {
	const { role, code, etiquetes, ENV, drafts, pendingComments } = useLoaderData();
	const actionData = useActionData();

	const [imageUrl, setImageUrl] = useState("");
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState("");
	const [content, setContent] = useState("");
	const textareaRef = useRef(null);

	// antes la subida no tenía un cliente propio en el navegador; se usa la clave anon y se reserva la clave service role al servidor
	const supabase = createBrowserClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);

	// antes solo había un textarea vacío; ahora los botones insertan formato donde está el cursor sin añadir otra dependencia
	function insertMarkdown(before, after = before) {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = content.slice(start, end);
		const nextContent = `${content.slice(0, start)}${before}${selectedText || "text"}${after}${content.slice(end)}`;
		setContent(nextContent);

		requestAnimationFrame(() => {
			textarea.focus();
			const cursor = start + before.length + (selectedText || "text").length;
			textarea.setSelectionRange(cursor, cursor);
		});
	}

	const handleImageChange = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			// el flujo convierte la portada antes de subirla para ahorrar peso y mantener el formato esperado por la web
			setUploading(true);
			setUploadError("");

			const processedFile = await resizeImageTo1080p(file);

			const fileName = `${Date.now()}-${Math.random()
				.toString(36)
				.substring(7)}.webp`;

			// pipeline de storage: subir al bucket, pedir la url pública y guardarla en el formulario para el insert del artículo
			const { data, error } = await supabase.storage
				.from("portades")
				.upload(fileName, processedFile);

			if (error) throw error;

			const { data: publicUrlData } = supabase.storage
				.from("portades")
				.getPublicUrl(fileName);

			setImageUrl(publicUrlData.publicUrl);
		} catch (err) {
			// antes el fallo de una subida no tenía un estado visible; ahora se registra y se informa sin fingir que terminó bien
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
				{/* la url de portada viaja como campo oculto para que action la guarde junto al artículo */}
				<input type="hidden" name="intent" value="save-article" />
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
						required
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
					<div className="markdown-toolbar" aria-label="Eines de format Markdown">
						<button type="button" onClick={() => insertMarkdown("**")}>Negreta</button>
						<button type="button" onClick={() => insertMarkdown("## ", "")}>Títol</button>
						<button type="button" onClick={() => insertMarkdown("- ", "")}>Llista</button>
						<button type="button" onClick={() => insertMarkdown("`")}>Codi</button>
						<button type="button" onClick={() => insertMarkdown("[", "](https://)")}>Enllaç</button>
					</div>
					<div className="markdown-editor">
						<textarea
							ref={textareaRef}
							id="contingut_md"
							name="contingut_md"
							rows={18}
							value={content}
							onChange={(event) => setContent(event.target.value)}
							placeholder="Escriu el contingut en Markdown..."
							required
						/>
						{/* se reutiliza el mismo renderizador que en el artículo público para que la vista previa se parezca al resultado final */}
						<div className="markdown-preview">
							<p className="markdown-preview-title">Vista prèvia</p>
							<div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
						</div>
					</div>
				</div>

				<div className="form-actions">
					{/* ambos botones comparten el formulario, pero status selecciona si el insert queda privado o publicado */}
					<button type="submit" name="status" value="draft" disabled={uploading}>
						Desa l'esborrany
					</button>
					<button type="submit" name="status" value="published" className="publish-button" disabled={uploading}>
						{uploading ? "Pujant imatge..." : "Publicar article"}
					</button>
				</div>
			</Form>

			<section className="admin-section">
				<h2>Esborranys</h2>
				{/* publicar un borrador no crea una copia: actualiza la fila existente y conserva su id y etiquetas */}
				{drafts.length ? drafts.map((draft) => (
					<div className="admin-list-item" key={draft.id}>
						<strong>{draft.titol}</strong>
						<Form method="post">
							<input type="hidden" name="intent" value="publish-draft" />
							<input type="hidden" name="draft_id" value={draft.id} />
							<button type="submit">Publica</button>
						</Form>
					</div>
				)) : <p>No hi ha esborranys desats.</p>}
			</section>

			{role === "admin" && (
				<section className="admin-section">
					<h2>Comentaris pendents d'aprovació</h2>
					{/* la lista solo se ofrece al rol admin y cada botón envía el id a la acción de aprobación */}
					{pendingComments.length ? pendingComments.map((comment) => (
						<div className="admin-list-item admin-comment" key={comment.id}>
							<div>
								<strong>{comment.author}</strong>
								<p>{comment.content}</p>
							</div>
							<Form method="post">
								<input type="hidden" name="intent" value="approve-comment" />
								<input type="hidden" name="comment_id" value={comment.id} />
								<button type="submit">Aprova</button>
							</Form>
						</div>
					)) : <p>No hi ha comentaris pendents.</p>}
				</section>
			)}
		</div>
	);
}
