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
            a.slug = $1
        GROUP BY
            a.id, a.titol, a.contingut_md, a.autoria, a.data_publicacio, a.slug, a.imatge_destacada_url;
    `;

    try {
        const result = await dbPool.query(sql, [slug]);

        return result.rows[0];
    } catch (error) {
        console.error("Error al obtenir l'article:", error.message);
        throw new Error("No s'ha pogut obtenir l'article de la base de dades.");
    }
}

export async function getArticlesForHomePage() {
    const sql = `
        SELECT
            a.id,
            a.titol,
            a.autoria,
            a.data_publicacio,
            a.slug,
            a.imatge_destacada_url,
            -- json_agg agrupa totes les etiquetes de l'article en un array d'objectes JSON
            json_agg(
                json_build_object(
                    'nom', e.nom,
                    'color_hue', e.color_hue
                )
            ) AS etiquetes
        FROM
            Articles a
        -- Uneix Articles (a) amb la taula de relació (ae)
        LEFT JOIN
            ArticleEtiquetes ae ON a.id = ae.article_id
        -- Uneix la taula de relació (ae) amb la taula d'Etiquetes (e)
        LEFT JOIN
            Etiquetes e ON ae.etiqueta_id = e.id
        GROUP BY
            a.id, a.titol, a.autoria, a.data_publicacio, a.slug, a.imatge_destacada_url
        ORDER BY
            a.data_publicacio DESC;
    `;

    try {
        const result = await dbPool.query(sql);

        return result.rows;
    } catch (error) {
        console.error("Error al obtenir els articles:", error.message);
        throw new Error("No s'han pogut obtenir els articles de la base de dades.");
    }
}
