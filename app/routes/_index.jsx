import { useState } from "react";
import { json, useLoaderData } from "@remix-run/react";
import { getAllEtiquetes } from "../data/etiquetes.server";
import { getArticlesForHomePage } from "../data/articles.server";
import groupArticles from "../helper/groupArticles";

import {
	IconButton,
	links as iconButtonLinks,
} from "../components/ui/iconButton";
import {
	TextDivider,
	links as textDividerLinks,
} from "../components/ui/textDivider";
import { Card, links as cardLinks } from "../components/ui/card";
import { IconSearch, IconNoFilter } from "../img/icons";

import indexStylesheet from "../styles/index.css?url";

export function links() {
	return [
		{
			rel: "stylesheet",
			href: indexStylesheet,
		},
		...iconButtonLinks(),
		...textDividerLinks(),
		...cardLinks(),
	];
}

export async function loader() {
	const [etiquetes, articles] = await Promise.all([
		getAllEtiquetes(),
		getArticlesForHomePage(),
	]);

	return json({ etiquetes, articles });
}

// Se que hay muchas cosas que podrían ir en su propio componente, pero me da pereza y no tengo tiempo. De todas formas no van a estar en ninguna de las otras paginas, asi que no es un problema.

export default function Index() {
	const { etiquetes, articles } = useLoaderData();

	// const groupedArticles = groupArticles(articles);
	// const { thisYear, otherYears, totalResultsThisYear, totalResultsOtherYears } = groupedArticles;
	// const quartersInOrder = ["1r trimestre", "2n trimestre", "3r trimestre"];

	// console.log(groupedArticles);

	// const [searchInputValue, setSearchInputValue] = useState("");

	// const [selectedTags, setSelectedTags] = useState([]);
	// const [tagInputValue, setTagInputValue] = useState("");

	// const filtersApplied = false;

	return (
		<div className="index">
			<div className="index-info">
				<p className="index-info-title">
					Benvinguts/des a <span className="color-accent">@lpeudelalletra</span>
				</p>
				<p className="index-info-text">
					La revista web de l’Institut Can Puig, amb les notícies més fresques,
					gestionat pels alumnes de Cultura Audiovisual de 1r de batxillerat.
				</p>
			</div>
			<div className="index-content">
				{/* Cut out bc I have no time */}
				{/*
				<div className="index-content-search">
					<div className="index-content-search-inputs">
						<input
							type="text"
							placeholder="Cerca per titol..."
							value={searchInputValue}
							onChange={(e) => setSearchInputValue(e.target.value)}

                            className="index-content-search-input"
						/>
						<input type="text" placeholder="Afegeix etiquetes..." className="index-content-search-input-tags" />
					</div>
					<IconButton>
						<IconSearch />
					</IconButton>
					<IconButton variant="not-filled">
						<IconNoFilter />
					</IconButton>
				</div>
                */}
				{/* Replaced with a simplified version because I have no time */}
				{/*
				<div className="index-content-articles">
					<div className="index-content-articles-title">
						<p className="title">Articles d'aquest any</p>
						<p className="resultats-n">
							{filtersApplied
								? `Mostrant ${totalResultsThisYear} resultats`
								: `Mostrant tots els resultats (${totalResultsThisYear})`}
						</p>
					</div>
					{quartersInOrder.map((quarterName) => {
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
					})}
				</div>
                */}
				<div className="index-content-articles">
					<div className="index-content-articles-title">
						<p className="title">Articles d'aquest any</p>
						<p className="resultats-n">
							Mostrant tots els resultats ({articles.length})
						</p>
					</div>
                    <div className="quarter-section">
                        <TextDivider text="1r trimestre" />

                        <div className="articles-grid">
                            {articles.map((article) => (
                                <Card key={article.id} article={article} />
                            ))}
                        </div>
                    </div>
				</div>
				{/* Also cut out */}
				{/*
				<div className="index-content-articles">
					<div className="index-content-articles-title">
						<p className="title">Articles d'altres anys</p>
						<p className="resultats-n">
							{filtersApplied
								? `Mostrant ${totalResultsOtherYears} resultats`
								: `Mostrant tots els resultats (${totalResultsOtherYears})`}
						</p>
					</div>
				</div>
                */}
			</div>
		</div>
	);
}
