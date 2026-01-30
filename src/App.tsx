import React, { useState } from 'react'
import WeaponCraftingNarrativePrototype from './components/WeaponCraftingNarrativePrototype'
import CraftingTreesPresentation from './components/CraftingTreesPresentation'

type View = 'prototype' | 'trees'

function TopNav({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  const pill: React.CSSProperties = {
    display: 'inline-flex',
    gap: 8,
    alignItems: 'center',
    padding: '8px 10px',
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.06)',
  }

  const btn = (active: boolean): React.CSSProperties => ({
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.15)',
    background: active ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.92)',
    cursor: 'pointer',
    fontWeight: 800,
  })

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        backdropFilter: 'blur(10px)',
        background: 'rgba(5,5,7,0.7)',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 950, letterSpacing: 0.2 }}>Creepy Cuties — Demo</div>
          <div style={{ opacity: 0.75, fontSize: 13 }}>Weapon crafting prototype + crafting trees</div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={pill}>GitHub Pages friendly (Vite)</span>
          <button style={btn(view === 'prototype')} onClick={() => onChange('prototype')}>Prototype</button>
          <button style={btn(view === 'trees')} onClick={() => onChange('trees')}>Trees</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState<View>('prototype')

  return (
    <div>
      <TopNav view={view} onChange={setView} />
      {view === 'prototype' ? <WeaponCraftingNarrativePrototype /> : <CraftingTreesPresentation />}
    </div>
  )
}
