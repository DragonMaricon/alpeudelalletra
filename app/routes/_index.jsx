import indexStylesheet from "../styles/index.css?url";

export function links() {
	return [
		{
			rel: "stylesheet",
			href: indexStylesheet,
		},
	];
}

export default function Index() {
	return (
		<div className="index">
			<div className="index-info">
                <p className="index-info-title">Benvinguts/des a <span className="color-accent">@lpeudelalletra</span></p>
                <p className="index-info-text">La revista web de l’Institut Can Puig, amb les notícies més fresques dels alumnes de Cultura Audiovisual de 1r de batxillerat.</p>
            </div>
		</div>
	);
}
