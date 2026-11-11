import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Billboard, Environment, Float, Loader, MeshReflectorMaterial,
  Sparkles, Text, useAnimations, useGLTF,
} from '@react-three/drei'
import { CapsuleCollider, CuboidCollider, Physics, RigidBody } from '@react-three/rapier'
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'
import {
  ArrowLeft, Check, Compass, Eye, Info, Map, Menu,
  Play, RotateCcw, Settings, Sparkles as SparklesIcon, Volume2,
  VolumeX, X,
} from 'lucide-react'
import { useGameStore } from './useGameStore'
import './ThreeDUniverse.css'

const ROBOT = '/models/RobotExpressive.glb'
const KNIGHT = '/models/Knight.glb'
const FOX = '/models/Fox.glb'
const CITY = '/models/LittlestTokyo.glb'

const REGION_POSITIONS = [
  { name: 'Ganache Bay', x: 0, z: 0 },
  { name: 'Chocolate Valley', x: 26, z: -7 },
  { name: 'Pizza Peak', x: -30, z: -24 },
  { name: 'Dancing Forest', x: -24, z: 20 },
  { name: 'Royal Palace', x: 2, z: -23 },
  { name: 'Floating Isles', x: 31, z: 25 },
]

const dialogues = {
  ruler: [
    'My crown is enormous because my confidence is even bigger',
    'I invented diplomacy and everyone else is doing it wrong',
    'Please ignore the emergency dance rehearsal behind me',
  ],
  chef: [
    'The secret ingredient is confidence and twelve cheeses',
    'If the sky rains lunch, is my restaurant technically outdoors?',
    'One pizza for you and the bill goes to the moon',
  ],
  taxi: [
    'My taxi flies perfectly but landing is the experimental part',
    'Chocolate Valley? Sure, sign this extremely tiny waiver',
    'I only crashed twice today. Personal best!',
  ],
}

function seeded(seed, salt) {
  const x = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

function getPalette(planet) {
  const biomes = [
    ['#87e4b2', '#4ba47c', '#ffb74f'],
    ['#d7aa79', '#8f624f', '#66342c'],
    ['#70d5cb', '#488b91', '#8f78ff'],
    ['#f2a177', '#b65d70', '#ffcf6a'],
    ['#9ddb75', '#4e9d69', '#74b9ff'],
    ['#7fe1d2', '#338f8d', '#ff9dd8'],
    ['#a78bdb', '#64539c', '#f5b0ff'],
    ['#ecc675', '#b17c45', '#f7dd8d'],
  ]
  const [ground, dark, accent] = biomes[(planet.indexes[0] + planet.indexes[3]) % biomes.length]
  return {
    ground,
    dark,
    accent,
    river: ['#ffad32', '#4e211d', '#785ee8', '#f5a1c3', '#d85a3f', '#d59b48', '#f1d36c', '#f4c978'][planet.indexes[3]],
    architecture: ['#7dd886', '#f2a45f', '#72a8e6', '#9d7cec', '#c89554', '#f1d14d', '#9cadc1', '#d87388'][planet.indexes[2]],
    sky: ['#76b7ff', '#5b447d', '#8b87ec', '#ff9879', '#83bddd', '#64d7d5', '#ab85d7', '#d49a6a'][planet.indexes[0]],
  }
}

function useAmbientSound(enabled) {
  useEffect(() => {
    if (!enabled) return undefined
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return undefined
    const context = new AudioContext()
    const master = context.createGain()
    const filter = context.createBiquadFilter()
    master.gain.value = .018
    filter.type = 'lowpass'
    filter.frequency.value = 420
    master.connect(filter).connect(context.destination)
    const oscillators = [110, 164.81, 220].map((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = index === 1 ? 'triangle' : 'sine'
      oscillator.frequency.value = frequency
      oscillator.detune.value = index * 5
      gain.gain.value = index === 1 ? .24 : .15
      oscillator.connect(gain).connect(master)
      oscillator.start()
      return oscillator
    })
    const pulse = window.setInterval(() => {
      master.gain.linearRampToValueAtTime(.012 + Math.random() * .012, context.currentTime + 2)
    }, 2200)
    return () => {
      window.clearInterval(pulse)
      oscillators.forEach((oscillator) => oscillator.stop())
      context.close()
    }
  }, [enabled])
}

export default function ThreeDUniverse({ planet, onAgain, onSurprise, onShare, onChange, copied }) {
  const [entered, setEntered] = useState(false)
  const [sound, setSound] = useState(true)
  const [guideOpen, setGuideOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [webgl] = useState(() => {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  })
  const quality = useGameStore((state) => state.quality)
  const setQuality = useGameStore((state) => state.setQuality)
  const resetGameUi = useGameStore((state) => state.resetGameUi)
  const palette = useMemo(() => getPalette(planet), [planet])
  useAmbientSound(sound && entered)

  useEffect(() => {
    resetGameUi()
    if (window.matchMedia('(max-width: 700px), (pointer: coarse)').matches) setQuality('low')
  }, [planet.seed, resetGameUi, setQuality])

  if (!webgl) return <WebGLFallback onAgain={onAgain} />

  if (!entered) {
    return <GameArrival planet={planet} palette={palette} onEnter={() => setEntered(true)} onAgain={onAgain} />
  }

  return (
    <section className="game-shell">
      <Canvas
        shadows={quality === 'high'}
        dpr={quality === 'high' ? [1, 1.65] : 1}
        camera={{ fov: 54, near: .1, far: 260, position: [0, 7, 12] }}
        gl={{ antialias: quality === 'high', powerPreference: 'high-performance' }}
        fallback={<WebGLFallback onAgain={onAgain} />}
      >
        <Suspense fallback={null}>
          <GameScene planet={planet} palette={palette} quality={quality} />
        </Suspense>
      </Canvas>
      <Loader
        containerStyles={{ background: '#100b22', zIndex: 500 }}
        innerStyles={{ width: '220px', background: 'rgba(255,255,255,.12)' }}
        barStyles={{ background: '#ffce59', height: '7px' }}
        dataStyles={{ fontFamily: 'Outfit', fontSize: '12px', color: '#fff' }}
        dataInterpolation={(progress) => `BUILDING YOUR UNIVERSE • ${progress.toFixed(0)}%`}
      />
      <GameHud
        planet={planet}
        sound={sound}
        setSound={setSound}
        onGuide={() => setGuideOpen(true)}
        onMenu={() => setMenuOpen(true)}
      />
      <MobileControls />
      {guideOpen && <WorldGuide planet={planet} onClose={() => setGuideOpen(false)} />}
      {menuOpen && (
        <PauseMenu
          quality={quality}
          setQuality={setQuality}
          onClose={() => setMenuOpen(false)}
          onAgain={onAgain}
          onSurprise={onSurprise}
          onShare={onShare}
          onChange={onChange}
          copied={copied}
        />
      )}
    </section>
  )
}

function GameArrival({ planet, palette, onEnter, onAgain }) {
  return (
    <section className="game-arrival" style={{ '--world-accent': palette.accent, '--world-sky': palette.sky }}>
      <div className="arrival-sky"><i /><i /><i /></div>
      <div className="arrival-world">
        <span className="arrival-ring" />
        <span className="arrival-land land-a" />
        <span className="arrival-land land-b" />
      </div>
      <div className="arrival-copy">
        <span><SparklesIcon /> WORLD GENERATED • SEED {planet.seed}</span>
        <h1>ENTER<br /><em>{planet.name}</em></h1>
        <p>A living fantasy world shaped by your five questionable decisions</p>
        <button onClick={onEnter}><Eye /> EXPLORE THE WORLD <b>↗</b></button>
        <button className="arrival-back" onClick={onAgain}><ArrowLeft /> Rebuild planet</button>
      </div>
      <div className="control-preview">
        <span><kbd>WASD</kbd> ROAM</span><span><kbd>DRAG</kbd> LOOK AROUND</span><span><kbd>E</kbd> DISCOVER</span>
      </div>
    </section>
  )
}

function GameScene({ planet, palette, quality }) {
  const paused = useGameStore((state) => state.paused)
  const event = useGameStore((state) => state.event)
  const interactions = useMemo(() => [
    { id: 'king', label: 'Talk to the ruler', position: [1, 1, -18], type: 'npc', dialogue: 'ruler' },
    { id: 'chef', label: 'Talk to the pizza chef', position: [-10, 1, 2], type: 'npc', dialogue: 'chef' },
    { id: 'taxi', label: 'Inspect the flying taxi', position: [12, 1, 5], type: 'npc', dialogue: 'taxi' },
    { id: 'river', label: 'Taste the strange river', position: [20, 1, -5], type: 'discovery' },
    { id: 'shrine', label: 'Activate the Pizza Shrine', position: [-18, 1, -13], type: 'discovery' },
    { id: 'crown', label: 'Inspect the royal crown', position: [-28, 1, -22], type: 'discovery' },
    { id: 'stage', label: 'Watch the city dance', position: [7, 1, -7], type: 'discovery' },
  ], [])

  return (
    <>
      <color attach="background" args={[palette.sky]} />
      <fog attach="fog" args={[palette.sky, 42, 128]} />
      <DayNight quality={quality} />
      <Environment preset={quality === 'high' ? 'sunset' : 'city'} environmentIntensity={.45} />
      <Physics gravity={[0, -18, 0]} paused={paused} timeStep="vary">
        <WorldTerrain planet={planet} palette={palette} quality={quality} />
        <CapitalCity planet={planet} palette={palette} interactions={interactions} />
        <DetailedCapital palette={palette} />
        <Player interactions={interactions} />
        <NpcPopulation planet={planet} event={event} />
        <Wildlife quality={quality} />
        <WorldEvent planet={planet} event={event} palette={palette} />
      </Physics>
      <WeatherSystem3D planet={planet} quality={quality} />
      {quality === 'high' && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={.28} luminanceThreshold={.85} mipmapBlur />
          <Noise opacity={.018} />
          <Vignette eskil={false} offset={.18} darkness={.5} />
        </EffectComposer>
      )}
    </>
  )
}

function DayNight({ quality }) {
  const sun = useRef()
  const moon = useRef()
  const ambient = useRef()
  useFrame(({ clock }) => {
    const angle = clock.elapsedTime * .018 + .7
    const x = Math.cos(angle) * 55
    const y = Math.sin(angle) * 35 + 12
    if (sun.current) {
      sun.current.position.set(x, Math.max(y, -5), -25)
      sun.current.intensity = THREE.MathUtils.lerp(.08, quality === 'high' ? 3 : 2, THREE.MathUtils.smoothstep(y, -2, 20))
    }
    if (moon.current) moon.current.position.set(-x, Math.max(-y + 18, 5), 20)
    if (ambient.current) ambient.current.intensity = THREE.MathUtils.lerp(.35, 1.1, THREE.MathUtils.smoothstep(y, -5, 20))
  })
  return (
    <>
      <hemisphereLight ref={ambient} args={['#c8ddff', '#392955', .8]} />
      <directionalLight ref={sun} castShadow={quality === 'high'} intensity={1.8} color="#fff1ca" shadow-mapSize={[quality === 'high' ? 2048 : 512, quality === 'high' ? 2048 : 512]} shadow-camera-far={90} shadow-camera-left={-45} shadow-camera-right={45} shadow-camera-top={45} shadow-camera-bottom={-45} />
      <pointLight ref={moon} color="#8ca7ff" intensity={1.2} distance={100} />
    </>
  )
}

function createTerrain(seed) {
  const geometry = new THREE.PlaneGeometry(120, 120, 72, 72)
  geometry.rotateX(-Math.PI / 2)
  const positions = geometry.attributes.position
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i)
    const z = positions.getZ(i)
    const distance = Math.sqrt(x * x + z * z)
    let height = Math.sin(x * .12 + seed) * .38 + Math.cos(z * .15 - seed) * .3
    height += Math.sin((x + z) * .07) * .42
    height += Math.max(0, distance - 32) * .075
    height += Math.exp(-((x + 31) ** 2 + (z + 25) ** 2) / 180) * 13
    height += Math.exp(-((x - 35) ** 2 + (z - 28) ** 2) / 130) * 9
    if (Math.abs(x) < 15 && z > -25 && z < 18) height *= .22
    positions.setY(i, height)
  }
  geometry.computeVertexNormals()
  return geometry
}

function WorldTerrain({ planet, palette, quality }) {
  const terrain = useMemo(() => createTerrain(planet.seed * .017), [planet.seed])
  const treeCount = quality === 'high' ? 90 : 45
  return (
    <group>
      <RigidBody type="fixed" colliders="trimesh" friction={1}>
        <mesh geometry={terrain} receiveShadow>
          <meshStandardMaterial color={palette.ground} roughness={.92} metalness={0} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders={false} friction={1}>
        <CuboidCollider args={[60, .2, 60]} position={[0, -.25, 0]} />
      </RigidBody>
      <ChocolateRiver color={palette.river} />
      <InstancedForest count={treeCount} planet={planet} palette={palette} />
      <RockField count={quality === 'high' ? 65 : 28} planet={planet} />
      <FloatingIslands planet={planet} palette={palette} />
      <RegionLabels />
      <Sparkles count={quality === 'high' ? 100 : 45} scale={[100, 18, 100]} size={2} speed={.18} color={palette.accent} opacity={.35} />
    </group>
  )
}

function ChocolateRiver({ color }) {
  const material = useRef()
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-46, .25, 28),
    new THREE.Vector3(-19, .2, 14),
    new THREE.Vector3(5, .18, 12),
    new THREE.Vector3(22, .22, -4),
    new THREE.Vector3(48, .3, -18),
  ]), [])
  const geometry = useMemo(() => {
    const segments = 96
    const width = 6.5
    const positions = []
    const uvs = []
    const indices = []
    for (let index = 0; index <= segments; index++) {
      const t = index / segments
      const point = curve.getPoint(t)
      const tangent = curve.getTangent(t)
      const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize()
      const left = point.clone().addScaledVector(side, width / 2)
      const right = point.clone().addScaledVector(side, -width / 2)
      positions.push(left.x, .32, left.z, right.x, .32, right.z)
      uvs.push(0, t * 8, 1, t * 8)
      if (index < segments) {
        const base = index * 2
        indices.push(base, base + 2, base + 1, base + 2, base + 3, base + 1)
      }
    }
    const river = new THREE.BufferGeometry()
    river.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    river.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    river.setIndex(indices)
    river.computeVertexNormals()
    return river
  }, [curve])
  useFrame(({ clock }) => {
    if (material.current) {
      material.current.distortion = .32 + Math.sin(clock.elapsedTime * 1.3) * .08
      material.current.time = clock.elapsedTime
    }
  })
  return (
    <group>
      <mesh geometry={geometry} position={[0, .2, 0]} receiveShadow>
        <MeshReflectorMaterial
          ref={material}
          color={color}
          roughness={.23}
          metalness={.12}
          mirror={.28}
          resolution={512}
          blur={[180, 55]}
          mixBlur={1}
          mixStrength={1.2}
          depthScale={.7}
          minDepthThreshold={.3}
          maxDepthThreshold={1.5}
        />
      </mesh>
      <Bridge position={[5, .7, 12]} rotation={[0, -.7, 0]} />
      <Waterfall color={color} />
    </group>
  )
}

function Bridge({ position, rotation }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position} rotation={rotation}>
      <group>
        {Array.from({ length: 11 }, (_, index) => (
          <mesh key={index} castShadow receiveShadow position={[(index - 5) * .62, Math.cos((index - 5) * .25) * .15, 0]}>
            <boxGeometry args={[.52, .18, 3.5]} />
            <meshStandardMaterial color={index % 2 ? '#d8a968' : '#f2d99d'} roughness={.8} />
          </mesh>
        ))}
        <mesh position={[0, .75, 1.7]}><boxGeometry args={[7, .12, .12]} /><meshStandardMaterial color="#6b3f30" /></mesh>
        <mesh position={[0, .75, -1.7]}><boxGeometry args={[7, .12, .12]} /><meshStandardMaterial color="#6b3f30" /></mesh>
      </group>
    </RigidBody>
  )
}

function Waterfall({ color }) {
  const stream = useRef()
  useFrame(({ clock }) => {
    if (stream.current) stream.current.material.emissiveIntensity = .08 + Math.sin(clock.elapsedTime * 2) * .05
  })
  return (
    <group position={[38, 4.5, -12]}>
      <mesh castShadow><cylinderGeometry args={[5, 7, 9, 20]} /><meshStandardMaterial color="#64517f" roughness={.95} /></mesh>
      <mesh ref={stream} position={[-2.5, 0, 4.7]} rotation={[0, 0, .04]}>
        <planeGeometry args={[3.2, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={.1} transparent opacity={.88} side={THREE.DoubleSide} />
      </mesh>
      <Sparkles count={25} scale={[5, 6, 4]} size={3} speed={.6} color="#fff1b7" />
    </group>
  )
}

function InstancedForest({ count, planet, palette }) {
  const trunks = useRef()
  const crowns = useRef()
  const fruit = useRef()
  const data = useMemo(() => Array.from({ length: count }, (_, index) => {
    const side = seeded(planet.seed, index * 3) > .5 ? 1 : -1
    const x = side * (16 + seeded(planet.seed, index * 7) * 40)
    const z = -38 + seeded(planet.seed, index * 11) * 80
    const scale = .65 + seeded(planet.seed, index * 13) * 1.25
    return { x, z, scale, twist: seeded(planet.seed, index * 17) * Math.PI }
  }), [count, planet.seed])
  useEffect(() => {
    const matrix = new THREE.Matrix4()
    data.forEach((tree, index) => {
      matrix.compose(new THREE.Vector3(tree.x, tree.scale * 1.6, tree.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, tree.twist, planet.indexes[1] === 1 ? Math.PI / 2 : 0)), new THREE.Vector3(tree.scale, tree.scale, tree.scale))
      trunks.current.setMatrixAt(index, matrix)
      matrix.compose(new THREE.Vector3(tree.x, tree.scale * 3.7, tree.z), new THREE.Quaternion(), new THREE.Vector3(tree.scale, tree.scale, tree.scale))
      crowns.current.setMatrixAt(index, matrix)
      matrix.compose(new THREE.Vector3(tree.x + .8 * tree.scale, tree.scale * 4.1, tree.z + .5), new THREE.Quaternion(), new THREE.Vector3(tree.scale * .32, tree.scale * .32, tree.scale * .32))
      fruit.current.setMatrixAt(index, matrix)
    })
    trunks.current.instanceMatrix.needsUpdate = true
    crowns.current.instanceMatrix.needsUpdate = true
    fruit.current.instanceMatrix.needsUpdate = true
  }, [data, planet.indexes])
  return (
    <group>
      <instancedMesh ref={trunks} args={[null, null, count]} castShadow receiveShadow>
        <cylinderGeometry args={[.35, .62, 3.2, 7]} />
        <meshStandardMaterial color="#71472f" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[null, null, count]} castShadow>
        <dodecahedronGeometry args={[1.6, 1]} />
        <meshStandardMaterial color={palette.dark} roughness={.88} />
      </instancedMesh>
      <instancedMesh ref={fruit} args={[null, null, count]} castShadow>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color={planet.indexes[3] === 3 ? '#ffd9ee' : palette.accent} emissive={palette.accent} emissiveIntensity={.08} />
      </instancedMesh>
    </group>
  )
}

function RockField({ count, planet }) {
  const ref = useRef()
  useEffect(() => {
    const matrix = new THREE.Matrix4()
    for (let i = 0; i < count; i++) {
      const x = -55 + seeded(planet.seed, 200 + i) * 110
      const z = -55 + seeded(planet.seed, 400 + i) * 110
      const scale = .25 + seeded(planet.seed, 600 + i) * 1.4
      matrix.compose(new THREE.Vector3(x, scale * .45, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(seeded(planet.seed, 700 + i), seeded(planet.seed, 800 + i), 0)), new THREE.Vector3(scale, scale * .7, scale))
      ref.current.setMatrixAt(i, matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [count, planet.seed])
  return <instancedMesh ref={ref} args={[null, null, count]} castShadow receiveShadow><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#71647d" roughness={1} /></instancedMesh>
}

function FloatingIslands({ planet, palette }) {
  const floating = planet.indexes[1] === 0 || planet.indexes[1] === 4 || planet.indexes[1] === 7
  if (!floating) return null
  return (
    <group>
      {[[25,18,22],[-28,13,-5],[8,23,-32]].map((position, index) => (
        <Float key={index} speed={.7 + index * .2} rotationIntensity={.08} floatIntensity={1.2}>
          <group position={position}>
            <mesh castShadow><coneGeometry args={[7 - index, 10, 10]} /><meshStandardMaterial color={palette.dark} roughness={.9} /></mesh>
            <mesh position={[0, 4.7, 0]} castShadow><cylinderGeometry args={[6.8 - index, 5.4 - index, 1.3, 12]} /><meshStandardMaterial color={palette.ground} /></mesh>
            <mesh position={[0, 7, 0]}><torusGeometry args={[2.5, .16, 8, 32]} /><meshStandardMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={.6} /></mesh>
          </group>
        </Float>
      ))}
    </group>
  )
}

function RegionLabels() {
  return REGION_POSITIONS.map((region) => (
    <Billboard key={region.name} position={[region.x, 5, region.z]} follow lockX={false} lockY={false} lockZ={false}>
      <Text fontSize={.62} color="#fff" outlineWidth={.05} outlineColor="#2b1f3e" anchorX="center">
        {region.name.toUpperCase()}
      </Text>
    </Billboard>
  ))
}

function CapitalCity({ planet, palette, interactions }) {
  return (
    <group>
      <Palace palette={palette} ruler={planet.indexes[2]} />
      <Market palette={palette} />
      <PizzaShrine position={interactions.find((item) => item.id === 'shrine').position} accent={palette.accent} />
      <DanceStage position={interactions.find((item) => item.id === 'stage').position} accent={palette.accent} />
      <FlyingTaxi position={interactions.find((item) => item.id === 'taxi').position} palette={palette} />
      <Crown position={interactions.find((item) => item.id === 'crown').position} />
      <VillageBuildings planet={planet} palette={palette} />
    </group>
  )
}

function DetailedCapital({ palette }) {
  const group = useRef()
  const { scene, animations } = useGLTF(CITY)
  const clone = useMemo(() => {
    const copy = scene.clone(true)
    copy.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        child.material = child.material.clone()
        if (child.material.color) child.material.color.lerp(new THREE.Color(palette.architecture), .08)
      }
    })
    return copy
  }, [palette.architecture, scene])
  const { actions } = useAnimations(animations, group)
  useEffect(() => {
    const animation = Object.values(actions)[0]
    animation?.play()
    return () => animation?.stop()
  }, [actions])
  return <group ref={group} position={[27, .15, -31]} rotation={[0, -.72, 0]} scale={.012}><primitive object={clone} /></group>
}

function Palace({ palette, ruler }) {
  const sideways = ruler === 3
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[1, 0, -22]}>
      <group rotation={[0, 0, sideways ? -.08 : 0]}>
        <mesh castShadow receiveShadow position={[0, 3.5, 0]}><boxGeometry args={[12, 7, 8]} /><meshStandardMaterial color={palette.architecture} roughness={.55} /></mesh>
        <mesh castShadow position={[0, 8.7, 0]}><cylinderGeometry args={[1.2, 7.3, 5.2, 6]} /><meshStandardMaterial color={palette.accent} roughness={.48} /></mesh>
        {[-5, 5].map((x) => <group key={x} position={[x, 5, 0]}><mesh castShadow><cylinderGeometry args={[1.5, 2, 9, 10]} /><meshStandardMaterial color={palette.architecture} /></mesh><mesh position={[0, 5.3, 0]} castShadow><coneGeometry args={[2.3, 3.4, 8]} /><meshStandardMaterial color={palette.accent} /></mesh></group>)}
        <mesh position={[0, 2, 4.05]}><boxGeometry args={[3.2, 4, .3]} /><meshStandardMaterial color="#312344" /></mesh>
        {[-3.8, 0, 3.8].map((x) => <mesh key={x} position={[x, 4.8, 4.12]}><circleGeometry args={[.75, 20]} /><meshStandardMaterial color="#bff4ff" emissive="#76d7ff" emissiveIntensity={.3} /></mesh>)}
      </group>
    </RigidBody>
  )
}

function Market({ palette }) {
  return (
    <group position={[-8, 0, 2]}>
      {[-5, 0, 5].map((x, index) => (
        <RigidBody key={x} type="fixed" colliders="cuboid" position={[x, 0, index % 2 ? 3 : 0]}>
          <group>
            <mesh position={[0, 1.5, 0]} castShadow><boxGeometry args={[3.8, 3, 3.2]} /><meshStandardMaterial color={index % 2 ? '#f5bd70' : palette.architecture} roughness={.7} /></mesh>
            <mesh position={[0, 3.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[3.1, 2.2, 4]} /><meshStandardMaterial color={index % 2 ? palette.accent : '#ef7189'} /></mesh>
            <mesh position={[0, 1.5, 1.63]}><planeGeometry args={[2.1, 1.4]} /><meshStandardMaterial color="#281f38" /></mesh>
          </group>
        </RigidBody>
      ))}
    </group>
  )
}

function VillageBuildings({ planet, palette }) {
  const positions = [[-19,0,8],[18,0,8],[-15,0,-12],[15,0,-12],[22,0,18],[-25,0,20]]
  return positions.map((position, index) => (
    <RigidBody key={index} type="fixed" colliders="cuboid" position={position} rotation={[0, seeded(planet.seed,index)*Math.PI, planet.indexes[1] === 1 && index % 2 ? Math.PI / 2 : 0]}>
      <group>
        <mesh castShadow receiveShadow position={[0, 1.8, 0]}><cylinderGeometry args={[2.4, 2.8, 3.6, 8]} /><meshStandardMaterial color={index % 2 ? palette.architecture : '#efe4c4'} roughness={.8} /></mesh>
        <mesh castShadow position={[0, 4.1, 0]}><coneGeometry args={[3.1, 2.5, 8]} /><meshStandardMaterial color={index % 3 ? palette.accent : '#f06f8b'} /></mesh>
        <mesh position={[0, 1.6, 2.58]}><boxGeometry args={[1, 2.1, .2]} /><meshStandardMaterial color="#483456" /></mesh>
      </group>
    </RigidBody>
  ))
}

function PizzaShrine({ position, accent }) {
  return (
    <group position={position}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, .6, 0]} castShadow><cylinderGeometry args={[2.8, 3.4, 1.2, 10]} /><meshStandardMaterial color="#6f5b81" /></mesh>
        <mesh position={[0, 3, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow><coneGeometry args={[2.8, .5, 3]} /><meshStandardMaterial color="#f1bd55" emissive={accent} emissiveIntensity={.15} /></mesh>
        {[[0,3.25,.2],[.7,3.24,-.4],[-.7,3.24,-.3]].map((p,index)=><mesh key={index} position={p} rotation={[-Math.PI/2,0,0]}><cylinderGeometry args={[.22,.22,.08,10]} /><meshStandardMaterial color="#d84c4c" /></mesh>)}
      </RigidBody>
      <pointLight position={[0,4,0]} color={accent} intensity={2} distance={8} />
    </group>
  )
}

function DanceStage({ position, accent }) {
  return (
    <group position={position}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0,.35,0]} receiveShadow><cylinderGeometry args={[4,4.6,.7,24]} /><meshStandardMaterial color="#3b2d58" /></mesh>
      </RigidBody>
      {Array.from({length:8},(_,i)=><mesh key={i} position={[Math.cos(i/8*Math.PI*2)*3,.75,Math.sin(i/8*Math.PI*2)*3]}><boxGeometry args={[.6,.06,.6]} /><meshStandardMaterial color={i%2?accent:'#70e0c4'} emissive={i%2?accent:'#70e0c4'} emissiveIntensity={.8} /></mesh>)}
    </group>
  )
}

function FlyingTaxi({ position, palette }) {
  return (
    <Float speed={2} floatIntensity={.5} rotationIntensity={.08}>
      <group position={[position[0], 2.2, position[2]]}>
        <mesh castShadow><capsuleGeometry args={[1.4,.9,8,16]} /><meshStandardMaterial color="#ffcf5b" metalness={.25} roughness={.4} /></mesh>
        <mesh position={[0,.55,0]}><sphereGeometry args={[1,16,12,0,Math.PI*2,0,Math.PI/2]} /><meshStandardMaterial color="#9de9ff" transparent opacity={.72} metalness={.2} /></mesh>
        {[-1.8,1.8].map((x)=><mesh key={x} position={[x,-.1,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.45,.12,8,20]} /><meshStandardMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={.8} /></mesh>)}
      </group>
    </Float>
  )
}

function Crown({ position }) {
  return (
    <Float speed={2} floatIntensity={.8}>
      <group position={[position[0], 1.4, position[2]]}>
        <mesh rotation={[0,0,Math.PI]} castShadow><cylinderGeometry args={[.7,.95,.7,8]} /><meshStandardMaterial color="#ffd24d" metalness={.7} roughness={.2} emissive="#ffb72e" emissiveIntensity={.3} /></mesh>
        <pointLight color="#ffd24d" intensity={2.5} distance={6} />
      </group>
    </Float>
  )
}

function RobotModel({ animation = 'Idle', color, scale = .42 }) {
  const group = useRef()
  const { scene, animations } = useGLTF(ROBOT)
  const clone = useMemo(() => {
    const copy = SkeletonUtils.clone(scene)
    copy.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        child.material = child.material.clone()
        if (color && child.material.color) child.material.color.lerp(new THREE.Color(color), .28)
      }
    })
    return copy
  }, [scene, color])
  const { actions } = useAnimations(animations, group)
  useEffect(() => {
    const action = actions[animation] ?? actions.Idle
    action?.reset().fadeIn(.2).play()
    return () => action?.fadeOut(.2)
  }, [actions, animation])
  return <group ref={group} scale={scale}><primitive object={clone} /></group>
}

function FantasyPlayerModel({ animation = 'Idle' }) {
  const group = useRef()
  const { scene, animations } = useGLTF(KNIGHT)
  const clone = useMemo(() => {
    const copy = SkeletonUtils.clone(scene)
    copy.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        child.material = child.material.clone()
      }
    })
    return copy
  }, [scene])
  const { actions } = useAnimations(animations, group)
  const clipName = {
    Idle: 'Idle',
    Walking: 'Walking_A',
    Running: 'Running_A',
    Jump: 'Jump_Full_Short',
    Dance: 'Cheer',
  }[animation] ?? 'Idle'
  useEffect(() => {
    const action = actions[clipName] ?? actions.Idle
    action?.reset().fadeIn(.16).play()
    return () => action?.fadeOut(.16)
  }, [actions, clipName])
  return <group ref={group} scale={.78} rotation={[0, Math.PI, 0]}><primitive object={clone} /></group>
}

function Player({ interactions }) {
  const body = useRef()
  const model = useRef()
  const keys = useRef({})
  const yaw = useRef(0)
  const pitch = useRef(.22)
  const dragging = useRef(false)
  const nearest = useRef(null)
  const currentRegion = useRef(null)
  const [animation, setAnimation] = useState('Idle')
  const { camera, gl, size } = useThree()
  const setPrompt = useGameStore((state) => state.setPrompt)
  const setLocation = useGameStore((state) => state.setLocation)
  const setDialogue = useGameStore((state) => state.setDialogue)
  const paused = useGameStore((state) => state.paused)
  const mobileMove = useGameStore((state) => state.mobileMove)
  const interactQueued = useGameStore((state) => state.interactQueued)
  const consumeInteract = useGameStore((state) => state.consumeInteract)
  const discover = useGameStore((state) => state.discover)

  useEffect(() => {
    const mobile = size.width <= 700
    // Three.js cameras are mutable scene objects and must be updated in place
    // eslint-disable-next-line react/immutability
    camera.fov = mobile ? 66 : 54
    // eslint-disable-next-line react/immutability
    camera.userData.distance = mobile ? 13 : 9
    pitch.current = mobile ? .34 : .22
    // eslint-disable-next-line react/immutability
    camera.updateProjectionMatrix()
  }, [camera, size.width])

  const activate = useCallback((item) => {
    if (!item) return
    if (item.type === 'npc') {
      const lines = dialogues[item.dialogue]
      setDialogue({ speaker: item.id === 'king' ? 'KING ZORB' : item.id === 'chef' ? 'CHEF RIBBIT' : 'CAPTAIN WADDLES', text: lines[Math.floor(Math.random() * lines.length)] })
    } else {
      discover(item.id)
      const discoveryText = {
        river: 'The river flows with the flavour chosen for this world and glows after sunset',
        shrine: 'The ancient shrine hums whenever food falls from the sky',
        crown: 'The royal crown is kept on a mountain because nobody wants to carry it home',
        stage: 'Every citizen learns the planet law on this glowing stage',
      }
      setDialogue({ speaker: 'WORLD DISCOVERY', text: discoveryText[item.id] ?? 'You found something the guidebook definitely forgot to mention' })
    }
  }, [discover, setDialogue])

  useEffect(() => {
    const down = (e) => {
      keys.current[e.code] = true
      if (e.code === 'KeyE') activate(nearest.current)
      if (e.code === 'Escape') document.exitPointerLock?.()
    }
    const up = (e) => { keys.current[e.code] = false }
    const pointer = (e) => {
      if (document.pointerLockElement === gl.domElement || dragging.current) {
        yaw.current -= e.movementX * .0028
        pitch.current = THREE.MathUtils.clamp(pitch.current - e.movementY * .0022, .08, .78)
      }
    }
    const wheel = (e) => { camera.userData.distance = THREE.MathUtils.clamp((camera.userData.distance ?? 9) + e.deltaY * .006, 7, 16) }
    const startDrag = () => { dragging.current = true }
    const stopDrag = () => { dragging.current = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('pointermove', pointer)
    window.addEventListener('pointerup', stopDrag)
    gl.domElement.addEventListener('pointerdown', startDrag)
    gl.domElement.addEventListener('dblclick', () => gl.domElement.requestPointerLock?.())
    gl.domElement.addEventListener('wheel', wheel)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('pointermove', pointer)
      window.removeEventListener('pointerup', stopDrag)
      gl.domElement.removeEventListener('pointerdown', startDrag)
      gl.domElement.removeEventListener('wheel', wheel)
    }
  }, [gl, camera, activate])

  useFrame((_, delta) => {
    if (!body.current || paused) return
    const position = body.current.translation()
    const velocity = body.current.linvel()
    const forwardInput = (keys.current.KeyW ? 1 : 0) - (keys.current.KeyS ? 1 : 0) - mobileMove.y
    const sideInput = (keys.current.KeyD ? 1 : 0) - (keys.current.KeyA ? 1 : 0) + mobileMove.x
    const moving = Math.abs(forwardInput) + Math.abs(sideInput) > .1
    const speed = 5.2
    const forward = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current))
    const right = new THREE.Vector3(Math.cos(yaw.current), 0, -Math.sin(yaw.current))
    const direction = forward.multiplyScalar(forwardInput).add(right.multiplyScalar(sideInput)).normalize()
    body.current.setGravityScale(1, true)
    const smoothing = 1 - Math.pow(.0008, delta)
    body.current.setLinvel({
      x: THREE.MathUtils.lerp(velocity.x, direction.x * speed, smoothing),
      y: velocity.y,
      z: THREE.MathUtils.lerp(velocity.z, direction.z * speed, smoothing),
    }, true)
    if (moving) setAnimation('Walking')
    else setAnimation('Idle')
    if (model.current && moving) {
      const targetRotation = Math.atan2(direction.x, direction.z)
      model.current.rotation.y = THREE.MathUtils.lerp(model.current.rotation.y, targetRotation, 1 - Math.pow(.001, delta))
    }
    const isMobile = size.width <= 700
    const distance = camera.userData.distance ?? (isMobile ? 13 : 9)
    const target = new THREE.Vector3(position.x, position.y + 1.1, position.z)
    const cameraTarget = new THREE.Vector3(
      target.x + Math.sin(yaw.current) * Math.cos(pitch.current) * distance,
      target.y + Math.sin(pitch.current) * distance + 1.4,
      target.z + Math.cos(yaw.current) * Math.cos(pitch.current) * distance,
    )
    camera.position.lerp(cameraTarget, 1 - Math.pow(.004, delta))
    camera.lookAt(target)
    let closest = null
    let closestDistance = 3.4
    for (const item of interactions) {
      const dist = Math.hypot(position.x - item.position[0], position.z - item.position[2])
      if (dist < closestDistance) { closest = item; closestDistance = dist }
    }
    if (closest?.id !== nearest.current?.id) {
      nearest.current = closest
      setPrompt(closest ? { id: closest.id, label: closest.label } : null)
    }
    let region = REGION_POSITIONS[0]
    let regionDistance = Infinity
    for (const candidate of REGION_POSITIONS) {
      const distanceToRegion = Math.hypot(position.x - candidate.x, position.z - candidate.z)
      if (distanceToRegion < regionDistance) {
        region = candidate
        regionDistance = distanceToRegion
      }
    }
    if (region.name !== currentRegion.current) {
      currentRegion.current = region.name
      setLocation(region.name)
    }
    if (interactQueued) {
      activate(nearest.current)
      consumeInteract()
    }
    if (position.y < -12) body.current.setTranslation({ x: 0, y: 3, z: 14 }, true)
  })

  return (
    <RigidBody ref={body} position={[0, 2.2, 14]} colliders={false} enabledRotations={[false,false,false]} linearDamping={4} friction={1} canSleep={false}>
      <CapsuleCollider args={[.75, .45]} position={[0, 1.1, 0]} />
      <group ref={model} position={[0, .35, 0]}>
        <FantasyPlayerModel animation={animation} />
      </group>
    </RigidBody>
  )
}

function NpcPopulation({ planet, event }) {
  const npcData = useMemo(() => [
    { id: 'king', position: [1, 0, -18], color: '#80e889', animation: 'Wave' },
    { id: 'chef', position: [-10, 0, 2], color: '#f4b75f', animation: 'Idle' },
    { id: 'taxi', position: [12, 0, 5], color: '#72b5f0', animation: 'Idle' },
    { id: 'guard-a', position: [-3, 0, -17], color: '#d783ed', animation: 'Walking' },
    { id: 'guard-b', position: [5, 0, -17], color: '#d783ed', animation: 'Walking' },
  ], [])
  return npcData.map((npc, index) => (
    <WanderingNpc key={npc.id} {...npc} animation={event?.id === 'dance' || planet.indexes[4] === 1 ? 'Dance' : npc.animation} radius={npc.id.includes('guard') ? 3 : 1.4} phase={index} />
  ))
}

function WanderingNpc({ position, color, animation, radius, phase }) {
  const group = useRef()
  useFrame(({ clock }) => {
    if (!group.current || animation === 'Dance' || radius < 2) return
    const t = clock.elapsedTime * .25 + phase
    group.current.position.x = position[0] + Math.sin(t) * radius
    group.current.position.z = position[2] + Math.cos(t) * radius
    group.current.rotation.y = t + Math.PI / 2
  })
  return <group ref={group} position={position} scale={.76}><RobotModel animation={animation} color={color} scale={.32} /></group>
}

function Wildlife() {
  const { scene, animations } = useGLTF(FOX)
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const group = useRef()
  const { actions } = useAnimations(animations, group)
  useEffect(() => {
    clone.traverse((child) => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true } })
    const run = actions.Run ?? actions.Walk ?? Object.values(actions)[0]
    run?.play()
    return () => run?.stop()
  }, [actions, clone])
  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.elapsedTime * .2
    group.current.position.set(-20 + Math.sin(t) * 8, .1, 18 + Math.cos(t) * 8)
    group.current.rotation.y = -t
  })
  return <group ref={group} scale={.02}><primitive object={clone} /></group>
}

function WeatherSystem3D({ planet, quality }) {
  const weather = planet.indexes[0]
  const count = quality === 'high' ? 90 : 40
  if (weather === 0) return <PizzaRain count={count} />
  if (weather === 2 || weather === 6) return <Sparkles count={count * 2} scale={[90,35,90]} size={weather === 6 ? 5 : 2.5} speed={weather === 6 ? .7 : .25} color={weather === 6 ? '#ff9ee4' : '#fff'} />
  if (weather === 5) return <BubbleWeather count={count} />
  return <CloudWeather storm={weather === 1} />
}

function PizzaRain({ count }) {
  const group = useRef()
  const data = useMemo(() => Array.from({ length: count }, (_, i) => ({
    x: -45 + seeded(12, i) * 90, y: 8 + seeded(22, i) * 30, z: -45 + seeded(33, i) * 90, speed: 2 + seeded(44, i) * 3,
  })), [count])
  useFrame((_, delta) => {
    group.current.children.forEach((slice, i) => {
      slice.position.y -= data[i].speed * delta
      slice.rotation.x += delta
      slice.rotation.z += delta * .5
      if (slice.position.y < .2) slice.position.y = 25 + seeded(Date.now(), i) * 20
    })
  })
  return <group ref={group}>{data.map((item,index)=><mesh key={index} position={[item.x,item.y,item.z]} castShadow><coneGeometry args={[.36,.12,3]} /><meshStandardMaterial color="#f2bd51" /></mesh>)}</group>
}

function BubbleWeather({ count }) {
  const group = useRef()
  useFrame(({clock}) => {
    group.current.children.forEach((bubble,index) => {
      bubble.position.y = ((clock.elapsedTime * (.5 + index % 4 * .1) + index * 2) % 28)
      bubble.position.x += Math.sin(clock.elapsedTime + index) * .001
    })
  })
  return <group ref={group}>{Array.from({length:count},(_,i)=><mesh key={i} position={[-40+seeded(5,i)*80,seeded(6,i)*25,-40+seeded(7,i)*80]}><sphereGeometry args={[.2+seeded(8,i)*.7,10,10]} /><meshPhysicalMaterial color={i%2?'#b9f7ff':'#ffc5ee'} transparent opacity={.34} transmission={.5} roughness={0} /></mesh>)}</group>
}

function CloudWeather({ storm }) {
  return <group>{Array.from({length:12},(_,i)=><Float key={i} speed={.25} floatIntensity={.5}><group position={[-50+i*10,18+Math.sin(i)*5,-20+(i%4)*15]}><mesh scale={[4,1.2,2]}><sphereGeometry args={[1,12,10]} /><meshStandardMaterial color={storm?'#403b5f':'#fff4eb'} transparent opacity={.75} /></mesh>{storm&&i%3===0&&<pointLight color="#b99cff" intensity={3} distance={14} />}</group></Float>)}</group>
}

function WorldEvent({ event, palette }) {
  if (!event) return null
  if (event.id === 'meteor') return <MeteorEvent palette={palette} />
  if (event.id === 'reverse') return <Sparkles count={250} scale={[80,40,80]} size={6} speed={2} color="#a98bff" />
  return <group position={[7,2,-7]}><pointLight color={palette.accent} intensity={8} distance={28} /><Sparkles count={160} scale={[18,8,18]} size={5} speed={2} color={palette.accent} /></group>
}

function MeteorEvent({ palette }) {
  const meteor = useRef()
  const [landed, setLanded] = useState(false)
  useFrame((_,delta)=>{
    if(!meteor.current||landed)return
    meteor.current.position.x-=delta*12
    meteor.current.position.y-=delta*10
    meteor.current.rotation.x+=delta*3
    if(meteor.current.position.y<1.7)setLanded(true)
  })
  return <group>{!landed?<mesh ref={meteor} position={[25,28,-12]} castShadow><icosahedronGeometry args={[2.2,2]} /><meshStandardMaterial color="#d94f4e" emissive="#ff8b45" emissiveIntensity={1.5} /></mesh>:<group position={[-7,1.5,-12]}><pointLight color="#ff7749" intensity={12} distance={35} /><Sparkles count={220} scale={[14,8,14]} size={8} speed={3} color={palette.accent} /><mesh rotation={[-Math.PI/2,0,0]}><ringGeometry args={[2,6,32]} /><meshBasicMaterial color="#ff8c49" transparent opacity={.65} side={THREE.DoubleSide} /></mesh></group>}</group>
}

function GameHud({ planet, sound, setSound, onGuide, onMenu }) {
  const location = useGameStore((state) => state.location)
  const prompt = useGameStore((state) => state.prompt)
  const dialogue = useGameStore((state) => state.dialogue)
  const setDialogue = useGameStore((state) => state.setDialogue)
  const togglePause = useGameStore((state) => state.togglePause)
  return (
    <div className="game-hud">
      <div className="game-identity"><span>NOW EXPLORING</span><strong>{planet.name}</strong><small><Compass /> {location}</small></div>
      <div className="game-top-actions">
        <button onClick={onGuide} aria-label="Open world guide"><Info/></button>
        <button onClick={() => setSound(!sound)} aria-label="Toggle sound">{sound?<Volume2/>:<VolumeX/>}</button>
        <button onClick={()=>{togglePause();onMenu()}} aria-label="Open menu"><Menu/></button>
      </div>
      <MiniMap />
      <button className="world-guide-button" onClick={onGuide}><Info/><span><small>YOUR WORLD</small>Explore the details</span></button>
      <div className="control-hint"><kbd>WASD</kbd> Roam <kbd>DRAG</kbd> Look around <kbd>E</kbd> Discover <span>Scroll to zoom</span></div>
      {prompt && <div className="interaction-prompt"><kbd>E</kbd><span>{prompt.label}</span></div>}
      {dialogue && <div className="game-dialogue"><span>{dialogue.speaker}</span><p>{dialogue.text}</p><button onClick={()=>setDialogue(null)}>KEEP EXPLORING <Check /></button></div>}
    </div>
  )
}

function MiniMap() {
  return <div className="mini-map"><div className="mini-map-terrain">{REGION_POSITIONS.map((region,index)=><i key={region.name} style={{left:`${50+region.x*.65}%`,top:`${50+region.z*.65}%`}} title={region.name}>{index===0?'◆':'•'}</i>)}<b /></div><span><Map/> LIVE MAP</span></div>
}

function MobileControls() {
  const setMobileMove = useGameStore((state)=>state.setMobileMove)
  const queueInteract = useGameStore((state)=>state.queueInteract)
  const knob = useRef()
  const active = useRef(false)
  const move = (event) => {
    if(!active.current)return
    const rect=event.currentTarget.getBoundingClientRect()
    const x=THREE.MathUtils.clamp((event.clientX-(rect.left+rect.width/2))/(rect.width*.38),-1,1)
    const y=THREE.MathUtils.clamp((event.clientY-(rect.top+rect.height/2))/(rect.height*.38),-1,1)
    setMobileMove({x,y})
    if(knob.current)knob.current.style.transform=`translate(${x*27}px,${y*27}px)`
  }
  const stop=()=>{active.current=false;setMobileMove({x:0,y:0});if(knob.current)knob.current.style.transform='translate(0,0)'}
  return <div className="mobile-game-controls"><div className="virtual-joystick" onPointerDown={(e)=>{active.current=true;e.currentTarget.setPointerCapture(e.pointerId);move(e)}} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop}><i ref={knob}/><span>ROAM</span></div><button className="mobile-interact" onClick={queueInteract}><Eye/>LOOK</button></div>
}

function WorldGuide({ planet, onClose }) {
  const discoveries=useGameStore((state)=>state.discoveries)
  return <div className="game-modal-backdrop"><article className="quest-journal world-guide"><button className="game-modal-close" onClick={onClose}><X/></button><span>VISITOR GUIDE • PLANET {planet.name}</span><h2>YOUR NEW<br/>WORLD</h2><div className="world-traits">{planet.answers.map((answer,index)=><section key={answer.title}><small>{['WEATHER','GRAVITY','RULER','LOCAL FOOD','SUPREME LAW'][index]}</small><h3>{answer.title}</h3><p>{answer.desc}</p></section>)}</div><section><small>PLACES YOU HAVE NOTICED</small>{discoveries.length?discoveries.map(item=><p key={item} className="discovery-row"><Check/> {item}</p>):<p className="empty-journal">Roam toward glowing landmarks and curious locals to learn their stories</p>}</section></article></div>
}

function PauseMenu({quality,setQuality,onClose,onAgain,onSurprise,onShare,onChange,copied}) {
  const setPaused=useGameStore((state)=>state.setPaused)
  const close=()=>{setPaused(false);onClose()}
  return <div className="game-modal-backdrop"><article className="pause-menu"><span>EXPLORATION PAUSED</span><h2>TAKE YOUR<br/>TIME</h2><button className="resume-game" onClick={close}><Play fill="currentColor"/> RESUME EXPLORING</button><div className="quality-setting"><Settings/><span><b>VISUAL QUALITY</b><small>Use Smooth on older phones</small></span><select value={quality} onChange={(e)=>setQuality(e.target.value)}><option value="high">Beautiful</option><option value="low">Smooth</option></select></div><div className="pause-links"><button onClick={()=>onChange(0)}><RotateCcw/>Change planet</button><button onClick={onSurprise}><SparklesIcon/>New universe</button><button onClick={onShare}><Check/> {copied?'Link copied':'Share world'}</button><button onClick={onAgain}><ArrowLeft/>Exit to builder</button></div></article></div>
}

function WebGLFallback({ onAgain }) {
  return <div className="webgl-fallback"><span>3D WORLD OFFLINE</span><h2>YOUR BROWSER<br/>LOST ITS GRAVITY</h2><p>This world needs WebGL so try enabling hardware acceleration or opening KRSNA.FUN in a modern browser</p><button onClick={onAgain}><ArrowLeft/> Return to the planet lab</button></div>
}

useGLTF.preload(ROBOT)
useGLTF.preload(FOX)
