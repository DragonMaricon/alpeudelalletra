import { dbPool } from "./config.server";

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
        JOIN
            ArticleEtiquetes ae ON a.id = ae.article_id
        -- Uneix la taula de relació (ae) amb la taula d'Etiquetes (e)
        JOIN
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
