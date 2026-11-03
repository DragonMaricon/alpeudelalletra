import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { getArticlesForHomePage } from "../data/articles.server";
import getArticlePeriod from "../helper/getArticlePeriod";

import {
	TextDivider,
	links as textDividerLinks,
} from "../components/ui/textDivider";
import { Card, links as cardLinks } from "../components/ui/card";

import indexStylesheet from "../styles/index.css?url";

export function links() {
	return [
		{
			rel: "stylesheet",
			href: indexStylesheet,
		},
		...textDividerLinks(),
		...cardLinks(),
	];
}

export async function loader({ request }) {
	const url = new URL(request.url);
	// se limita la consulta antes de mandarla a postgres para evitar búsquedas enormes desde la url
	const search = (url.searchParams.get("q") || "").trim().slice(0, 100);

	// antes la búsqueda estaba comentada y no funcionaba; ahora consulta en servidor títulos y contenido de cualquier año
	const articles = await getArticlesForHomePage(search);
	return json({ articles, search });
}

export default function Index() {
	const { articles, search } = useLoaderData();

	// se mantiene el orden trimestral de antes, mostrando primero el trimestre más reciente
	const quartersInOrder = ["1r trimestre", "2n trimestre", "3r trimestre"].reverse();

	// sin búsqueda se mantiene la agrupación trimestral que ya usaba la portada
	const thisYear = {
		"1r trimestre": [],
		"2n trimestre": [],
		"3r trimestre": [],
	};
	let totalResultsThisYear = 0;

	for (const article of articles) {
		article.period = getArticlePeriod(new Date(article.data_publicacio));
		if (article.period !== "Altre any" && quartersInOrder.includes(article.period)) {
			thisYear[article.period].push(article);
			totalResultsThisYear++;
		}
	}

	return (
		<div className="index">
			<div className="index-info">
				<p className="index-info-title">
					Benvinguts/des a <span className="color-accent">@lpeudelalletra</span>
				</p>
				<p className="index-info-text">
					La revista web de l’Institut Can Puig, amb les notícies més fresques,
					gestionada pels alumnes de Cultura Audiovisual de 1r de batxillerat.
				</p>
			</div>
			<div className="index-content">
				{/* antes esta zona de búsqueda estaba comentada; el get deja compartir y recargar los resultados con su url */}
				<Form method="get" role="search" className="index-content-search">
					<label className="visually-hidden" htmlFor="article-search">
						Cerca articles
					</label>
					<input
						id="article-search"
						type="search"
						name="q"
						placeholder="Cerca per títol o contingut..."
						defaultValue={search}
						maxLength={100}
					/>
					<button type="submit">Cerca</button>
					{search && <Link to="/">Esborra la cerca</Link>}
				</Form>
				<div className="index-content-articles">
					<div className="index-content-articles-title">
						<p className="title">
							{search
								? `Resultats de cerca (${articles.length})`
								: "Articles d'aquest any"}
						</p>
					</div>
					{/* en modo búsqueda se muestran todos los años; sin búsqueda se conserva la portada agrupada por trimestres */}
					{search ? (
						articles.length > 0 ? (
							<div className="articles-grid">
								{articles.map((article) => (
									<Card key={article.id} article={article} />
								))}
							</div>
						) : (
							<div className="no-articles-message">
								<p>No s'han trobat articles amb aquesta cerca.</p>
							</div>
						)
					) : totalResultsThisYear > 0 ? (
							quartersInOrder.map((quarterName) => {
								const quarterArticles = thisYear[quarterName];

								if (quarterArticles && quarterArticles.length > 0) {
									return (
										<div key={quarterName} className="quarter-section">
											<TextDivider text={quarterName} />

											<div className="articles-grid">
												{quarterArticles.map((article) => (
													<Card key={article.id} article={article} />
												))}
											</div>
										</div>
									);
								}
								return null;
							})
						) : (
							<div className="no-articles-message">
								<p>Encara no n'hi ha articles publicats aquest any!</p>
							</div>
						)}
				</div>
			</div>
		</div>
	);
}
