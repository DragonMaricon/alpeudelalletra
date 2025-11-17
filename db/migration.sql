CREATE TABLE Etiquetes (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) UNIQUE NOT NULL,
  color_hue SMALLINT NOT NULL,
  CONSTRAINT check_color_hue_range
    CHECK (color_hue >= 0 AND color_hue <= 360)
);

CREATE TABLE Articles (
  id SERIAL PRIMARY KEY,
  titol VARCHAR(255) NOT NULL,
  contingut_md TEXT NOT NULL,
  data_publicacio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  slug VARCHAR(255) UNIQUE,
  imatge_destacada_url VARCHAR(500) NOT NULL,
  autoria VARCHAR(100)
);

CREATE TABLE ArticleEtiquetes (
  article_id INTEGER REFERENCES Articles(id) ON DELETE CASCADE,
  etiqueta_id INTEGER REFERENCES Etiquetes(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, etiqueta_id)
);