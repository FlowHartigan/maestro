import pizzas from '../pizzas.json';
import { PizzaGrid } from '../components.jsx';
import { Locations, DonScata } from '../components.jsx';

export default function Home({ dynamic = false }) {
  return <>

<section className="hero">
<div className="hero-copy">
<h1>À partager.<br />À savourer.</h1>
<p>Les pizzas artisanales de Maestro,<br />à Clermont-Ferrand et Chamalières.</p>
<a className="button outline" href="menu.html">Découvrez nos pizzas</a>
</div>
</section>
<section className="section intro container">
<h2>La passion de la pizza,<br />tout simplement.</h2>
<p className="lead">Une pâte croustillante, des recettes italiennes et des ingrédients choisis avec soin. Bienvenue chez Pizza Maestro.</p>
<div className="features">
<div>
<h3>Des produits choisis avec soin</h3>
<p>Moutarde de Charroux, Mozzarella di Bufala… Des ingrédients de qualité pour nos recettes traditionnelles et originales.</p>
</div>
<div>
<h3>Trois tailles, la même passion</h3>
<p>26, 33 ou 40 cm : à chacun sa pizza. Retrouvez les ingrédients et les trois tarifs de chaque recette sur notre carte.</p>
</div>
<div>
<h3>À emporter ou en livraison</h3>
<p>Appelez votre pizzeria ou retrouvez notre carte sur Deliveroo pour déguster votre recette préférée chez vous.</p>
</div>
</div>
</section>
<DonScata dynamic={dynamic} />
<section className="section selection">
<div className="container">
<h2>Un avant-goût de la carte</h2>
<p className="section-caption">Des classiques italiens aux recettes de Maestro.</p>
<PizzaGrid slot={dynamic ? "featured" : undefined} pizzas={[pizzas[0], pizzas[3], pizzas[8]]} />
<div className="center">
<a className="button" href="menu.html">Voir les {dynamic ? '__COUNT__' : 38} pizzas</a>
</div>
</div>
</section>
<section className="loyalty">
<div className="container">
<h2>Votre 12ème pizza est gratuite !</h2>
<p>Profitez de notre carte de fidélité lors de votre prochaine visite.</p>
</div>
</section>
<section className="section container">
<h2>Deux adresses pour vous régaler</h2>
<Locations />
</section>

  </>;
}
