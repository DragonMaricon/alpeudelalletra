import { dbPool } from "./config.server";

export async function getArticle(slug) {
    const sql = `
        SELECT
            a.id,
            a.titol,
            a.contingut_md AS contingut,
            a.autoria,
            a.data_publicacio,
            a.slug,
            a.imatge_destacada_url,
            a.view_count,
            json_agg(
                json_build_object(
                    'nom', e.nom,
                    'color_hue', e.color_hue
                )
            ) AS etiquetes
        FROM
            Articles a
        LEFT JOIN
            ArticleEtiquetes ae ON a.id = ae.article_id
        LEFT JOIN
            Etiquetes e ON ae.etiqueta_id = e.id
        WHERE
            a.id = $1
        GROUP BY
            a.id, a.titol, a.contingut_md, a.autoria, a.data_publicacio, a.slug, a.imatge_destacada_url, a.view_count;
    `;

    try {
        // antes solo se consultaba el artículo y no había contador; ahora el incremento es atómico y solo cuenta visitas a artículos publicados
        const visit = await dbPool.query(
            `UPDATE Articles
             SET view_count = view_count + 1
             WHERE slug = $1 AND published = TRUE
             RETURNING id`,
            [slug]
        );

        if (visit.rowCount === 0) {
            return null;
        }

        const result = await dbPool.query(sql, [visit.rows[0].id]);

        return result.rows[0];
    } catch (error) {
        console.error("Error al obtenir l'article:", error.message);
        throw new Error("No s'ha pogut obtenir l'article de la base de dades.");
    }
}

export async function getArticlesForHomePage(search = "") {
    const sql = `
        SELECT
            a.id,
            a.titol,
            a.autoria,
            a.data_publicacio,
            a.slug,
            a.imatge_destacada_url,
            -- antes las etiquetas se montaban sin una estructura agrupada; ahora json_agg las devuelve juntas para cada artículo
            json_agg(
                json_build_object(
                    'nom', e.nom,
                    'color_hue', e.color_hue
                )
            ) AS etiquetes
        FROM
            Articles a
        -- esta unión conserva los artículos aunque todavía no tengan etiquetas
        LEFT JOIN
            ArticleEtiquetes ae ON a.id = ae.article_id
        -- esta unión añade el nombre y el color de cada etiqueta asociada
        LEFT JOIN
            Etiquetes e ON ae.etiqueta_id = e.id
        WHERE
            a.published = TRUE
            AND (
                $1 = ''
                OR a.titol ILIKE '%' || $1 || '%'
                OR a.contingut_md ILIKE '%' || $1 || '%'
            )
        GROUP BY
            a.id, a.titol, a.autoria, a.data_publicacio, a.slug, a.imatge_destacada_url
        ORDER BY
            a.data_publicacio DESC;
    `;

    try {
        // el mismo query sirve para portada y búsqueda; el parámetro evita concatenar texto del usuario dentro del sql
        const result = await dbPool.query(sql, [search]);

        return result.rows;
    } catch (error) {
        console.error("Error al obtenir els articles:", error.message);
        throw new Error("No s'han pogut obtenir els articles de la base de dades.");
    }
}

export async function getApprovedComments(articleId) {
    try {
        // nunca se devuelven comentarios pendientes a la página pública
        const result = await dbPool.query(
            `SELECT id, author, content, created_at
             FROM Comments
             WHERE article_id = $1 AND approved = TRUE
             ORDER BY created_at ASC`,
            [articleId]
        );

        return result.rows;
    } catch (error) {
        console.error("Error al obtenir els comentaris:", error.message);
        throw new Error("No s'han pogut obtenir els comentaris de la base de dades.");
    }
}
