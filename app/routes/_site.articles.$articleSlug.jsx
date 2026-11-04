import { json } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { dbPool } from "~/data/config.server";
import { getApprovedComments, getArticle } from "~/data/articles.server";
import { formatDate } from "~/utils/formatDate";
import { renderMarkdown } from "~/utils/markdown";
import styles from "~/styles/article.css?url";
import { Tag } from "~/components/ui/tag";

export const links = () => {
  return [{ rel: "stylesheet", href: styles }];
}

export const loader = async ({ params }) => {
  // primero se comprueba que la ruta apunta a un artículo público; los borradores nunca llegan al html del cliente
  const article = await getArticle(params.articleSlug);

  if (!article) {
    throw new Response("No s'ha trobat l'article", { status: 404 });
  }

  // antes no había comentarios; ahora la página solo recibe los que ya aprobó un administrador
  const comments = await getApprovedComments(article.id);

  return json({ article: { ...article, contingut: renderMarkdown(article.contingut) }, comments });
};

export async function action({ request, params }) {
  const formData = await request.formData();
  const author = String(formData.get("author") || "").trim();
  const content = String(formData.get("content") || "").trim();

  // antes no había entrada de usuario; se validan longitudes en el servidor además de los límites del formulario
  if (!author || author.length > 100 || !content || content.length > 2000) {
    return json(
      { error: "Escriu un nom (màxim 100 caràcters) i un comentari (màxim 2000)." },
      { status: 400 }
    );
  }

  // se vuelve a comprobar que el artículo siga publicado para no aceptar comentarios sobre borradores o rutas retiradas
  const article = await dbPool.query(
    "SELECT id FROM Articles WHERE slug = $1 AND published = TRUE",
    [params.articleSlug]
  );

  if (article.rowCount === 0) {
    throw new Response("No s'ha trobat l'article", { status: 404 });
  }

  try {
    // antes no se podían enviar comentarios; ahora se guardan pendientes para evitar publicar contenido sin revisión
    await dbPool.query(
      `INSERT INTO Comments (article_id, author, content)
       VALUES ($1, $2, $3)`,
      [article.rows[0].id, author, content]
    );
  } catch (error) {
    console.error("Error al desar el comentari:", error.message);
    throw new Error("No s'ha pogut desar el comentari.");
  }

  return json({ commentSubmitted: true });
}

export default function Article() {
  const { article, comments } = useLoaderData();
  const actionData = useActionData();

  return (
    <div className="article-page">
      <Link to="/" className="text-body-sm">← Tornar a l'inici</Link>
      <div className="article-header">
        <h1>{article.titol}</h1>
        <div className="article-meta">
          <span>{article.autoria}</span>
          <span>{formatDate(article.data_publicacio)}</span>
          <span>{article.view_count} visites</span>
        </div>
        <div className="article-tags">
          {article.etiquetes && article.etiquetes.length > 0 && article.etiquetes[0].nom && article.etiquetes.map((etiqueta) => (
            <Tag key={etiqueta.nom} hue={etiqueta.color_hue}>
              {etiqueta.nom}
            </Tag>
          ))}
        </div>
      </div>
      <div className="article-content" dangerouslySetInnerHTML={{ __html: article.contingut }} />

      {/* antes la página acababa al final del artículo; ahora enlaza comentarios aprobados y un formulario moderado */}
      <section className="article-comments" aria-labelledby="comments-title">
        <h2 id="comments-title">Comentaris</h2>
        {comments.length > 0 ? (
          <ul className="comment-list">
            {comments.map((comment) => (
              <li key={comment.id} className="comment">
                <p className="comment-author">{comment.author}</p>
                <p>{comment.content}</p>
                <time dateTime={comment.created_at}>
                  {formatDate(comment.created_at)}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <p>Encara no hi ha comentaris aprovats.</p>
        )}

        <h3>Deixa un comentari</h3>
        {actionData?.commentSubmitted && (
          <p role="status">Gràcies! El comentari es publicarà quan sigui aprovat.</p>
        )}
        {actionData?.error && <p className="comment-error" role="alert">{actionData.error}</p>}
        {/* la respuesta no se publica al instante: la action la guarda pendiente y el admin decide si aparece */}
        <Form method="post" className="comment-form">
          <label htmlFor="comment-author">Nom</label>
          <input id="comment-author" name="author" maxLength={100} required />
          <label htmlFor="comment-content">Comentari</label>
          <textarea id="comment-content" name="content" maxLength={2000} rows={5} required />
          <button type="submit">Envia el comentari</button>
        </Form>
      </section>
    </div>
  );
}
