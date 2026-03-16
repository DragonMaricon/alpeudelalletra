import { Link } from "@remix-run/react";

import { TextLogo } from "../../img/textLogo";
import { IconYt, IconIg, IconFb } from "../../img/icons/index";
import canpuigLogo from "../../img/canpuig.jpg";
import footerStylesheet from "../../styles/footer.css?url";

import pride from "../../img/blinkies/pride.gif";
import palestine from "../../img/blinkies/palestine.jpg";
import nyan from "../../img/blinkies/nyan.gif";
import glitter from "../../img/blinkies/glitter.gif";
import dragons from "../../img/blinkies/dragons.gif";

export function links() {
	return [{ rel: "stylesheet", href: footerStylesheet }];
}

export function Footer() {
	return (
		<div className="footer" role="contentinfo">
			<div className="footer-content">
				<img
					src={canpuigLogo}
					alt="Logo de l'IES Can Puig"
					className="footer-logo"
				/>
				<div className="footer-links">
					<div className="footer-links-column">
						<p>Altres pàgines</p>
						<div className="footer-links-stuff">
							<Link to="https://iescanpuig.com/">
								Pàgina web de l'IES Can Puig
							</Link>
							<Link to="/contacte">Pàgina de contacte</Link>
							<Link to="/admin">Pàgina d'administració</Link>
						</div>
					</div>
					<div className="footer-links-column">
						<p>Xarxes socials</p>
						<div className="footer-links-stuff">
							<a
								href="https://www.youtube.com/channel/UCBs4Uk_a2pTjUtvc5lPCdGw"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Visita el nostre canal de YouTube (s'obrirà una nova pestanya)"
							>
								<IconYt className="footer-icon" />
								Canal de YouTube
							</a>
							<a
								href="https://www.instagram.com/inscanpuig"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Visita la nostra pàgina de Instagram (s'obrirà una nova pestanya)"
							>
								<IconIg className="footer-icon" />
								Pàgina d'Instagram
							</a>
							<a
								href="https://www.facebook.com/iescanpuig/"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Visita la nostra pàgina de Facebook (s'obrirà una nova pestanya)"
							>
								<IconFb className="footer-icon" />
								Pàgina de Facebook
							</a>
						</div>
					</div>
				</div>
			</div>
			<div className="footer-credits">
				<Link to="/">
					<TextLogo className="footer-text-logo footer-link" />
				</Link>
				<div className="footer-credits-text">
					<p>
						Pàgina web desenvolupada i mantenida amb 💜 per Joel Marín Verdugo,
						estudiant de l'IES Can Puig.
					</p>
					<p>
						Articles escrits pels alumnes d'Audiovisuals a l'IES Can Puig, i
						revisats per David Puertas.
					</p>
					<p>
						Aquesta pàgina web és de codi obert! Visita el repositori a{" "}
						<a href="https://github.com/DragonMaricon/alpeudelalletra">
							GitHub
						</a>
						.
					</p>
				</div>
				<div className="footer-blinkies">
					<img src={glitter} alt="Imatge: Never Stop Sparkling!" />
					<img src={palestine} alt="Imatge: Bandera de Palestina" />
					<img src={nyan} alt="Imatge: Nyan Cat" />
					<img src={pride} alt="Imatge: Orgull LGTBIQ+" />
					<img src={dragons} alt="Imatge: I love dragons" />
				</div>
			</div>
		</div>
	);
}
