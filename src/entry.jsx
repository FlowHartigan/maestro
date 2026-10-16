import { renderToStaticMarkup } from 'react-dom/server';
import { Header, Footer, PizzaCard, DonScata } from './components.jsx';
import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import Contact from './pages/Contact.jsx';
import { media } from './media.js';

const pages = {
  'index.html': [Home, 'Pizzas artisanales'],
  'menu.html': [Menu, 'Nos pizzas'],
  'contact.html': [Contact, 'Nos adresses et horaires'],
};

export function render(page, stylesheet, dynamic = false) {
  const [Page, title] = pages[page];
  return '<!doctype html>' + renderToStaticMarkup(<html lang="fr">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#181818" />
      <title>{title + " | Pizza Maestro"}</title>
      <meta name="description" content="Découvrez les pizzas artisanales de Pizza Maestro à Clermont-Ferrand et Chamalières. La carte, les tarifs, les horaires et les adresses." />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Fredericka+the+Great&family=Josefin+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href={stylesheet} />
      {page === 'index.html' && <link rel="preload" as="image" href={media('images/pizzeria/hero-fenati.png')} fetchPriority="high" />}
    </head>
    <body>
      <a className="skip-link" href="#contenu">Aller au contenu</a>
      <Header page={page} />
      <main id="contenu"><Page dynamic={dynamic} /></main>
      <Footer dynamic={dynamic} />
    </body>
  </html>);
}

export function renderCardTemplate() {
  return renderToStaticMarkup(<PizzaCard pizza={{name:'__NAME__',ingredients:'__INGREDIENTS__',imageUrl:'__IMAGE__',prices:[0,0,0],formattedPrices:['__P26__','__P33__','__P40__']}} />);
}
export function renderFeatureTemplate() { return renderToStaticMarkup(<DonScata template />); }
