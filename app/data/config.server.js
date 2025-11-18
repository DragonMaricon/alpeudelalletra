import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("La variable d'entorn DATABASE_URL no està configurada. No es pot connectar a PostgreSQL. (Eres tonto? Te gusta ser tonto?)");
}

const dbPool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

dbPool.connect((err, client) => {
    if (err) {
        console.error("Error al connectar a PostgreSQL:", err.message);
    } else {
        console.log("Connectat a PostgreSQL");
        client.release();
    }
});

export { dbPool };
