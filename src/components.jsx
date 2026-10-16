import { media, variants } from './media.js';

const navigation = [['index.html', 'Accueil'], ['menu.html', 'Nos pizzas'], ['contact.html', 'Nos adresses']];
export function Header({ page }) {
  return <header className="site-header">
    <a className="brand" href="index.html" aria-label="Pizza Maestro, accueil"><img src={media('images/Logos/logo_main.png')} alt="Pizza Maestro" width="150" height="65" /></a>
    <nav aria-label="Navigation principale">{navigation.map(([href, text]) => <a key={href} href={href} aria-current={page === href ? 'page' : undefined}>{text}</a>)}</nav>
    <a className="button nav-order" href="contact.html">Commander</a>
  </header>;
}

const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
export function PizzaCard({ pizza }) {
  return <article className="pizza">
    <img src={pizza.imageUrl || media(pizza.image)} srcSet={pizza.imageUrl ? undefined : variants(pizza.image)} sizes="(max-width: 600px) calc(100vw - 36px), (max-width: 900px) 45vw, 370px" alt={`Pizza ${pizza.name}`} width="600" height="450" loading="lazy" decoding="async" />
    <div className="pizza-content"><h3>{pizza.name}</h3><p>{pizza.ingredients}</p>
      <dl className="prices">{pizza.prices.map((price, i) => <div key={i}><dt>Ø{[26, 33, 40][i]} cm</dt><dd>{pizza.formattedPrices?.[i] || currency.format(price)}</dd></div>)}</dl>
    </div>
  </article>;
}
export function PizzaGrid({ pizzas, slot }) {
  if (slot) return <div data-pizza-slot={slot} />;
  return <div className="pizza-grid">{pizzas.map(pizza => <PizzaCard key={pizza.name} pizza={pizza} />)}</div>;
}

export function Footer({ dynamic = false }) {
  return (
<footer>
<div className="container footer-grid">
<div>
<a className="brand" href="index.html">
<img src={media("images/Logos/logo_main.png")} alt="Pizza Maestro" width="150" height="65" />
</a>
<p>Pizzas artisanales à Clermont-Ferrand.<br /><a href="casa.html">La Casa di Maestro à Beaumont.</a></p>
<a href="https://www.facebook.com/PizzaMaestroClf/">Suivez-nous sur Facebook</a>
</div>
<div>
<h2>Horaires · Clermont-Ferrand</h2>
<Hours dynamic={dynamic} />
</div>
<div>
<h2>À votre écoute</h2>
<p>
<a href="mailto:pizza.maestro@yahoo.com">pizza.maestro@yahoo.com</a>
</p>
<a href="contact.html">Nos deux adresses</a>
</div>
</div>
<p className="copyright">Pizza Maestro · Clermont-Ferrand</p>
</footer>
  );
}

export function Locations() {
  return (
<div className="locations">
<article className="location">
<h3>Clermont-Ferrand</h3>
<p>36 avenue des Paulines</p>
<a className="phone" href="tel:+33473905338">04 73 90 53 38</a>
<div className="location-links">
<a href="https://goo.gl/maps/PD2ym8BsZbVtV4tH7">Itinéraire</a>
<a href="https://deliveroo.fr/fr/menu/clermont-ferrand/centre-ville/pizza-maestro">Commander sur Deliveroo</a>
</div>
</article>
<article className="location">
<h3>La Casa di Maestro</h3>
<p>Restaurant italien à Beaumont<br />1 rue Barbier d’Aubrée · 63110 Beaumont</p>
<a className="phone" href="tel:+33984674949">09 84 67 49 49</a>
<div className="location-links">
<a href="https://www.google.com/maps/search/?api=1&amp;query=1%20rue%20Barbier%20d%27Aubr%C3%A9e%2063110%20Beaumont">Itinéraire</a>
<a href="casa.html">Découvrir le restaurant</a>
</div>
</article>
</div>
  );
}

export function DonScata({ dynamic = false, template = false }) {
  if (dynamic) return <div data-pizza-slot="don" />;
  return (
<section className="don-scata-feature" aria-labelledby="don-scata-title">
<div className="container don-scata-layout">
<div className="don-scata-copy">
<h2 id="don-scata-title">{template ? '__NAME__' : 'Don Scata'}</h2>
<p className="don-scata-range">{template ? '__P26__ à __P40__' : '11,50 à 17,10\u00a0€'}</p>
<p className="don-scata-ingredients">{template ? '__INGREDIENTS__' : 'Mozzarella, champignons, rosette, chorizo fort, merguez et œuf.'}</p>
<dl className="don-scata-sizes">
<div><dt>26 cm</dt><dd>{template ? '__P26__' : '11,50\u00a0€'}</dd></div>
<div><dt>33 cm</dt><dd>{template ? '__P33__' : '13,70\u00a0€'}</dd></div>
<div><dt>40 cm</dt><dd>{template ? '__P40__' : '17,10\u00a0€'}</dd></div>
</dl>
<a className="button" href="contact.html">{template ? 'Commander __NAME__' : 'Commander la Don Scata'}</a>
</div>
<img className="don-scata-image" src={template ? '__IMAGE__' : media('images/pizzeria/don-scata-feature.png')} alt={template ? 'Pizza __NAME__' : 'La pizza Don Scata, garnie de mozzarella, champignons, charcuteries et d’un œuf au centre'} width="1280" height="1280" loading="lazy" />
</div>
</section>

  );
}

export function Hours({ dynamic = false, venue = 'pizza' }) {
  if (dynamic) return <div data-hours-slot={venue} />;
  if (venue === 'casa') return <dl className="hours"><div><dt>Lundi au jeudi</dt><dd>11h30 – 14h</dd></div><div><dt>Vendredi</dt><dd>11h30 – 14h<br />18h30 – 22h</dd></div><div><dt>Samedi et dimanche</dt><dd>Fermé</dd></div></dl>;
  return (<dl className="hours">
<div>
<dt>Lundi</dt>
<dd>Fermé</dd>
</div>
<div>
<dt>Mardi au vendredi</dt>
<dd>11h – 13h30<br />17h30 – 22h</dd>
</div>
<div>
<dt>Samedi et dimanche</dt>
<dd>17h30 – 22h</dd>
</div>
</dl>);
}

export function UniverseSwitch({ casa = false }) {
  return <nav className="universe-switch" aria-label="Choisir votre établissement"><span>Deux adresses, deux envies.</span><div><a href="index.html" aria-current={!casa ? 'page' : undefined}><strong>Pizza Maestro</strong><small>Clermont-Ferrand</small></a><a href="casa.html" aria-current={casa ? 'page' : undefined}><strong>La Casa di Maestro</strong><small>Restaurant italien · Beaumont</small></a></div></nav>;
}
