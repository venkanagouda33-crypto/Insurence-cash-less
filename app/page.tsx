'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

type Result = { id: number; hospital_id: number; hospital_name: string; address: string; city: string; state: string; pin_code: string; phone: string | null; insurer_name: string; status: string; source_url: string; last_verified_date: string };
type Insurer = { id: number; name: string };
type TrendData = { insurers: { name: string; listings: number }[]; cities: { city: string; listings: number }[]; recent: { id: number; hospital_name: string; city: string; insurer_name: string; last_verified_date: string }[] };
type SearchMode = 'hospital' | 'city' | 'pin';
const labels: Record<SearchMode, string> = { hospital: 'Hospital', city: 'City', pin: 'PIN code' };
const placeholders: Record<SearchMode, string> = { hospital: 'Type a hospital name', city: 'Enter a city', pin: 'Enter a 6-digit PIN code' };

export default function Home() {
  const [insurers, setInsurers] = useState<Insurer[]>([]);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [rows, setRows] = useState<Result[]>([]);
  const [query, setQuery] = useState('');
  const [insurer, setInsurer] = useState('');
  const [mode, setMode] = useState<SearchMode>('hospital');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (nextPage = 1, nextQuery = '', nextInsurer = '') => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ q: nextQuery, insurer: nextInsurer, page: String(nextPage), limit: '8' });
      const response = await fetch('/api/listings?' + params);
      if (!response.ok) throw new Error('We could not load listings. Please try again.');
      const data = await response.json();
      setRows(data.items);
      setTotal(data.total);
      setPage(nextPage);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch('/api/insurers').then(response => response.json()).then(setInsurers).catch(() => setInsurers([]));
    fetch('/api/trending').then(response => response.json()).then(setTrends).catch(() => setTrends({ insurers: [], cities: [], recent: [] }));
    void load(1, '', '');
  }, [load]);

  function search(event: FormEvent) {
    event.preventDefault();
    void load(1, query, insurer);
  }

  function pickInsurer(name: string) {
    setInsurer(name);
    void load(1, query, name);
  }

  return <main className="home-page">
    <section className="home-hero">
      <div className="home-hero-inner">
        <div className="hero-copy">
          <div className="home-kicker"><span className="kicker-dot" /> A clearer way to check your options</div>
          <h1>Find a hospital.<br/><em>Know what to confirm.</em></h1>
          <p>Search insurer network listings, see where the information came from, and check when it was last verified.</p>
          <div className="hero-points"><span><b>01</b> Search a directory</span><span><b>02</b> Review the source</span><span><b>03</b> Confirm with the provider</span></div>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-cross">+</div><div className="art-card"><div className="art-card-top"><span className="art-mark">N</span><span className="art-lines"><i/><i/></span><span className="art-check">✓</span></div><div className="art-line long"/><div className="art-line"/><div className="art-bottom"><span>DIRECTORY LISTING</span><span className="art-status">● CHECK SOURCE</span></div></div><div className="art-orb orb-a"/><div className="art-orb orb-b"/></div>
      </div>
      <form className="home-search" onSubmit={search}>
        <div className="search-input-wrap"><label htmlFor="home-query">Search by {labels[mode].toLowerCase()}</label><input id="home-query" value={query} onChange={event => setQuery(event.target.value)} placeholder={placeholders[mode]} aria-label={`Search by ${labels[mode].toLowerCase()}`} /></div>
        <div className="search-insurer-wrap"><label htmlFor="home-insurer">Choose insurer</label><select id="home-insurer" value={insurer} onChange={event => setInsurer(event.target.value)}><option value="">All insurers</option>{insurers.map(option => <option key={option.id} value={option.name}>{option.name}</option>)}</select></div>
        <button type="submit" className="home-search-button" disabled={loading}>{loading ? 'Searching…' : 'Search listings'} <span aria-hidden="true">↗</span></button>
      </form>
    </section>

    <div className="home-content">
      <div className="trust-strip"><div className="trust-icon">⌕</div><div><b>Use the details to ask the right questions.</b><span>A network listing does not guarantee approval of a specific claim. Confirm current cashless availability with both the insurer and hospital.</span></div></div>

      <section className="discovery-section" aria-labelledby="discover-title"><div className="section-heading"><div><div className="eyebrow">Start anywhere</div><h2 id="discover-title">Popular ways to search</h2><p>Choose the detail you already know. We’ll help narrow down the directory.</p></div></div>
        <div className="discovery-grid">
          <button className={`discovery-card ${mode === 'hospital' ? 'selected' : ''}`} onClick={() => { setMode('hospital'); document.getElementById('home-query')?.focus(); }}><span className="discovery-icon hospital-icon">H</span><span className="discovery-title">I know the hospital</span><span className="discovery-description">Search by hospital name and review its insurer listings.</span><span className="discovery-action">Search hospital <b>→</b></span></button>
          <button className={`discovery-card ${mode === 'city' ? 'selected' : ''}`} onClick={() => { setMode('city'); document.getElementById('home-query')?.focus(); }}><span className="discovery-icon city-icon">⌖</span><span className="discovery-title">I’m choosing an area</span><span className="discovery-description">Look up hospitals by city or neighborhood name.</span><span className="discovery-action">Search a city <b>→</b></span></button>
          <button className={`discovery-card ${mode === 'pin' ? 'selected' : ''}`} onClick={() => { setMode('pin'); document.getElementById('home-query')?.focus(); }}><span className="discovery-icon pin-icon">#</span><span className="discovery-title">I have a PIN code</span><span className="discovery-description">Use a location PIN code to find nearby directory records.</span><span className="discovery-action">Search by PIN <b>→</b></span></button>
        </div>
        {insurers.length > 0 && <div className="insurer-picks"><span>Or browse an insurer</span><div>{insurers.slice(0, 5).map(option => <button key={option.id} className={insurer === option.name ? 'picked' : ''} onClick={() => pickInsurer(option.name)}>{option.name}<span>↗</span></button>)}</div></div>}
      </section>

      <section className="trend-section" aria-labelledby="trend-title"><div className="trend-heading"><div><div className="trend-kicker"><span className="trend-live-dot"/> DIRECTORY PULSE</div><h2 id="trend-title">Trending in the directory</h2><p>Explore active listings, popular locations, and recently verified entries.</p></div><span className="trend-basis">BASED ON DIRECTORY RECORDS</span></div>
        {!trends || (!trends.insurers.length && !trends.cities.length && !trends.recent.length) ? <div className="trend-empty">Trend cards will appear as active listings are added to the directory.</div> : <div className="trend-grid">
          <article className="trend-card trend-feature"><div className="trend-card-label"><span>01</span> MOST LISTINGS</div><h3>Insurers in this directory</h3><p>Active hospital-insurer listings currently recorded.</p>{trends.insurers.length ? trends.insurers.slice(0, 3).map((item, index) => <button className="trend-row" key={item.name} onClick={() => pickInsurer(item.name)}><span className="trend-rank">0{index + 1}</span><b>{item.name}</b><span className="trend-count">{item.listings} <small>listings</small></span></button>) : <span className="trend-no-data">No active insurer listings yet</span>}</article>
          <article className="trend-card"><div className="trend-card-label"><span>02</span> ACTIVE LOCATIONS</div><h3>Where to look</h3><p>Cities with the most active directory entries.</p>{trends.cities.length ? trends.cities.slice(0, 3).map((item, index) => <button className="trend-row" key={item.city} onClick={() => { setMode('city'); setQuery(item.city); void load(1, item.city, insurer); }}><span className="city-rank">⌖</span><b>{item.city}</b><span className="trend-count">{item.listings} <small>listings</small></span></button>) : <span className="trend-no-data">City highlights will show here</span>}</article>
          <article className="trend-card trend-recent"><div className="trend-card-label"><span>03</span> RECENTLY VERIFIED</div><h3>Freshly checked</h3><p>Latest verification dates in active records.</p>{trends.recent.length ? trends.recent.slice(0, 3).map(item => <Link className="recent-trend" key={item.id} href={`/hospitals/${item.id}`}><span className="recent-mark">✓</span><span><b>{item.hospital_name}</b><small>{item.city} · {item.insurer_name}</small></span><time>{item.last_verified_date}</time></Link>) : <span className="trend-no-data">Verified entries will appear here</span>}</article>
        </div>}
        <p className="trend-disclaimer">These highlights count active records in this directory; they do not represent customer search trends, insurer-wide network size, or a claim approval guarantee.</p>
      </section>

      <section className="results-section" aria-labelledby="results-title"><div className="results-heading"><div><div className="eyebrow">Directory</div><h2 id="results-title">Hospital listings</h2><p>{loading ? 'Finding matching listings…' : `${total} listing${total === 1 ? '' : 's'} ${query || insurer ? 'match your search' : 'available'}`}</p></div><span className="results-label">SOURCE-LINKED RECORDS</span></div>
        {error ? <div className="error" role="alert">{error} <button className="secondary" onClick={() => void load(page, query, insurer)}>Try again</button></div> : loading ? <div className="loading" role="status">Loading hospital listings…</div> : rows.length === 0 ? <div className="empty home-empty"><div className="empty-symbol">⌕</div><b>No matching listings yet</b><span>Try another hospital, city, PIN code, or insurer. Directory records will appear here once available.</span></div> : <div className="home-results">{rows.map(row => <Link className="home-result-card" key={row.id} href={`/hospitals/${row.id}`}><div className="result-symbol">+</div><div className="home-result-main"><h3>{row.hospital_name}</h3><p>{row.address}, {row.city}, {row.state} {row.pin_code}</p><div className="result-meta"><span>{row.insurer_name}</span><span>Verified {row.last_verified_date}</span></div></div><span className={`badge ${row.status}`}>{row.status.replace('_', ' ')}</span><span className="result-arrow" aria-hidden="true">↗</span></Link>)}</div>}
        {!loading && rows.length > 0 && <div className="pagination"><button className="secondary" disabled={page <= 1} onClick={() => void load(page - 1, query, insurer)}>Previous</button><span>Page {page} of {Math.max(1, Math.ceil(total / 8))}</span><button className="secondary" disabled={page >= Math.ceil(total / 8)} onClick={() => void load(page + 1, query, insurer)}>Next</button></div>}
      </section>

      <section className="home-bottom"><div><div className="eyebrow">Help keep it useful</div><h2>See something that needs an update?</h2><p>Report outdated or incorrect directory details from a hospital’s listing page. Please don’t share policy numbers or medical information.</p></div><div className="bottom-badge"><span>↗</span><b>Source</b><small>See where a record came from</small><span>◷</span><b>Verified</b><small>Check its last-reviewed date</small></div></section>
    </div>
  </main>;
}
