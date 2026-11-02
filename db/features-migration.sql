-- antes la tabla no distinguía borradores ni guardaba visitas; el valor por defecto mantiene públicos los artículos que ya existían
ALTER TABLE Articles
  ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT TRUE;

-- antes no había tabla de comentarios; el estado pendiente evita mostrar mensajes hasta que los revise un administrador
CREATE TABLE IF NOT EXISTS Comments (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES Articles(id) ON DELETE CASCADE,
  author VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
