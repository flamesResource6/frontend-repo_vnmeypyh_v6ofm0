import { useEffect, useMemo, useRef, useState } from 'react'
import Spline from '@splinetool/react-spline'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Sparkles, FlameKindling, BookOpenText, Heart, Compass, MoonStar, Loader2 } from 'lucide-react'

function useBackend() {
  const fallback = typeof window !== 'undefined'
    ? window.location.origin.replace('3000', '8000')
    : ''
  const base = import.meta.env.VITE_BACKEND_URL || fallback
  return base
}

function useParallax(strength = 20) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  useEffect(() => {
    const handler = (e) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const dx = (e.clientX - cx) / cx
      const dy = (e.clientY - cy) / cy
      x.set(dx)
      y.set(dy)
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [x, y])
  const tx = useTransform(x, (val) => `${-val * strength}px`)
  const ty = useTransform(y, (val) => `${-val * strength}px`)
  return { tx, ty }
}

function WeightSlider({ label, icon: Icon, value, onChange, color }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-white/80">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <span>{label}</span>
        </div>
        <span className="tabular-nums">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-fuchsia-500"
      />
    </div>
  )
}

function Hero({ onScroll }) {
  const { tx, ty } = useParallax(30)
  return (
    <section className="relative h-[100vh] w-full overflow-hidden perspective-1000">
      <motion.div className="absolute inset-0 will-change-transform" style={{ x: tx, y: ty }}>
        <Spline scene="https://prod.spline.design/atN3lqky4IzF-KEP/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </motion.div>

      {/* Atmospheric overlays for depth */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ x: useTransform(tx, v => `calc(${v} * -0.4)`), y: useTransform(ty, v => `calc(${v} * -0.4)`) }}>
        <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_center,rgba(255,0,128,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </motion.div>

      {/* Floating particles */}
      <Particles parallax={{ tx, ty }} />

      <div className="relative z-10 h-full flex items-end sm:items-center">
        <div className="px-6 sm:px-10 md:px-16 lg:px-24 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl drop-shadow-[0_10px_30px_rgba(255,0,128,0.25)]"
          >
            <motion.div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/90 backdrop-blur will-change-transform" style={{ x: useTransform(tx, v => `calc(${v} * 0.6)`), y: useTransform(ty, v => `calc(${v} * 0.6)`) }}>
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-xs tracking-wide">Interactive · Adventure · Romance · Nightlife</span>
            </motion.div>
            <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
              StoryForge: Craft Your Neon-Night Epic
            </h1>
            <p className="mt-4 text-white/85 max-w-2xl">
              Generate cinematic, choose-your-path stories that blend heists, heartbeats, and after-hours energy.
            </p>
            <div className="mt-6">
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onScroll}
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-fuchsia-600 text-white font-semibold shadow-[0_10px_30px_rgba(217,70,239,0.35)] hover:bg-fuchsia-500 transition"
              >
                Begin Your Tale
                <FlameKindling className="h-5 w-5 group-hover:scale-110 transition" />
              </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Particles({ count = 18, parallax }) {
  const { tx, ty } = parallax || {}
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 4,
    delay: Math.random() * 4,
    depth: Math.random() * 0.8 + 0.2,
  })), [count])
  return (
    <div className="pointer-events-none absolute inset-0">
      {seeds.map(p => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-fuchsia-400/30 blur-md"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            x: tx ? useTransform(tx, v => `calc(${v} * ${-p.depth})`) : 0,
            y: ty ? useTransform(ty, v => `calc(${v} * ${-p.depth})`) : 0,
          }}
          animate={{
            y: [0, -8, 0],
            opacity: [0.4, 0.9, 0.4],
          }}
          transition={{ duration: 6 + p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function TiltCard({ children, className = '' }) {
  const ref = useRef(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const dx = useSpring(rx, { stiffness: 180, damping: 18 })
  const dy = useSpring(ry, { stiffness: 180, damping: 18 })
  const rotateX = useTransform(dy, v => `${v}deg`)
  const rotateY = useTransform(dx, v => `${v}deg`)

  const handleMove = (e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const limit = 7
    rx.set((px - 0.5) * limit)
    ry.set(-(py - 0.5) * limit)
  }
  const handleLeave = () => { rx.set(0); ry.set(0) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={`[perspective:1200px] will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  )
}

function StoryForm({ onStart, busy }) {
  const [protagonist, setProtagonist] = useState('Nova')
  const [setting, setSetting] = useState('Neon Harbor')
  const [adventure, setAdventure] = useState(60)
  const [romance, setRomance] = useState(20)
  const [nightlife, setNightlife] = useState(20)

  useEffect(() => {
    const total = adventure + romance + nightlife
    if (total === 0) return
    if (total > 100) {
      const factor = 100 / total
      setAdventure(Math.round(adventure * factor))
      setRomance(Math.round(romance * factor))
      setNightlife(Math.round(nightlife * factor))
    }
  }, [adventure, romance, nightlife])

  return (
    <div className="relative -mt-16 z-20">
      {/* glow base */}
      <div className="absolute inset-x-0 -top-10 mx-auto h-40 max-w-4xl bg-fuchsia-500/20 blur-3xl rounded-full" />
      <div className="mx-auto max-w-5xl px-6 sm:px-10 md:px-16 lg:px-24">
        <TiltCard className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_80px_rgba(217,70,239,0.25)]">
          <div style={{ transform: 'translateZ(40px)' }}>
            <div className="flex items-center gap-3 text-white/90">
              <BookOpenText className="h-5 w-5 text-fuchsia-400" />
              <h2 className="text-xl sm:text-2xl font-bold">Setup</h2>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm text-white/70">Protagonist</label>
                <input value={protagonist} onChange={(e) => setProtagonist(e.target.value)} placeholder="Your hero's name" className="mt-2 w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
              </div>
              <div>
                <label className="text-sm text-white/70">Setting</label>
                <input value={setting} onChange={(e) => setSetting(e.target.value)} placeholder="City, world, vibe" className="mt-2 w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <WeightSlider label="Adventure" icon={Compass} value={adventure} onChange={setAdventure} color="text-blue-300" />
              <WeightSlider label="Romance" icon={Heart} value={romance} onChange={setRomance} color="text-pink-300" />
              <WeightSlider label="Nightlife" icon={MoonStar} value={nightlife} onChange={setNightlife} color="text-purple-300" />
            </div>
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-white/60">Tune the mood. The generator blends your weights into each scene.</p>
              <motion.button whileHover={{ y: -2 }} disabled={busy} onClick={() => onStart({ protagonist, setting, weights: { adventure, romance, nightlife } })} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-fuchsia-600 text-white font-semibold shadow-lg shadow-fuchsia-600/30 hover:bg-fuchsia-500 disabled:opacity-60">
                {busy ? (<><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>) : (<>Create Story</>)}
              </motion.button>
            </div>
          </div>
        </TiltCard>
      </div>
    </div>
  )
}

function SceneView({ scene, onChoose, disabled }) {
  return (
    <div className="mx-auto max-w-4xl px-6 sm:px-10 md:px-16 lg:px-24 mt-8">
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6 sm:p-8 text-white">
        <p className="whitespace-pre-line leading-relaxed text-lg text-white/90">{scene.text}</p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scene.choices.map((c) => (
            <motion.button key={c.id} disabled={disabled} onClick={() => onChoose(c.id)} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} className="group text-left rounded-xl border border-white/10 bg-white/10 hover:bg-white/20 px-5 py-4 text-white transition disabled:opacity-60">
              <span className="block font-semibold">{c.text}</span>
              <span className="block text-xs text-white/60 mt-1">Choose path</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

function RecentStories({ items, onOpen }) {
  if (!items?.length) return null
  return (
    <div className="mx-auto max-w-5xl px-6 sm:px-10 md:px-16 lg:px-24 mt-10">
      <h3 className="text-white/80 font-semibold mb-3">Recent Tales</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((s) => (
          <motion.button key={s.id} onClick={() => onOpen(s.id)} whileHover={{ y: -2 }} className="rounded-xl bg-white/5 border border-white/10 p-4 text-left text-white/80 hover:bg-white/10">
            <div className="text-sm">{new Date(s.created_at).toLocaleString?.() || ''}</div>
            <div className="font-bold mt-1">{s.title}</div>
            <div className="text-xs text-white/60">Steps: {s.steps}</div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const base = useBackend()
  const [busy, setBusy] = useState(false)
  const [story, setStory] = useState(null)
  const [scene, setScene] = useState(null)
  const [recent, setRecent] = useState([])
  const [complete, setComplete] = useState(false)

  const fetchRecent = async () => {
    try {
      const r = await fetch(`${base}/api/story/list`)
      const j = await r.json()
      setRecent(j.items || [])
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    fetchRecent()
  }, [])

  const start = async ({ protagonist, setting, weights }) => {
    setBusy(true)
    try {
      const r = await fetch(`${base}/api/story/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protagonist, setting, weights }),
      })
      if (!r.ok) throw new Error('Failed to start')
      const j = await r.json()
      setStory({ id: j.story_id, title: j.title })
      setScene(j.scene)
      setComplete(false)
      setTimeout(fetchRecent, 400)
      document.getElementById('story-anchor')?.scrollIntoView({ behavior: 'smooth' })
    } catch (e) {
      alert('Unable to start story. Is the backend running?')
    } finally {
      setBusy(false)
    }
  }

  const choose = async (choice_id) => {
    if (!story) return
    setBusy(true)
    try {
      const r = await fetch(`${base}/api/story/choose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story_id: story.id, choice_id }),
      })
      if (!r.ok) throw new Error('Failed to progress')
      const j = await r.json()
      setScene(j.scene)
      setComplete(j.is_complete)
      if (j.is_complete) setTimeout(fetchRecent, 400)
    } catch (e) {
      alert('Unable to continue the story.')
    } finally {
      setBusy(false)
    }
  }

  const openExisting = async (id) => {
    try {
      const r = await fetch(`${base}/api/story/${id}`)
      const j = await r.json()
      setStory({ id: j.id, title: j.title })
      const last = j.scenes?.[j.scenes.length - 1]
      setScene(last)
      setComplete(j.status === 'complete')
      document.getElementById('story-anchor')?.scrollIntoView({ behavior: 'smooth' })
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0b0016] to-[#0b0016] text-white">
      <Hero onScroll={() => document.getElementById('setup')?.scrollIntoView({ behavior: 'smooth' })} />
      <div id="setup" />
      <StoryForm onStart={start} busy={busy} />

      <div id="story-anchor" />
      {scene ? (
        <>
          <div className="mx-auto max-w-5xl px-6 sm:px-10 md:px-16 lg:px-24 mt-10">
            <div className="flex items-center gap-3">
              <FlameKindling className="h-5 w-5 text-fuchsia-400" />
              <h2 className="text-xl sm:text-2xl font-bold">{story?.title}</h2>
            </div>
            {complete && (
              <div className="mt-3 text-sm text-emerald-300">Complete. Refresh weights or start a new run to remix the night.</div>
            )}
          </div>
          <SceneView scene={scene} onChoose={choose} disabled={busy || complete} />
        </>
      ) : (
        <div className="mx-auto max-w-5xl px-6 sm:px-10 md:px-16 lg:px-24 mt-10 text-white/70">
          Choose your mood and create the opening scene.
        </div>
      )}

      <RecentStories items={recent} onOpen={openExisting} />

      <footer className="mt-20 py-10 text-center text-white/40 text-sm">
        Built with love for neon nights.
      </footer>
    </div>
  )
}
