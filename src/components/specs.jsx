import React, { useRef, useState, useEffect } from 'react'
import { useMacbookStore } from '../store/index'
import clsx from 'clsx'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import StudioLights from './three/studiolights'
import ModelSwitcher from './three/ModelSwitcher'
import { useMediaQuery } from 'react-responsive'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ─── Hotspot definitions ──────────────────────────────────────────────────────
const HOTSPOTS = [
  {
    id: 'display',
    position: [0, 3.2, -0.5],
    label: 'Liquid Retina XDR',
    detail: '3456×2234 · 1000 nits sustained · ProMotion 120Hz · nano-texture glass',
    badge: 'New gen panel',
    color: '#378ADD',
  },
  {
    id: 'camera',
    position: [0, 4.35, -0.52],
    label: '1080p FaceTime HD',
    detail: 'Advanced ISP · Center Stage · Studio-quality three-mic array',
    badge: 'Spatial video',
    color: '#5DCAA5',
  },
  {
    id: 'keyboard',
    position: [0, 0.55, 1.1],
    label: 'Magic Keyboard',
    detail: 'Full-size backlit keys · 1mm travel · Touch ID fingerprint sensor',
    badge: 'Force Touch trackpad',
    color: '#EF9F27',
  },
  {
    id: 'ports-left',
    position: [-3.1, 1.4, 0.0],
    label: 'Thunderbolt 4 × 3 + HDMI',
    detail: 'Three TB4 ports · HDMI 2.1 · SD card slot · MagSafe 3 · 140W charging',
    badge: '140W MagSafe 3',
    color: '#D4537E',
  },
  {
    id: 'ports-right',
    position: [3.1, 1.4, 0.0],
    label: 'Headphone + SD card',
    detail: 'High-impedance headphone jack · SDXC with UHS-II support',
    badge: 'ProRes ready',
    color: '#7F77DD',
  },
  {
    id: 'chip',
    position: [0, 0.3, 0.3],
    label: 'M4 Pro chip',
    detail: '14-core CPU · 20-core GPU · 48GB unified memory · 273 GB/s bandwidth',
    badge: 'Rocket chip',
    color: '#378ADD',
  },
]

// ─── View presets ─────────────────────────────────────────────────────────────
const VIEWS = [
  { label: 'Front',   position: [0, 2, 8],    target: [0, 1.5, 0] },
  { label: 'Side',    position: [7, 1.5, 4],  target: [0, 1.5, 0] },
  { label: 'Profile', position: [8, 1.0, 0],  target: [0, 1.0, 0] },
  { label: 'Rear',    position: [0, 2, -8],   target: [0, 1.5, 0] },
  { label: 'Top',     position: [0, 9, 1.5],  target: [0, 0, 0]   },
]

// ─── Animated hotspot marker (lives inside Canvas) ────────────────────────────
function HotspotMarker({ hotspot, isActive, onClick }) {
  const ringRef = useRef()
  const dotRef  = useRef()

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2.4) * 0.15)
    }
    if (dotRef.current) {
      dotRef.current.material.emissiveIntensity = isActive
        ? 2.5 + Math.sin(clock.elapsedTime * 4) * 0.5
        : 0.7 + Math.sin(clock.elapsedTime * 2) * 0.2
    }
  })

  return (
    <group position={hotspot.position}>
      {/* pulsing ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.14, 0.018, 8, 40]} />
        <meshBasicMaterial color={hotspot.color} transparent opacity={0.65} />
      </mesh>

      {/* clickable dot */}
      <mesh
        ref={dotRef}
        onClick={(e) => { e.stopPropagation(); onClick() }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'default')}
      >
        <sphereGeometry args={[0.09, 20, 20]} />
        <meshStandardMaterial
          color={isActive ? hotspot.color : '#ffffff'}
          emissive={new THREE.Color(hotspot.color)}
          emissiveIntensity={isActive ? 2.5 : 0.7}
        />
      </mesh>

      {/* tooltip card */}
      {isActive && (
        <Html distanceFactor={10} position={[0.22, 0.22, 0]} zIndexRange={[100, 0]}>
          <div style={{
            background: 'rgba(12,12,16,0.96)',
            border: `1px solid ${hotspot.color}35`,
            borderLeft: `2px solid ${hotspot.color}`,
            borderRadius: 14,
            padding: '12px 16px',
            minWidth: 210,
            maxWidth: 240,
            fontFamily: "-apple-system,'SF Pro Display',sans-serif",
            pointerEvents: 'none',
            animation: 'hs-fadeup .2s ease forwards',
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#f5f5f7', margin: '0 0 4px' }}>
              {hotspot.label}
            </p>
            <p style={{ fontSize: 11, color: '#a1a1a6', lineHeight: 1.55, margin: '0 0 8px' }}>
              {hotspot.detail}
            </p>
            <span style={{
              fontSize: 10, padding: '2px 9px', borderRadius: 20,
              background: `${hotspot.color}20`, color: hotspot.color,
              letterSpacing: '.06em', textTransform: 'uppercase',
            }}>
              {hotspot.badge}
            </span>
          </div>
        </Html>
      )}
    </group>
  )
}

// ─── Smooth camera lerp ───────────────────────────────────────────────────────
function CameraRig({ targetView, orbitRef }) {
  const { camera } = useThree()
  useFrame(() => {
    if (!targetView) return
    camera.position.lerp(new THREE.Vector3(...targetView.position), 0.055)
    if (orbitRef.current) {
      orbitRef.current.target.lerp(new THREE.Vector3(...targetView.target), 0.055)
    }
  })
  return null
}

// ─── Main component ───────────────────────────────────────────────────────────
const Specs = () => {
  const { color, scale, setcolor, setScale } = useMacbookStore()
  const isMobile = useMediaQuery({ query: '(max-width: 1024px)' })

  const sectionRef = useRef()
  const titleRef   = useRef()
  const viewsRef   = useRef()
  const orbitRef   = useRef()

  const [activeHotspot, setActiveHotspot] = useState(null)
  const [activeView,    setActiveView]    = useState(0)
  const [targetView,    setTargetView]    = useState(null)
  const [hotspotsOn,    setHotspotsOn]    = useState(true)

  // GSAP entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: 'top 82%', once: true },
      })
        .fromTo(titleRef.current,
          { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' })
        .fromTo(viewsRef.current,
          { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.35')
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const handleViewChange = (idx) => {
    setActiveView(idx)
    setTargetView(VIEWS[idx])
    setActiveHotspot(null)
  }

  return (
    <section
      id="product-viewer"
      ref={sectionRef}
      style={{ position: 'relative', background: '#000', overflow: 'hidden' }}
    >
      <style>{`
        @keyframes hs-fadeup {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ambient glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 55% 35% at 50% 30%, rgba(24,55,130,.14) 0%, transparent 70%)',
      }} />

      {/* ── header ── */}
      <div style={{ position: 'relative', zIndex: 2, padding: '0 5%' }}>
        <h2
          ref={titleRef}
          style={{
            fontFamily: "-apple-system,'SF Pro Display',sans-serif",
            fontSize: 'clamp(28px,4vw,48px)',
            fontWeight: 700,
            color: '#f5f5f7',
            letterSpacing: '-.03em',
            margin: 0,
            opacity: 0,
          }}
        >
          Take a closer Look
        </h2>
      </div>

      {/* ── Canvas ── */}
      <Canvas
        id="canvas"
        camera={{ position: [0, 2, 8], fov: 50, near: 0.1, far: 100 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <StudioLights />
        <ModelSwitcher scale={isMobile ? scale - 0.03 : scale} isMobile={isMobile} />

        {hotspotsOn && HOTSPOTS.map((hs) => (
          <HotspotMarker
            key={hs.id}
            hotspot={hs}
            isActive={activeHotspot === hs.id}
            onClick={() => setActiveHotspot(p => p === hs.id ? null : hs.id)}
          />
        ))}

        <CameraRig targetView={targetView} orbitRef={orbitRef} />

        <OrbitControls
          ref={orbitRef}
          enableZoom
          enablePan={false}
          minDistance={4}
          maxDistance={14}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.85}
          dampingFactor={0.05}
          rotateSpeed={0.5}
          target={[0, 1.5, 0]}
        />
      </Canvas>

      {/* ── controls overlay ── */}
      <div style={{
        position: 'relative', zIndex: 3,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        padding: '0 24px',
      }}>
        {/* original info + color/size pickers — unchanged from your code */}
        <p className="info" style={{ fontSize: 13, color: '#6e6e73', margin: 0, fontFamily: '-apple-system,sans-serif' }}>
          MacBook Pro | Available in 14" &amp; 16" in Space Gray &amp; Dark
        </p>

        <div className="flex-center gap-5">
          <div className="color-control">
            <div onClick={() => setcolor('#343d46')} className={clsx('bg-neutral-300', color === '#343d46' && 'active')} />
            <div onClick={() => setcolor('#2e2c2e')} className={clsx('bg-neutral-900', color === '#2e2c2e' && 'active')} />
          </div>
          <div className="size-control">
            <div onClick={() => setScale(0.06)} className={clsx(scale === 0.06 ? 'bg-white text-black' : 'bg-transparent text-white')}><p>14"</p></div>
            <div onClick={() => setScale(0.08)} className={clsx(scale === 0.08 ? 'bg-white text-black' : 'bg-transparent text-white')}><p>16"</p></div>
          </div>
        </div>

        {/* view presets + hotspot toggle */}
        <div
          ref={viewsRef}
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', opacity: 0 }}
        >
          {VIEWS.map((v, i) => (
            <button
              key={v.label}
              onClick={() => handleViewChange(i)}
              style={{
                background: activeView === i ? 'rgba(255,255,255,.13)' : 'rgba(255,255,255,.05)',
                border: activeView === i ? '1px solid rgba(255,255,255,.3)' : '1px solid rgba(255,255,255,.1)',
                color: activeView === i ? '#f5f5f7' : '#6e6e73',
                fontSize: 11, padding: '6px 18px', borderRadius: 20,
                cursor: 'pointer', letterSpacing: '.05em',
                fontFamily: '-apple-system,sans-serif',
                transition: 'all .18s ease',
              }}
            >
              {v.label}
            </button>
          ))}

          <button
            onClick={() => { setHotspotsOn(p => !p); setActiveHotspot(null) }}
            style={{
              background: hotspotsOn ? 'rgba(55,138,221,.15)' : 'rgba(255,255,255,.05)',
              border: hotspotsOn ? '1px solid rgba(55,138,221,.38)' : '1px solid rgba(255,255,255,.1)',
              color: hotspotsOn ? '#85B7EB' : '#6e6e73',
              fontSize: 11, padding: '6px 18px', borderRadius: 20,
              cursor: 'pointer', letterSpacing: '.05em',
              fontFamily: '-apple-system,sans-serif',
              transition: 'all .18s ease',
            }}
          >
            {hotspotsOn ? '● Hotspots on' : '○ Hotspots off'}
          </button>
        </div>
      </div>

      {/* ── specs bar ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)`,
        gap: '1px',
        background: 'rgba(255,255,255,.07)',
        borderTop: '1px solid rgba(255,255,255,.07)',
        marginTop: 24,
        position: 'relative',
        zIndex: 2,
      }}>
        {[
          { val: '15.3″', key: 'Liquid Retina XDR' },
          { val: '16.2mm', key: 'Thin profile' },
          { val: 'M4 Pro', key: 'Apple Silicon' },
          { val: '22 hr', key: 'Battery life' },
        ].map((s) => (
          <div
            key={s.key}
            style={{ background: '#000', padding: isMobile ? '14px 10px' : '22px 16px', textAlign: 'center', transition: 'background .2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#0f0f0f'}
            onMouseLeave={e => e.currentTarget.style.background = '#000'}
          >
            <div style={{
              fontSize: isMobile ? 18 : 22, fontWeight: 700,
              letterSpacing: '-.03em', color: '#f5f5f7',
              fontFamily: "-apple-system,'SF Pro Display',sans-serif",
            }}>
              {s.val}
            </div>
            <div style={{
              fontSize: 10, color: '#6e6e73', marginTop: 4,
              letterSpacing: '.07em', textTransform: 'uppercase',
              fontFamily: '-apple-system,sans-serif',
            }}>
              {s.key}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Specs
