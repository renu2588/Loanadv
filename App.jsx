import { useEffect, useMemo, useRef, useState } from 'react'
import { compute, inr } from './calc'
import { configured, onUser, signIn, signOutUser, load, save } from './firebase'
import seed from './seed.json'

const css = `*{box-sizing:border-box}:root{--bg:#f4f3fb;--card:#fff;--tx:#1f1b3a;--mut:#6b6788;--pri:#7c6fd6;--line:#eceaf6;--hd:#eeecfa;--act:#eef8ee;--bd:#d6d3ea}
[data-theme=dark]{--bg:#16142a;--card:#221f3d;--tx:#ecebf7;--mut:#a29fc4;--line:#322e55;--hd:#2c2950;--act:#1e3a2e;--bd:#4a4575}
body{margin:0;font:14px system-ui,sans-serif;background:var(--bg);color:var(--tx)}
header{display:flex;gap:12px;align-items:center;padding:12px 16px;background:var(--pri);color:#fff;flex-wrap:wrap}
header h1{font-size:18px;margin:0;flex:1}button{padding:7px 12px;border:0;border-radius:6px;background:var(--pri);color:#fff;cursor:pointer}
header button,button.alt{background:var(--hd);color:var(--tx)}main{max-width:1200px;margin:0 auto;padding:16px}
.tabs{display:flex;gap:8px;margin-bottom:12px}.tabs button.on{background:var(--pri);color:#fff}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}
.card{background:var(--card);border-radius:10px;padding:12px;box-shadow:0 1px 3px #0002}.card b{display:block;font-size:19px;margin-top:4px}
.card span{color:var(--mut);font-size:12px}.wrap{overflow:auto;background:var(--card);border-radius:10px;max-height:75vh}
table{border-collapse:collapse;width:100%;min-width:900px}th,td{padding:5px 8px;text-align:right;border-bottom:1px solid var(--line);white-space:nowrap}
th{position:sticky;top:0;background:var(--hd)}td:first-child,th:first-child{text-align:left}
input{width:90px;padding:4px;border:1px solid var(--bd);border-radius:4px;text-align:right;background:var(--card);color:var(--tx)}.pre{color:var(--mut)}.act{background:var(--act)}.ext{color:var(--mut)}
label{display:block;margin:8px 0 2px;color:var(--mut)}.set{background:var(--card);padding:16px;border-radius:10px;max-width:420px;margin-bottom:12px}.set input{width:100%;text-align:left}`

const sets = [['loanAmount', 'Sanctioned loan amount (₹)'], ['projectedRate', 'Current interest rate (e.g. 0.072)'], ['openingBalance', 'Opening balance at first EMI row (₹)'],
  ['origRate', 'Original rate'], ['origTenureYears', 'Original tenure (years)']]

function Chart({ out }) {
  const pts = out.filter((r) => !r.pre), max = Math.max(...pts.map((r) => r.AA), 1)
  const d = pts.map((r, i) => `${(i / Math.max(pts.length - 1, 1)) * 600},${150 - (r.AA / max) * 140}`).join(' ')
  return <svg viewBox="0 0 600 155" style={{ width: '100%', background: 'var(--card)', borderRadius: 10, marginTop: 12 }}><polyline fill="none" stroke="#7c6fd6" strokeWidth="2" points={d} /></svg>
}

function Login() {
  const [em, setEm] = useState(''), [pw, setPw] = useState(''), [err, setErr] = useState('')
  const go = () => signIn(em, pw).catch(() => setErr('Sign in failed. Check email and password.'))
  return <main><h2>Loan Tracker</h2><p>Sign in to continue.</p><div className="set"><label>Email</label><input value={em} onChange={(e) => setEm(e.target.value)} />
    <label>Password</label><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()} />
    <p><button onClick={go}>Sign In</button> <span style={{ color: 'crimson' }}>{err}</span></p></div></main>
}
export default function App() {
  const [user, setUser] = useState(undefined), [data, setData] = useState(null), [tab, setTab] = useState('dash'), [msg, setMsg] = useState(''), [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const ready = useRef(false)
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : ''; localStorage.setItem('theme', dark ? 'dark' : 'light') }, [dark])
  useEffect(() => onUser((u) => setUser(u || null)), [])
  useEffect(() => { if (!user) return; ready.current = false
    load(user.uid).then((d) => { setData(d || seed); ready.current = true }).catch((e) => setMsg(String(e))) }, [user])
