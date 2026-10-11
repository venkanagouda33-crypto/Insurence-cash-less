'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

type Listing = { id: number; hospital_name: string; address: string; city: string; state: string; pin_code: string; phone: string | null; insurer_name: string; status: string; source_url: string; last_verified_date: string };
type Report = { id: number; listing_id: number; reporter_name: string; reporter_email: string; issue: string; details: string; status: string; created_at: string; hospital_name: string; insurer_name: string };
type Activity = { event_type: string; total: number };
type Data = { listings: Listing[]; reports: Report[]; activity: Activity[] };
type ListingForm = { hospitalName: string; address: string; city: string; state: string; pinCode: string; phone: string; insurerName: string; sourceUrl: string; verified: string; status: 'active' | 'inactive' | 'pending_review' };

const emptyForm = (): ListingForm => ({ hospitalName: '', address: '', city: '', state: '', pinCode: '', phone: '', insurerName: '', sourceUrl: '', verified: new Date().toISOString().slice(0, 10), status: 'pending_review' });
const activityLabels: Record<string, string> = { search: 'Hospital searches', listing_view: 'Listing details viewed', correction_report: 'Correction reports submitted' };

export default function Admin() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState<ListingForm>(emptyForm);
  const [editId, setEditId] = useState<number>();

  const load = useCallback(async () => {
    const response = await fetch('/api/admin');
    const body = await response.json();
    if (!response.ok) { setData(null); setError(body.error || 'Could not load admin workspace.'); return; }
    setData(body);
    setError('');
  }, []);

  useEffect(() => {
    fetch('/api/admin/auth').then(response => response.json()).then(session => { if (session.authenticated) void load(); }).catch(() => setError('Unable to check admin session.'));
  }, [load]);

  async function login(event: FormEvent) {
    event.preventDefault();
    setError('');
    const response = await fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: adminId, password }) });
    const body = await response.json();
    if (!response.ok) { setError(body.error || 'Sign in failed.'); return; }
    setPassword('');
    await load();
  }

  async function logout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setData(null);
    setAdminId('');
    setError('');
  }

  function edit(listing: Listing) {
    setEditId(listing.id);
    setForm({ hospitalName: listing.hospital_name, address: listing.address, city: listing.city, state: listing.state, pinCode: listing.pin_code, phone: listing.phone || '', insurerName: listing.insurer_name, sourceUrl: listing.source_url, verified: listing.last_verified_date, status: listing.status as ListingForm['status'] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setNotice('');
    const response = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'save', id: editId, data: form }) });
    const body = await response.json();
    if (!response.ok) { setNotice(body.error || 'Could not save listing.'); return; }
    setNotice('Listing saved.');
    setEditId(undefined);
    setForm(emptyForm());
    await load();
  }

  async function review(id: number, status: string) {
    const response = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'report', id, status }) });
    if (!response.ok) { setError('Could not update correction report.'); return; }
    await load();
  }

  const activityCount = (type: string) => data?.activity.find(item => item.event_type === type)?.total ?? 0;

  return <main className="admin-page">
    <div className="admin-brandbar"><a href="/" className="admin-brand">NetworkCheck <span>CONTROL</span></a><a href="/">← Return to public directory</a></div>
    <div className="admin-content">
      <div className="admin-heading"><div><div className="eyebrow">Directory operations</div><h1>Admin workspace</h1><p className="small">Manage hospital network listings and review anonymous site activity.</p></div>{data && <span className="secure-tag">Local admin session</span>}</div>

      {!data && <form className="panel admin-login" onSubmit={login}>
        <h2 className="section-title">Administrator sign in</h2>
        <p className="small">Use the admin ID and password configured for this local installation.</p>
        <div className="form-grid"><div><label htmlFor="admin-id">Admin ID</label><input id="admin-id" autoComplete="username" required value={adminId} onChange={event => setAdminId(event.target.value)} /></div><div><label htmlFor="admin-password">Password</label><input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} /></div></div>
        <button style={{ marginTop: 16 }}>Sign in</button>{error && <p className="error" role="alert">{error}</p>}
      </form>}

      {data && <>
        <section className="panel activity-panel"><div className="activity-heading"><div><h2 className="section-title">Website activity</h2><p className="small">Anonymous totals for the last 7 days. No visitor identities, IP addresses, or search terms are stored.</p></div><span className="activity-period">LAST 7 DAYS</span></div><div className="activity-cards">{Object.entries(activityLabels).map(([type, label]) => <div className="activity-card" key={type}><span>{label}</span><strong>{activityCount(type)}</strong></div>)}</div></section>

        <section className="panel"><h2 className="section-title">{editId ? 'Edit hospital listing' : 'Add hospital listing'}</h2><p className="small">A listing connects one hospital with one insurer.</p>
          <form className="form-grid" onSubmit={save}>{([['hospitalName', 'Hospital name'], ['address', 'Street address'], ['city', 'City'], ['state', 'State'], ['pinCode', 'PIN code'], ['phone', 'Phone'], ['insurerName', 'Insurer'], ['sourceUrl', 'Source URL'], ['verified', 'Last verified date']] as const).map(([key, label]) => <div key={key}><label htmlFor={key}>{label}</label><input id={key} required={key !== 'phone'} type={key === 'verified' ? 'date' : 'text'} value={form[key]} onChange={event => setForm({ ...form, [key]: event.target.value })} /></div>)}
            <div><label htmlFor="status">Status</label><select id="status" value={form.status} onChange={event => setForm({ ...form, status: event.target.value as ListingForm['status'] })}><option value="active">Active</option><option value="inactive">Inactive</option><option value="pending_review">Pending review</option></select></div>
            <div className="full"><button>{editId ? 'Save changes' : 'Add listing'}</button> {editId && <button type="button" className="secondary" onClick={() => { setEditId(undefined); setForm(emptyForm()); }}>Cancel</button>}{notice && <div className="statusline" role="status">{notice}</div>}</div>
          </form>
        </section>

        <section className="panel"><h2 className="section-title">Hospital-insurer listings ({data.listings.length})</h2><div className="admin-list"><div className="admin-row header"><span>Hospital</span><span>Insurer</span><span>Status</span><span>Verified</span><span>Action</span></div>{data.listings.map(listing => <div className="admin-row" key={listing.id}><span>{listing.hospital_name}<br/><small>{listing.city}</small></span><span>{listing.insurer_name}</span><span>{listing.status.replace('_', ' ')}</span><span>{listing.last_verified_date}</span><span><button className="secondary" onClick={() => edit(listing)}>Edit</button></span></div>)}</div></section>

        <section className="panel"><h2 className="section-title">Correction reports ({data.reports.length})</h2>{data.reports.length === 0 ? <p className="small">No reports yet.</p> : data.reports.map(report => <div className="report-row" key={report.id}><b>{report.hospital_name} · {report.insurer_name}</b> — {report.issue.replace('_', ' ')} · {report.status}<p>{report.details}</p><small>{report.reporter_name || 'Anonymous'} {report.reporter_email && `· ${report.reporter_email}`} · {report.created_at}</small><div className="report-actions">{['reviewed', 'resolved', 'dismissed'].map(status => <button className="secondary" key={status} onClick={() => review(report.id, status)}>{status}</button>)}</div></div>)}</section>
        {error && <p className="error" role="alert">{error}</p>}<button className="secondary" onClick={logout}>Sign out</button>
      </>}
    </div>
  </main>;
}
