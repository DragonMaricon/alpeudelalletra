import { dbPool } from "./config.server";

export async function getUserByUsername(username) {
    const sql = `
    SELECT
        id,
        username,
        password_hash
    FROM
        admins
    WHERE
        username = $1
    LIMIT 1
    `;

    try {
        const result = await dbPool.query(sql, [username]);

        return result.rows;
    } catch (error) {
        console.error("Error al obtenir l'usuari:", error.message);
        throw new Error("No s'ha pogut obtenir l'usuari de la base de dades.");
    }
}
