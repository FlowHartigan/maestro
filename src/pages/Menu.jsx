import pizzas from '../pizzas.json';
import { PizzaGrid } from '../components.jsx';

export default function Menu({ dynamic = false }) {
  return <>

<section className="page-title">
<h1>Nos pizzas</h1>
<p>Artisanales, généreuses, à votre goût.</p>
</section>
<section className="section container">
<div className="menu-intro">
<h2>Chez nous, la taille ça compte.</h2>
<p>Chaque pizza existe en trois formats : 26, 33 et 40 cm.<br />Retrouvez votre recette et appelez votre pizzeria pour commander.</p>
<a className="button" href="contact.html">Choisir ma pizzeria</a>
</div>
<PizzaGrid slot={dynamic ? "all" : undefined} pizzas={pizzas} />
</section>

  </>;
}
