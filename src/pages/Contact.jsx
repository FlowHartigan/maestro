import { Locations, Hours } from '../components.jsx';

export default function Contact({ dynamic = false }) {
  return <>

<section className="page-title">
<h1>On vous attend !</h1>
<p>Une pizzeria à Clermont-Ferrand, un restaurant italien à Beaumont.</p>
</section>
<section className="section container">
<h2>Nos deux établissements</h2>
<Locations />
<div className="contact-bottom">
<section>
<h2>Pizza Maestro · Clermont-Ferrand</h2>
<Hours dynamic={dynamic} />
</section>
<section>
<h2>La Casa di Maestro · Beaumont</h2>
<Hours dynamic={dynamic} venue="casa" />
<a className="contact-casa-link" href="casa.html">Découvrir le restaurant et son menu du jour</a>
<h3>Une question ?</h3>
<p>Écrivez-nous ou appelez directement votre pizzeria.</p>
<a href="mailto:pizza.maestro@yahoo.com">pizza.maestro@yahoo.com</a>
<p>
<a href="https://www.facebook.com/PizzaMaestroClf/">Retrouvez-nous sur Facebook</a>
</p>
</section>
</div>
</section>

  </>;
}
