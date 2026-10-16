import { renderToStaticMarkup } from 'react-dom/server';
import { Header, Footer, PizzaCard, DonScata, UniverseSwitch } from './components.jsx';
import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import Contact from './pages/Contact.jsx';
import Casa, { CasaHeader, CasaFooter } from './pages/Casa.jsx';
import { media } from './media.js';

const pages = {
  'index.html': [Home, 'Pizzas artisanales'],
  'menu.html': [Menu, 'Nos pizzas'],
  'contact.html': [Contact, 'Nos adresses et horaires'],
  'casa.html': [Casa, 'Restaurant italien à Beaumont'],
};

export function render(page, stylesheet, dynamic = false, casaStylesheet = '') {
  const [Page, title] = pages[page];
  const casa = page === 'casa.html';
  return '<!doctype html>' + renderToStaticMarkup(<html lang="fr">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content={casa ? '#f4eddd' : '#181818'} />
      <title>{title + (casa ? ' | La Casa di Maestro' : ' | Pizza Maestro')}</title>
      <meta name="description" content={casa ? 'La Casa di Maestro, restaurant italien au 1 rue Barbier d’Aubrée à Beaumont. Découvrez le menu du jour et réservez au 09 84 67 49 49.' : 'Pizza Maestro à Clermont-Ferrand et La Casa di Maestro, restaurant italien à Beaumont. La carte, les horaires et les adresses.'} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={casa ? 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,700&family=DM+Sans:wght@400;500;600&display=swap' : 'https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Fredericka+the+Great&family=Josefin+Sans:wght@400;600;700&display=swap'} rel="stylesheet" />
      <link rel="stylesheet" href={stylesheet} />
      {casa && <link rel="stylesheet" href={casaStylesheet} />}
      {casa && <link rel="preload" as="image" href={media('images/casa/hero-lasagnes.png')} fetchPriority="high" />}
      {page === 'index.html' && <link rel="preload" as="image" href={media('images/pizzeria/hero-fenati.png')} fetchPriority="high" />}
    </head>
    <body className={casa ? 'casa-theme' : undefined}>
      <a className="skip-link" href="#contenu">Aller au contenu</a>
      {casa ? <CasaHeader /> : <Header page={page} />}
      <UniverseSwitch casa={casa} />
      <main id="contenu"><Page dynamic={dynamic} /></main>
      {casa ? <CasaFooter /> : <Footer dynamic={dynamic} />}
    </body>
  </html>);
}

export function renderCardTemplate() {
  return renderToStaticMarkup(<PizzaCard pizza={{name:'__NAME__',ingredients:'__INGREDIENTS__',imageUrl:'__IMAGE__',prices:[0,0,0],formattedPrices:['__P26__','__P33__','__P40__']}} />);
}
export function renderFeatureTemplate() { return renderToStaticMarkup(<DonScata template />); }
