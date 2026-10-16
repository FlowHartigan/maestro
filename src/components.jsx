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

export function Footer() {
  return (
<footer>
<div className="container footer-grid">
<div>
<a className="brand" href="index.html">
<img src={media("images/Logos/logo_main.png")} alt="Pizza Maestro" width="150" height="65" />
</a>
<p>Pizzas artisanales à Clermont-Ferrand<br />et à Chamalières.</p>
<a href="https://www.facebook.com/PizzaMaestroClf/">Suivez-nous sur Facebook</a>
</div>
<div>
<h2>Horaires</h2>
<dl className="hours">
<div>
<dt>Lundi</dt>
<dd>Fermé</dd>
</div>
<div>
<dt>Mardi au vendredi</dt>
<dd>11h – 13h30<br />17h30 – 22h</dd>
</div>
<div>
<dt>Samedi, dimanche et jours fériés</dt>
<dd>17h30 – 22h</dd>
</div>
</dl>
</div>
<div>
<h2>À votre écoute</h2>
<p>
<a href="mailto:pizza.maestro@yahoo.com">pizza.maestro@yahoo.com</a>
</p>
<a href="contact.html">Nos deux adresses</a>
</div>
</div>
<p className="copyright">Pizza Maestro · Clermont-Ferrand &amp; Chamalières</p>
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
<h3>Chamalières</h3>
<p>68 avenue Joseph Claussat</p>
<a className="phone" href="tel:+33473373502">04 73 37 35 02</a>
<div className="location-links">
<a href="https://goo.gl/maps/GnQrDi7orxPQc2Y46">Itinéraire</a>
<a href="https://deliveroo.fr/fr/menu/clermont-ferrand/chamalieres/pizza-maestro-chamalieres">Commander sur Deliveroo</a>
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
