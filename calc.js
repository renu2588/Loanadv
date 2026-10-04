// Mirrors the "Use ACTUAL" sheet. Sheet row r = index + 2.
// Q opening = (first EMI row ? openingBalance : prev closing + prev disbursement)
// S cash parked = K; V = max(Q-S,0); R = V>0 ? Q : 0
// W EMI = prevQ<=0 ? 0 : G*I; X interest = actual, else V*rate/12
// AA closing = max(R - W + X - Z, 0); Y principal = W - X
const addMonth = (iso) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCMonth(d.getUTCMonth() + 1); return d.toISOString().slice(0, 10) }
export const pmt = (rate, n, pv) => (rate === 0 ? pv / n : (pv * rate) / (1 - Math.pow(1 + rate, -n)))
export const inr = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN')

export function compute(settings, rows) {
  const s = settings, out = []
  let prevQ = s.loanAmount, prevAA = s.loanAmount, prevF = 0, disbSoFar = 0
  const last = rows[rows.length - 1] || {}
  for (let i = 0; i < 700; i++) {
    const src = rows[i] || { date: addMonth(out[i - 1].date), disb: 0, emi: last.emi, mult: last.mult, extra: 0, cash: last.cash, interest: null, ext: true }
    const F = +src.disb || 0, K = +src.cash || 0, Z = +src.extra || 0, H = (+src.emi || 0) * (+src.mult || 1)
    disbSoFar += F
    let Q, V, R, W, X, AA
    if (i < s.firstEmiIndex) { // pre-EMI: interest-only, balance not amortising
      Q = s.loanAmount; V = Q - K; R = Q; W = H; X = +src.interest || 0; AA = s.loanAmount
    } else {
      Q = i === s.firstEmiIndex ? s.openingBalance : prevAA + prevF
      V = Math.max(Q - K, 0); R = V > 0 ? Q : 0
      W = prevQ <= 0 ? 0 : H
      X = src.interest != null && src.interest !== '' ? +src.interest : (V * s.projectedRate) / 12
      AA = Math.max(R - W + X - Z, 0)
    }
    const pre = i < s.firstEmiIndex
    out.push({ i, date: src.date, ext: !!src.ext, pre, actual: src.interest != null && src.interest !== '', Q: pre ? disbSoFar : Q, K, X, W, Y: W - X, Z, AA: pre ? disbSoFar : AA, active: pre || AA > 0 })
    prevQ = Q; prevAA = AA; prevF = F
    if (!pre && AA <= 0) break
  }
  const sum = (k) => out.reduce((a, r) => a + r[k], 0)
  const interest = sum('X'), principal = sum('Y') + sum('Z')
  const months = out.filter((r) => r.active).length
  const lastActive = [...out].reverse().find((r) => r.active)
  const lastActual = [...out].reverse().find((r) => r.actual && !r.pre)
  const n = s.origTenureYears * 12, origEmi = pmt(s.origRate / 12, n, s.loanAmount)
  return { out, interest, principal, total: interest + principal, months, years: Math.round(months / 12),
    closing: lastActive?.date, currentBalance: lastActual?.AA ?? 0, currentAsOf: lastActual?.date,
    origEmi, origInterest: origEmi * n - s.loanAmount }
}
