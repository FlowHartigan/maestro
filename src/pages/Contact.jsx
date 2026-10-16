import { Locations } from '../components.jsx';

export default function Contact() {
  return <>

<section className="page-title">
<h1>On vous attend !</h1>
<p>Deux adresses, la même passion.</p>
</section>
<section className="section container">
<h2>Votre pizzeria Maestro</h2>
<Locations />
<div className="contact-bottom">
<section>
<h2>À quelle heure ?</h2>
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
</section>
<section>
<h2>Une question ?</h2>
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
