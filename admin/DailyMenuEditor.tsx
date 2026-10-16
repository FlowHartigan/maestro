import { useEffect, useRef, useState, type FormEvent } from 'react';

type Menu = { image: string; version: number; isDefault: boolean };
type Props = { csrf: string; request: (action: string, body?: FormData | object, csrf?: string) => Promise<{ menu: Menu }>; onDirty: (value: boolean) => void; onBusy: (value: boolean) => void };

export default function DailyMenuEditor({ csrf, request, onDirty, onBusy }: Props) {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  useEffect(() => {
    if (!file) { setPreview(menu ? '../' + menu.image : ''); return; }
    const url = URL.createObjectURL(file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file, menu]);
  function clear() { setFile(null); onDirty(false); if (input.current) input.current.value = ''; }
  async function load() {
    setBusy(true); onBusy(true); setError('');
    try { const result = await request('daily-menu'); setMenu(result.menu); clear(); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); onBusy(false); }
  }
  useEffect(() => { void load(); }, []);
  function choose(value?: File) {
    if (!value) return;
    setNotice('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(value.type) || value.size > 6 * 1024 * 1024) {
      setError('Choisissez une image JPG, PNG ou WebP de 6 Mo maximum.'); if (input.current) input.current.value = ''; return;
    }
    setFile(value); onDirty(true); setError('');
  }
  async function save(reset = false) {
    if (!menu || (!reset && !file)) return;
    setBusy(true); onBusy(true); setError(''); setNotice('');
    try {
      const body = new FormData(); body.set('version', String(menu.version));
      if (reset) body.set('reset', '1'); else if (file) body.set('photo', file);
      const result = await request('save-daily-menu', body, csrf);
      setMenu(result.menu); clear(); setNotice(reset ? 'Le menu d’origine est de nouveau publié sur La Casa.' : 'Le nouveau menu est publié sur La Casa di Maestro.');
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); onBusy(false); }
  }
  function submit(event: FormEvent) { event.preventDefault(); void save(); }
  return <section className="form-panel daily-menu-panel" aria-labelledby="daily-menu-heading">
    <div className="form-heading"><h1 id="daily-menu-heading">Menu du jour</h1><span>{file ? 'Non enregistré' : menu ? 'Publié' : 'Chargement…'}</span></div>
    <p>La Casa di Maestro · Beaumont. L’image publiée apparaît sous la photo d’accueil, pour tous les visiteurs.</p>
    {!menu && !error && <p role="status">Chargement du menu…</p>}
    {menu && <form onSubmit={submit}>
      <fieldset disabled={busy}>
        <label>Image du menu du jour<input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => choose(e.target.files?.[0])} /><small>JPG, PNG ou WebP · 6 Mo et 24 mégapixels maximum. Choisissez une image nette, avec des textes lisibles.</small></label>
        <figure className="daily-menu-preview">{preview && <img src={preview} alt={file ? 'Aperçu du nouveau menu à publier' : 'Menu du jour actuellement publié'} />}<figcaption>{file ? 'Aperçu avant publication' : 'Menu actuellement en ligne'}</figcaption></figure>
      </fieldset>
      <div className="form-actions">
        <button type="button" disabled={busy || menu.isDefault} onClick={() => { if (window.confirm('Remplacer le menu publié par le menu d’origine ? Les modifications en cours seront abandonnées.')) void save(true); }}>Menu d’origine</button>
        <button type="button" disabled={busy || !file} onClick={() => { if (window.confirm('Annuler le changement de photo ?')) { clear(); setError(''); setNotice('Modification annulée.'); } }}>Annuler</button>
        <button className="primary" disabled={busy || !file}>{busy ? 'Enregistrement…' : 'Publier le menu'}</button>
      </div>
    </form>}
    {error && <p ref={errorRef} tabIndex={-1} className="error" role="alert">{error} <button type="button" disabled={busy} onClick={() => { if (!file || window.confirm('Abandonner la photo sélectionnée et recharger le menu ?')) void load(); }}>Recharger</button></p>}
    {notice && <p role="status" className="success">{notice}</p>}
  </section>;
}
