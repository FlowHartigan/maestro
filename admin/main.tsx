import React, { useEffect, useRef, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

type Pizza = { id: number; name: string; ingredients: string; price26: string; price33: string; price40: string; image: string; published: number; version: number };
type Session = { user: { username: string } | null; csrf: string; setupRequired?: boolean };
const blank: Pizza = { id: 0, name: '', ingredients: '', price26: '', price33: '', price40: '', image: '', published: 0, version: 0 };
const apiURL = '../api/index.php';

async function request(action: string, body?: FormData | object, csrf?: string) {
  const form = body instanceof FormData;
  const response = await fetch(`${apiURL}?action=${action}`, {
    credentials: 'same-origin',
    method: body ? 'POST' : 'GET',
    headers: body ? { 'X-CSRF-Token': csrf || '', ...(!form ? { 'Content-Type': 'application/json' } : {}) } : {},
    body: body ? (form ? body : JSON.stringify(body)) : undefined,
  });
  const data = await response.json().catch(() => ({ error: 'Réponse serveur inattendue. Réessayez.' }));
  if (!response.ok) throw new Error(data.error || 'La demande a échoué.');
  return data;
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [items, setItems] = useState<Pizza[]>([]);
  const [selected, setSelected] = useState<Pizza | null>(null);
  const [dirty, setDirty] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginBusy, setLoginBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true); setError('');
    try { const result = await request('pizzas'); setItems(result.pizzas); }
    catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    request('session').then(setSession).catch(e => setError(e.message));
  }, []);
  useEffect(() => { if (session?.user) void load(); }, [session?.user?.username]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  function choose(pizza: Pizza) {
    if (saving) return;
    if (dirty && !window.confirm('Abandonner les modifications non enregistrées ?')) return;
    setSelected({ ...pizza }); setDirty(false); setNotice('');
  }
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoginBusy(true); setError('');
    try {
      const data = Object.fromEntries(new FormData(event.currentTarget));
      setSession(await request(session?.setupRequired ? 'setup' : 'login', data, session?.csrf));
    } catch (e) { setError((e as Error).message); }
    finally { setLoginBusy(false); }
  }
  async function logout() {
    if (saving) return;
    if (dirty && !window.confirm('Abandonner les modifications et se déconnecter ?')) return;
    setError('');
    try {
      await request('logout', {}, session?.csrf);
      setSelected(null); setDirty(false); setItems([]);
      setSession(await request('session'));
    } catch (e) { setError((e as Error).message); }
  }

  if (!session) return <main className="login"><h1>Maestro</h1>{error ? <><p role="alert">{error}</p><button onClick={() => location.reload()}>Réessayer</button></> : <p role="status">Chargement…</p>}</main>;
  if (!session.user) return <main className="login">
    <a className="back" href="../">← Retour au site</a>
    <div className="login-panel"><p className="brand">Maestro</p><h1>{session.setupRequired ? 'Votre espace commence ici' : 'Administration'}</h1>
      <p>{session.setupRequired ? 'Activez le premier compte avec le code privé fourni à la livraison.' : 'Connectez-vous pour gérer votre carte.'}</p>
      <form onSubmit={login}>
        {session.setupRequired && <label>Code d’activation<input name="token" required autoComplete="off" spellCheck={false} /></label>}
        <label>Identifiant<input name="username" required autoComplete="username" minLength={session.setupRequired ? 3 : undefined} maxLength={50} spellCheck={false} /></label>
        <label>Mot de passe<input name="password" type="password" required minLength={session.setupRequired ? 12 : undefined} maxLength={72} autoComplete={session.setupRequired ? 'new-password' : 'current-password'} /></label>
        {session.setupRequired && <small>12 caractères minimum. Conservez votre mot de passe dans votre gestionnaire habituel.</small>}
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary" disabled={loginBusy}>{loginBusy ? 'Connexion…' : session.setupRequired ? 'Créer mon compte' : 'Se connecter'}</button>
      </form>
    </div>
  </main>;

  const filtered = items.filter(p => `${p.name} ${p.ingredients}`.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr')));
  return <>
    <header className="topbar"><a className="brand" href="../">Maestro</a><span>Administration</span><div className="top-actions"><a href="../menu.html" target="_blank" rel="noreferrer">Voir la carte ↗</a><button onClick={logout}>Se déconnecter</button></div></header>
    <main className="workspace">
      <div className="page-heading"><div><h1>Vos pizzas</h1><p>{items.length} recettes · {items.filter(p => Number(p.published) === 1).length} sur la carte</p></div><button className="primary" onClick={() => choose(blank)}>+ Ajouter une pizza</button></div>
      {error && <p role="alert" className="error">{error} <button onClick={load}>Réessayer</button></p>}
      {notice && <p role="status" className="success">{notice}</p>}
      <div className="editor-layout">
        <section className="list-panel" aria-label="Liste des pizzas"><label className="search">Rechercher une pizza<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Nom ou ingrédient" /></label>
          {loading && <p role="status">Chargement des pizzas…</p>}
          {!loading && !filtered.length && <p className="empty">{items.length ? 'Aucune pizza ne correspond à cette recherche.' : 'Ajoutez votre première pizza.'}</p>}
          <ul className="pizza-list">{filtered.map(p => <li key={p.id}><button className={Number(selected?.id) === Number(p.id) ? 'selected' : ''} aria-pressed={Number(selected?.id) === Number(p.id)} onClick={() => choose(p)}><img src={'../' + p.image} alt="" width="64" height="64" loading="lazy" /><span><strong>{p.name}</strong><small>{Number(p.published) ? 'Publiée' : 'Brouillon'} · dès {Number(p.price26).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</small></span><span aria-hidden="true">›</span></button></li>)}</ul>
        </section>
        {selected ? <Editor key={`${selected.id}-${selected.version}`} pizza={selected} csrf={session.csrf} onBusy={setSaving} onDeleted={id => { setItems(prev => prev.filter(p => Number(p.id) !== id)); setSelected(null); setDirty(false); setNotice("Pizza supprimée. Elle a été retirée de la carte du site."); }} onDirty={setDirty} onSaved={p => { setItems(prev => prev.some(i => Number(i.id) === Number(p.id)) ? prev.map(i => Number(i.id) === Number(p.id) ? p : i) : [...prev, p]); setSelected(p); setDirty(false); setNotice(Number(p.published) ? 'Pizza enregistrée. La carte du site est à jour.' : 'Brouillon enregistré. Cette pizza reste masquée sur le site.'); }} onCancel={() => { if (!dirty || window.confirm('Annuler les modifications de cette fiche ?')) { setSelected(null); setDirty(false); } }} /> : <section className="empty-editor"><span aria-hidden="true">✦</span><h2>Composez votre carte</h2><p>Choisissez une pizza pour la modifier ou ajoutez une nouvelle recette.</p><button onClick={() => choose(blank)}>Ajouter une pizza</button></section>}
      </div>
    </main>
  </>;
}

function Editor({ pizza, csrf, onBusy, onDirty, onSaved, onDeleted, onCancel }: { pizza: Pizza; csrf: string; onDeleted: (id: number) => void; onBusy: (busy: boolean) => void; onDirty: (dirty: boolean) => void; onSaved: (pizza: Pizza) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(pizza);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(pizza.image ? '../' + pizza.image : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [modified, setModified] = useState(!pizza.id);
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  function change(field: keyof Pizza, value: string | number) { setDraft(p => ({ ...p, [field]: value })); setModified(true); onDirty(true); }
  function photo(value?: File) {
    if (!value) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(value.type) || value.size > 6 * 1024 * 1024) { setError('Choisissez une photo JPG, PNG ou WebP de moins de 6 Mo.'); if (fileInput.current) fileInput.current.value = ''; return; }
    setFile(value); setError(''); setModified(true); onDirty(true);
  }
  async function remove() {
    if (!window.confirm(`Supprimer définitivement la pizza « ${pizza.name} » ? Elle sera retirée du site. Cette action est irréversible.`)) return;
    setBusy(true); onBusy(true); setError('');
    try {
      await request('delete', { id: pizza.id, version: pizza.version }, csrf);
      onDeleted(Number(pizza.id));
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); onBusy(false); }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); onBusy(true); setError('');
    try {
      const body = new FormData();
      for (const [key, value] of Object.entries(draft)) body.set(key, String(value));
      if (file) body.set('photo', file);
      const result = await request('save', body, csrf);
      onSaved(result.pizza);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); onBusy(false); }
  }
  return <section className="form-panel"><form onSubmit={save}>
    <div className="form-heading"><h2>{pizza.id ? 'Modifier la pizza' : 'Nouvelle pizza'}</h2><span>{modified ? 'Non enregistré' : 'Enregistré'}</span></div>
    <fieldset disabled={busy}>
      <label>Nom de la pizza<input value={draft.name} onChange={e => change('name', e.target.value)} required maxLength={100} autoComplete="off" /></label>
      <label>Ingrédients<textarea value={draft.ingredients} onChange={e => change('ingredients', e.target.value)} required maxLength={1000} rows={4} placeholder="Mozzarella, tomates, basilic…" /></label>
      <div className="prices"><label>26 cm · €<input type="number" inputMode="decimal" min="0.01" max="999" step="0.01" required value={draft.price26} onChange={e => change('price26', e.target.value)} /></label><label>33 cm · €<input type="number" inputMode="decimal" min="0.01" max="999" step="0.01" required value={draft.price33} onChange={e => change('price33', e.target.value)} /></label><label>40 cm · €<input type="number" inputMode="decimal" min="0.01" max="999" step="0.01" required value={draft.price40} onChange={e => change('price40', e.target.value)} /></label></div>
      <div className="photo-field"><div className="photo-preview">{preview ? <img src={preview} alt="Aperçu de la pizza" /> : <span>Votre photo apparaîtra ici</span>}</div><label>Photo de la pizza<input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" required={!pizza.image} onChange={e => photo(e.target.files?.[0])} /><small>JPG, PNG ou WebP · 6 Mo maximum. La photo sera optimisée automatiquement.</small></label></div>
      <label className="toggle"><input type="checkbox" checked={Number(draft.published) === 1} onChange={e => change('published', e.target.checked ? 1 : 0)} /><span><strong>Afficher sur la carte</strong><small>Décochez pour conserver cette pizza en brouillon.</small></span></label>
    </fieldset>
    {error && <p className="error" role="alert">{error}</p>}
    <div className="form-actions">{pizza.id > 0 && <button className="danger" type="button" disabled={busy} onClick={remove}>Supprimer la pizza</button>}<button type="button" disabled={busy} onClick={onCancel}>Annuler</button><button className="primary" disabled={busy || !modified}>{busy ? 'Enregistrement…' : 'Enregistrer la pizza'}</button></div>
  </form></section>;
}

createRoot(document.getElementById('root')!).render(<App />);
