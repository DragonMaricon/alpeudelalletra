import { Link } from "@remix-run/react";

import cardStylesheet from "../../styles/card.css?url";
import { IconCalendar } from "../../img/icons";

import { Tag, links as tagLinks } from "./tag";

export function links() {
	return [
		{
			rel: "stylesheet",
			href: cardStylesheet,
		},
        ...tagLinks(),
	];
}

export function Card(props) {
	const formattedDate = new Date(props.article.data_publicacio).toLocaleDateString(
		"ca-ES",
		{
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		}
	);

	return (
		<Link to={`/articles/${props.article.slug}`} className="card">
			<img src={props.article.imatge_destacada_url} />
			<div className="card-info">
				<p className="card-info-title">{props.article.titol}</p>
				<div className="card-info-meta">
					<div className="card-info-meta-item">
						<IconCalendar className="card-info-meta-item-icon" />
						<span className="card-info-meta-item-text">{formattedDate}</span>
					</div>
				</div>
                <div className="card-info-tags">
                    {props.article.etiquetes.map((etiqueta) => {
                        return <Tag key={etiqueta.nom} name={etiqueta.nom} hue={etiqueta.color_hue} />;
                    })}
                </div>
				<p className="card-info-link">
					Continuar llegint →
				</p>
			</div>
		</Link>
	);
}
