import { useEffect, useRef, useState, type FormEvent } from 'react';

type Slot = [string, string];
type Hours = { days: Slot[][]; version: number };
type Props = {
  csrf: string;
  venue: 'pizza' | 'casa';
  request: (action: string, body?: FormData | object, csrf?: string) => Promise<{ hours: Hours; defaults: Slot[][] }>;
  onDirty: (dirty: boolean) => void;
  onBusy: (busy: boolean) => void;
};
const labels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function HoursEditor({ csrf, venue, request, onDirty, onBusy }: Props) {
  const [saved, setSaved] = useState<Hours | null>(null);
  const [days, setDays] = useState<Slot[][]>([]);
  const [defaults, setDefaults] = useState<Slot[][]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const errorRef = useRef<HTMLDivElement>(null);
  const dirty = saved !== null && JSON.stringify(saved.days) !== JSON.stringify(days);
  useEffect(() => { onDirty(dirty); }, [dirty, onDirty]);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  async function load() {
    setError(''); setBusy(true); onBusy(true);
    try {
      const result = await request(`hours&venue=${venue}`);
      setSaved(result.hours); setDays(result.hours.days); setDefaults(result.defaults); setNotice('');
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); onBusy(false); }
  }
  useEffect(() => { void load(); }, []);
  function change(index: number, slots: Slot[]) {
    setDays(current => current.map((day, i) => i === index ? slots : day)); setNotice(''); setError('');
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!saved) return;
    for (let i = 0; i < days.length; i++) {
      if (days[i].some(([start, end], j) => !start || !end || start >= end || (j > 0 && start < days[i][j - 1][1]))) {
        setError(`${labels[i]} : indiquez des créneaux complets, dans l’ordre, sans chevauchement, avec une fin après le début.`); return;
      }
    }
    setBusy(true); onBusy(true); setError(''); setNotice('');
    try {
      const result = await request('save-hours', { days, version: saved.version, venue }, csrf);
      setSaved(result.hours); setDays(result.hours.days); onDirty(false);
      setNotice('Horaires enregistrés. Les horaires de cet établissement sont à jour sur le site.');
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); onBusy(false); }
  }
  return <section className="form-panel hours-panel" aria-labelledby="hours-heading">
    <div className="form-heading"><h1 id="hours-heading">Vos horaires</h1><span>{dirty ? 'Non enregistré' : saved ? 'Enregistré' : 'Chargement…'}</span></div>
    <p>{venue === 'casa' ? 'La Casa di Maestro · Beaumont' : 'Pizza Maestro · Clermont-Ferrand'} — horaires affichés sur le site.</p>
    <p className="hours-help" id="hours-help">Jusqu’à deux créneaux par jour. Pour une ouverture en continu, gardez un seul créneau.</p>
    {error && <div ref={errorRef} tabIndex={-1} className="error" role="alert">{error} <button type="button" disabled={busy} onClick={() => { if (!dirty || window.confirm('Abandonner les modifications et recharger les horaires ?')) void load(); }}>Recharger</button></div>}
    {notice && <p role="status" className="success">{notice}</p>}
    {!saved && !error && <p role="status">Chargement des horaires…</p>}
    {saved && <form onSubmit={save} aria-describedby="hours-help">
      <fieldset disabled={busy}>
        {days.map((slots, i) => <fieldset className="hours-day" key={labels[i]}>
          <legend>{labels[i]}</legend>
          <div className="hours-day-content">
            <label className="closed-toggle"><input name={`closed-${i}`} type="checkbox" checked={slots.length === 0} onChange={e => change(i, e.target.checked ? [] : defaults[i].length ? defaults[i] : [['17:30', '22:00']])} />Fermé</label>
            <div className="hours-slots">{slots.map((slot, j) => <div className="hours-slot" key={j}>
              <label>Début {j + 1}<input name={`start-${i}-${j}`} autoComplete="off" aria-label={`${labels[i]} : début du créneau ${j + 1}`} type="time" step="60" required value={slot[0]} onChange={e => change(i, slots.map((s, k) => k === j ? [e.target.value, s[1]] : s))} /></label>
              <label>Fin {j + 1}<input name={`end-${i}-${j}`} autoComplete="off" aria-label={`${labels[i]} : fin du créneau ${j + 1}`} type="time" step="60" required value={slot[1]} onChange={e => change(i, slots.map((s, k) => k === j ? [s[0], e.target.value] : s))} /></label>
              {slots.length > 1 && <button type="button" aria-label={`${labels[i]} : retirer le créneau ${j + 1}`} onClick={() => change(i, slots.filter((_, k) => k !== j))}>Retirer</button>}
            </div>)}
            {slots.length === 1 && <button type="button" onClick={() => change(i, [...slots, ['', '']])}>Ajouter un créneau</button>}</div>
          </div>
        </fieldset>)}
      </fieldset>
      <div className="form-actions">
        <button type="button" disabled={busy} onClick={() => { if (window.confirm('Remettre les horaires d’origine dans le formulaire ? Enregistrez ensuite pour remplacer les horaires du site.')) { setDays(defaults); setNotice('Horaires d’origine rétablis dans le formulaire. Enregistrez pour les appliquer.'); setError(''); } }}>Horaires d’origine</button>
        <button type="button" disabled={busy || !dirty} onClick={() => { if (window.confirm('Annuler les modifications des horaires ?')) { setDays(saved.days); setError(''); setNotice('Modifications annulées.'); } }}>Annuler</button>
        <button className="primary" disabled={busy || !dirty}>{busy ? 'Enregistrement…' : 'Enregistrer les horaires'}</button>
      </div>
    </form>}
  </section>;
}
