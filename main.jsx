import React from 'react'
import { createRoot } from 'react-dom/client'

const show = (m) => { const r = document.getElementById('root'); if (r) r.innerHTML = '<pre style="padding:16px;white-space:pre-wrap;color:crimson;font-family:monospace">App error: ' + String(m).replace(/</g, '&lt;').slice(0, 700) + '</pre>' }
window.addEventListener('error', (e) => show(e.message))
window.addEventListener('unhandledrejection', (e) => show(e.reason))

class EB extends React.Component {
  state = { e: null }
  static getDerivedStateFromError(e) { return { e } }
  render() { return this.state.e ? <pre style={{ padding: 16, whiteSpace: 'pre-wrap', color: 'crimson' }}>App error: {String(this.state.e.stack || this.state.e).slice(0, 700)}</pre> : this.props.children }
}

import('./App.jsx').then((m) => createRoot(document.getElementById('root')).render(<EB><m.default /></EB>)).catch((e) => show(e.stack || e))
