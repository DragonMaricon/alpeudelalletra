import {
	IconButton,
	links as iconButtonLinks,
} from "../components/ui/iconButton";
import { IconSearch, IconNoFilter } from "../img/icons";

import indexStylesheet from "../styles/index.css?url";

export function links() {
	return [
		{
			rel: "stylesheet",
			href: indexStylesheet,
		},
		...iconButtonLinks(),
	];
}

// Se que hay muchas cosas que podrían ir en su propio componente, pero me da pereza y no tengo tiempo. De todas formas no van a estar en ninguna de las otras paginas, asi que no es un problema.

export default function Index() {
	return (
		<div className="index">
			<div className="index-info">
				<p className="index-info-title">
					Benvinguts/des a <span className="color-accent">@lpeudelalletra</span>
				</p>
				<p className="index-info-text">
					La revista web de l’Institut Can Puig, amb les notícies més fresques
					dels alumnes de Cultura Audiovisual de 1r de batxillerat.
				</p>
			</div>
			<div className="index-content">
				<div className="index-content-search">
					<div className="index-content-search-inputs">
						<input type="text" placeholder="Cerca per titol" />
						<input type="text" placeholder="Cerca per autor" />
					</div>
					<IconButton>
                        <IconSearch />
                    </IconButton>
					<IconButton variant="not-filled">
                        <IconNoFilter />
                    </IconButton>
				</div>
			</div>
		</div>
	);
}
