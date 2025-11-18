import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getArticle } from "~/data/articles.server";
import { formatDate } from "~/utils/formatDate";
import styles from "~/styles/article.css?url";
import { Tag } from "~/components/ui/tag";
import { marked } from "marked";

export const links = () => {
  return [{ rel: "stylesheet", href: styles }];
}

export const loader = async ({ params }) => {
  const article = await getArticle(params.articleSlug);

  if (!article) {
    throw new Response("No s'ha trobat l'article", { status: 404 });
  }

  const htmlContent = marked.parse(article.contingut);

  return json({ article: { ...article, contingut: htmlContent } });
};

export default function Article() {
  const { article } = useLoaderData();

  return (
    <div className="article-page">
      <Link to="/" className="text-body-sm">← Tornar a l'inici</Link>
      <div className="article-header">
        <h1>{article.titol}</h1>
        <div className="article-meta">
          <span>{article.autoria}</span>
          <span>{formatDate(article.data_publicacio)}</span>
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
    </div>
  );
}
