import { BODY_COLORS, GLOW_COLORS, SHAPES, ACCESSORIES } from '../lib/avatar'

function AvatarPreview({ avatar }) {
  const tall = avatar.shape === 'alto'
  return (
    <svg viewBox="0 0 120 150" width="120" height="150" aria-hidden>
      <defs>
        <radialGradient id="glow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={avatar.glowColor} stopOpacity="0.55" />
          <stop offset="100%" stopColor={avatar.glowColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="70" rx="55" ry="65" fill="url(#glow)" />
      {/* cuerpo */}
      <rect
        x={tall ? 44 : 38}
        y={tall ? 70 : 78}
        width={tall ? 32 : 44}
        height={tall ? 60 : 48}
        rx="22"
        fill={avatar.bodyColor}
      />
      {/* cabeza */}
      <circle cx="60" cy={tall ? 56 : 62} r="22" fill={avatar.bodyColor} />
      <circle cx="60" cy={tall ? 56 : 62} r="22" fill="#000" opacity="0.04" />
      {/* mejilla */}
      <circle cx="60" cy={tall ? 62 : 68} r="5" fill="#ff8aa0" opacity="0.5" />
      {/* accesorio */}
      {avatar.accessory === 'flor' && <circle cx="76" cy={tall ? 44 : 50} r="7" fill="#ffd27a" />}
      {avatar.accessory === 'corona' && (
        <ellipse cx="60" cy={tall ? 36 : 42} rx="16" ry="5" fill="none" stroke="#ffd27a" strokeWidth="3" />
      )}
      {avatar.accessory === 'estrella' && (
        <polygon points="60,30 63,38 71,38 64,43 67,51 60,46 53,51 56,43 49,38 57,38" fill="#fff3d6" />
      )}
    </svg>
  )
}

function Swatch({ active, hex, onClick, label }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      style={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        background: hex,
        boxShadow: active ? `0 0 0 3px var(--noche), 0 0 0 5px ${hex}` : 'none',
        transition: 'transform .15s',
        transform: active ? 'scale(1.1)' : 'scale(1)',
      }}
    />
  )
}

export default function AvatarPicker({ avatar, onChange }) {
  const set = (patch) => onChange({ ...avatar, ...patch })
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
      <div
        style={{
          background: 'rgba(0,0,0,0.2)',
          borderRadius: 20,
          padding: 8,
          border: '1px solid var(--vidrio-borde)',
        }}
      >
        <AvatarPreview avatar={avatar} />
      </div>

      <div style={{ flex: 1, minWidth: 220, display: 'grid', gap: 14 }}>
        <Field label="Color">
          {BODY_COLORS.map((c) => (
            <Swatch
              key={c.id}
              hex={c.hex}
              label={c.label}
              active={avatar.bodyColor === c.hex}
              onClick={() => set({ bodyColor: c.hex })}
            />
          ))}
        </Field>
        <Field label="Aura">
          {GLOW_COLORS.map((c) => (
            <Swatch
              key={c.id}
              hex={c.hex}
              label={c.label}
              active={avatar.glowColor === c.hex}
              onClick={() => set({ glowColor: c.hex })}
            />
          ))}
        </Field>
        <Field label="Figura">
          {SHAPES.map((s) => (
            <Chip key={s.id} active={avatar.shape === s.id} onClick={() => set({ shape: s.id })}>
              {s.label}
            </Chip>
          ))}
        </Field>
        <Field label="Detalle">
          {ACCESSORIES.map((a) => (
            <Chip
              key={a.id}
              active={avatar.accessory === a.id}
              onClick={() => set({ accessory: a.id })}
            >
              {a.label}
            </Chip>
          ))}
        </Field>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, letterSpacing: 1, opacity: 0.7, marginBottom: 8, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
    </div>
  )
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        padding: '7px 14px',
        borderRadius: 999,
        fontSize: 14,
        background: active ? 'var(--ambar)' : 'rgba(255,255,255,0.06)',
        color: active ? 'var(--noche)' : 'var(--crema)',
        border: '1px solid var(--vidrio-borde)',
        fontWeight: active ? 600 : 400,
        transition: 'all .15s',
      }}
    >
      {children}
    </button>
  )
}
