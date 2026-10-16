import { media } from '../media.js';
import { Hours, UniverseSwitch } from '../components.jsx';

export const casaMap = 'https://www.google.com/maps/search/?api=1&query=1%20rue%20Barbier%20d%27Aubr%C3%A9e%2063110%20Beaumont';

export function CasaHeader() {
  return <header className="casa-header maestro-header">
    <a className="casa-wordmark" href="casa.html" aria-label="La Casa di Maestro, accueil"><span>La Casa</span><span>di Maestro</span></a>
    <UniverseSwitch casa /><nav className="header-links" aria-label="Navigation du restaurant"><a href="#menu-du-jour">Le menu du jour</a><a href="#venir">Nous trouver</a></nav>
    <a className="casa-button" href="tel:+33984674949">Réserver une table</a>
  </header>;
}

export default function Casa({ dynamic = false }) {
  return <>
    <section className="casa-hero">
      <img src={media('images/casa/hero-lasagnes.png')} width="1536" height="1024" alt="Une assiette de lasagnes à la bolognaise, gratinées et garnies de basilic" fetchPriority="high" />
      <div className="casa-hero-shade" />
      <div className="casa-hero-copy container">
        <p className="casa-place">Restaurant italien à Beaumont</p>
        <h1>La Casa<br />di Maestro</h1>
        <p className="casa-invitation">Un peu d’Italie.<br />Beaucoup de convivialité.</p>
        <a className="casa-button casa-button-light" href="#menu-du-jour">À table !</a>
      </div>
    </section>

    <section className="casa-menu-section container" id="menu-du-jour" aria-labelledby="menu-title">
      <div className="casa-menu-intro">
        <span className="casa-script">Buon appetito</span>
        <h2 id="menu-title">Le menu du jour</h2>
        <p>Lasagnes, focaccia, pizzas, tiramisu…<br />Retrouvez les saveurs de l’Italie autour d’une bonne table.</p>
      </div>
      <figure className="casa-menu-photo">
        <a href={media('images/casa/menu-du-jour.png')} target="_blank" rel="noreferrer" aria-label="Ouvrir la photo du menu du jour en grand (nouvel onglet)">
          <img src={media('images/casa/menu-du-jour.png')} width="1206" height="1596" alt="Menu du jour de La Casa di Maestro : les formules et les plats sont également disponibles en texte ci-dessous." loading="lazy" decoding="async" />
        </a>
        <figcaption>Cliquez sur le menu pour l’agrandir.</figcaption>
      </figure>
      <details className="casa-menu-text">
        <summary>Lire le menu en texte</summary>
        <div className="casa-formulas"><p>Entrée + plat ou plat + dessert <strong>15,50 €</strong></p><p>Menu complet <strong>19,00 €</strong></p><p>Plat unique <strong>14,00 €</strong></p></div>
        <div className="casa-menu-columns">
          <section><h3>Entrées</h3><ul><li>Terrine de sanglier maison</li><li>Assiette de charcuterie</li><li>Salade, toast taleggio, compotée de poivrons</li></ul></section>
          <section><h3>Plats</h3><ul><li>Pizza au choix</li><li>Lasagnes bolognaise</li><li>Salade César</li><li>Focaccia au romarin, burrata, pesto vert, coppa</li><li>Suprême de poulet, sauce échalote et moutarde à l’ancienne, légumes rôtis</li></ul></section>
          <section><h3>Desserts</h3><ul><li>Assiette de fromages</li><li>Tiramisu</li><li>Mousse au chocolat</li><li>Panna cotta</li></ul></section>
        </div>
      </details>
    </section>

    <section className="casa-visit" id="venir" aria-labelledby="visit-title">
      <div className="container casa-visit-grid">
        <div className="casa-address"><span className="casa-script">Ci vediamo presto</span><h2 id="visit-title">On se retrouve<br />à Beaumont.</h2><address>La Casa di Maestro<br />1 rue Barbier d’Aubrée<br />63110 Beaumont</address><a className="casa-phone" href="tel:+33984674949">09 84 67 49 49</a><div className="casa-visit-actions"><a className="casa-button" href="tel:+33984674949">Réserver par téléphone</a><a href={casaMap}>Préparer mon itinéraire</a></div></div>
        <div className="casa-opening"><h3>Les horaires du restaurant</h3><Hours dynamic={dynamic} venue="casa" /></div>
      </div>
    </section>
  </>;
}

export function CasaFooter() {
  return <footer className="casa-footer"><div className="container"><a className="casa-wordmark" href="casa.html"><span>La Casa</span><span>di Maestro</span></a><p>Restaurant italien · Beaumont</p><a href="index.html">Retrouver Pizza Maestro à Clermont-Ferrand</a></div></footer>;
}
