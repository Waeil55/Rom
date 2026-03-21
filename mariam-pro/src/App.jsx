import { useState } from 'react'

const styles = {
  app: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    color: '#e0e0e0',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '800',
    background: 'linear-gradient(90deg, #e94560, #0f3460)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  subtitle: {
    fontSize: '1rem',
    color: '#a0a0b0',
    marginTop: '0.5rem',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '1.5rem 2rem',
    marginBottom: '1.5rem',
    width: '100%',
    maxWidth: '600px',
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#e94560',
    marginBottom: '0.75rem',
  },
  counter: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  btn: {
    background: '#e94560',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.5rem 1.25rem',
    fontSize: '1.1rem',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  count: {
    fontSize: '1.5rem',
    fontWeight: '700',
    minWidth: '3ch',
    textAlign: 'center',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    padding: '0.4rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    color: '#c0c0d0',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: '2rem',
    color: '#606070',
    fontSize: '0.85rem',
  },
}

const features = [
  '⚡ Fast — powered by Vite',
  '⚛️  React 18 with Strict Mode',
  '🚀 Auto-deployed to GitHub Pages',
  '🎨 Modern gradient UI',
]

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>MARIAM PRO</h1>
        <p style={styles.subtitle}>A modern React application</p>
      </header>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Interactive Counter</div>
        <div style={styles.counter}>
          <button style={styles.btn} onClick={() => setCount((c) => c - 1)}>−</button>
          <span style={styles.count}>{count}</span>
          <button style={styles.btn} onClick={() => setCount((c) => c + 1)}>+</button>
          <button
            style={{ ...styles.btn, background: '#555', marginLeft: 'auto' }}
            onClick={() => setCount(0)}
          >
            Reset
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Features</div>
        <ul style={styles.list}>
          {features.map((f) => (
            <li key={f} style={styles.listItem}>{f}</li>
          ))}
        </ul>
      </div>

      <footer style={styles.footer}>© {new Date().getFullYear()} MARIAM PRO</footer>
    </div>
  )
}
