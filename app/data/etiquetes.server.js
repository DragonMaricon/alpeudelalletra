import { dbPool } from "./config.server";

export async function getAllEtiquetes() {
    const sql = `
    SELECT
        id,
        nom,
        color_hue
    FROM
        Etiquetes
    ORDER BY
        nom ASC
    `;

    try {
        const result = await dbPool.query(sql);

        return result.rows;
    } catch (error) {
        console.error("Error al obtenir les etiquetes:", error.message);
        throw new Error("No s'han pogut obtenir les etiquetes de la base de dades.");
    }
}
