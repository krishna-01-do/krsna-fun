import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, ChevronRight, Download, Edit3, Map,
  MapPin, Moon, RotateCcw, Share2, Sparkles, Sun, Users, X, Zap,
} from 'lucide-react'
import './LivingUniverse.css'

const weatherNames = ['Pizza Monsoon', 'Cocoa Thunder', 'Rainbow Snow', 'Endless Golden Hour', 'Pet Drizzle', 'Bubble Cyclones', 'Glitter Fog', 'Noodle Storms']
const cities = ['Crumb City', 'Ganache Bay', 'Prism Peak', 'Sundown Central', 'Pawston', 'Bubbleburg', 'Shimmer City', 'Noodle Junction']
const currencies = ['crispy crusts', 'cocoa beans', 'prism chips', 'bottled sunsets', 'tiny bells', 'soap coins', 'sparkle dust', 'emergency forks']
const transports = ['sideways pizza cabs', 'wafer ferries', 'rainbow sleds', 'sunbeam scooters', 'cloud kennels', 'bubble gondolas', 'glitter gliders', 'noodle rails']
const sports = ['competitive cloud-catching', 'synchronized river slurping', 'uphill floating', 'professional dramatic entrances', 'zero-gravity fetch', 'bubble sumo', 'extreme hat balancing', 'speed spaghetti untangling']
const traditions = ['apologizing to breakfast before eating it', 'waving at the moon exactly seventeen times', 'wearing shoes on their elbows every Friday', 'holding a parade whenever somebody sneezes', 'giving every doorway a birthday', 'singing to bridges before crossing', 'electing a new national spoon weekly', 'sleeping upside-down during soup season']
const economies = ['Suspiciously Booming', 'Powered Entirely by Snacks', 'Mostly Barter, Some Yodelling', 'Held Together by Coupons', 'Emotionally Stable-ish', 'Three Ducks Away from Recession', '100% Glitter-Backed', 'Nobody Has Checked']
const anthems = ['One Extremely Long Kazoo Note', 'The Ballad of the Missing Left Sock', 'Please Stand for the Funky Bit', 'A Gentle Scream in B-flat', 'Quack Quack, Hooray!', 'Four Minutes of Pots and Pans', 'Oops! All Trumpets', 'The Forks Are Marching Home']

const eventTemplates = [
  { id: 'meteor', title: 'CRUMB EMERGENCY!', text: 'A giant snack meteor has landed in the town square. Scientists are bringing napkins.' },
  { id: 'dance', title: 'UNPLANNED DANCE BREAK', text: 'The entire population has started dancing uncontrollably. Productivity is up somehow.' },
  { id: 'nogravity', title: 'GRAVITY CLOCKED OUT', text: 'Gravity has left for a fifteen-minute break. Please secure all sandwiches.' },
  { id: 'flood', title: 'THE RIVER IS FEELING DRAMATIC', text: 'The local food river has flooded the capital. Citizens describe it as “pretty tasty.”' },
  { id: 'parade', title: 'SURPRISE PARADE', text: 'Nobody knows what the parade is for. Nobody wants to be the one who asks.' },
  { id: 'giant', title: 'A VERY LARGE VISITOR', text: 'A colossal tourist is blocking the sunset while looking for the gift shop.' },
]

const rulerDialogue = [
  ['Ribbit. That means “lower taxes.” Probably.', 'I have three degrees and zero pockets.', 'Please address me as Professor Your Frogginess.'],
  ['The meeting is cancelled. It is nap o’clock.', 'Your petition has been pushed off the table.', 'I saw that. I am judging you.'],
  ['I thought this was a taxi. Now I run a planet.', 'Does anyone know where the ice is?', 'My policy is: remain calm and waddle.'],
  ['Diplomacy, but make it funky.', 'No talking until the bass drops.', 'Earth has terrible dance zoning.'],
  ['I may be a potato, but I have layers of policy.', 'The crown is heavier than it looks.', 'My cabinet is mostly root vegetables.'],
  ['QUACK! A powerful and nuanced position.', 'Bread subsidies begin immediately.', 'My approval rating is waterproof.'],
  ['Your toast is ready. Also, parliament is open.', 'I have calculated: vibes are acceptable.', 'Please do not put a fork in the president.'],
  ['We are absolutely one tall leader.', 'The coat voted unanimously.', 'Please stop asking worm-related questions.'],
]

function seeded(seed, salt, max) {
  const x = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453
  return Math.floor((x - Math.floor(x)) * max)
}

function worldProfile(planet) {
  const [weather, gravity, ruler, food, law] = planet.indexes
  const population = `${(2 + seeded(planet.seed, 1, 87) / 10).toFixed(1)} billion`
  const rulerTitles = ['The Frog Republic', 'The Supreme Cat Council', 'The Accidental Penguin Monarchy', 'The Intergalactic Dance Party', 'The Royal Potato Kingdom', 'The Loud Duck Administration', 'The Toast-Based Democracy', 'Three Worms in a Trench Government']
  return {
    population,
    city: cities[weather],
    currency: `${seeded(planet.seed, 4, 900) + 100} million ${currencies[food]}`,
    economy: economies[(food + gravity) % economies.length],
    anthem: anthems[(ruler + law) % anthems.length],
    sport: sports[(gravity + food) % sports.length],
    transport: transports[(gravity + weather) % transports.length],
    tradition: traditions[(law + ruler) % traditions.length],
    government: rulerTitles[ruler],
    facts: [
      `The average citizen spends ${seeded(planet.seed, 7, 8) + 2} hours a day obeying “${planet.answers[4].title.toLowerCase()}.”`,
      `${weatherNames[weather]} has delayed exactly ${seeded(planet.seed, 9, 400) + 20} picnics this month.`,
      `Their scientists insist ${planet.answers[1].title.toLowerCase()} is a feature, not a catastrophic bug.`,
    ],
  }
}

export default function LivingUniverse({ planet, onAgain, onSurprise, onShare, onDownload, onChange, copied }) {
  const [phase, setPhase] = useState('travel')
  const [region, setRegion] = useState(null)
  const [dialogue, setDialogue] = useState(null)
  const [event, setEvent] = useState(null)
  const [time, setTime] = useState(9)
  const [profileOpen, setProfileOpen] = useState(false)
  const [changeOpen, setChangeOpen] = useState(false)
  const worldRef = useRef(null)
  const profile = useMemo(() => worldProfile(planet), [planet])
  const isNight = time >= 18 || time < 6

  useEffect(() => {
    const discover = setTimeout(() => setPhase('discover'), 1100)
    const land = setTimeout(() => setPhase('landed'), 2500)
    return () => { clearTimeout(discover); clearTimeout(land) }
  }, [])

  useEffect(() => {
    if (phase !== 'landed') return undefined
    const clock = setInterval(() => setTime((value) => (value + 1) % 24), 4500)
    return () => clearInterval(clock)
  }, [phase])

  const moveWorld = (eventObject) => {
    if (!worldRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = worldRef.current.getBoundingClientRect()
    worldRef.current.style.setProperty('--mx', `${((eventObject.clientX - rect.left) / rect.width - .5) * 18}px`)
    worldRef.current.style.setProperty('--my', `${((eventObject.clientY - rect.top) / rect.height - .5) * 12}px`)
  }

  const triggerEvent = (forced) => {
    const next = forced ?? eventTemplates[seeded(planet.seed + Date.now(), 2, eventTemplates.length)]
    setEvent(next)
    setDialogue(null)
    setTimeout(() => setEvent(null), 7200)
  }

  const speak = (kind = 'ruler') => {
    const lines = kind === 'ruler'
      ? rulerDialogue[planet.indexes[2]]
      : [
          `I moved here for the ${planet.answers[3].title.toLowerCase()}.`,
          `We don't talk about gravity after lunch.`,
          `I have obeyed the law for almost eleven minutes.`,
          `Tourist tip: never lick the public transport.`,
          `The ruler waved at me once. Or had a muscle spasm.`,
        ]
    setDialogue({ kind, text: lines[seeded(Date.now(), planet.seed, lines.length)] })
    setTimeout(() => setDialogue(null), 4600)
  }

  if (phase !== 'landed') {
    return <Cinematic phase={phase} planet={planet} onSkip={() => setPhase('landed')} />
  }

  return (
    <section className={`universe-shell ${isNight ? 'is-night' : 'is-day'} event-${event?.id ?? 'none'}`}>
      <div className="universe-topbar">
        <div>
          <span className="universe-kicker"><i /> LIVE WORLD • LOCAL TIME {String(time).padStart(2, '0')}:00</span>
          <h1>PLANET {planet.name}</h1>
          <p>{profile.city} • Population {profile.population} • Chaos {planet.chaos}%</p>
        </div>
        <div className="world-clock" title={isNight ? 'It is night on your planet' : 'It is daytime on your planet'}>
          {isNight ? <Moon /> : <Sun />}<span>{isNight ? 'NIGHT' : 'DAY'}</span>
        </div>
      </div>

      <div
        className={`world-viewport ${region ? `focus-${region.id}` : ''}`}
        ref={worldRef}
        onMouseMove={moveWorld}
        onMouseLeave={() => {
          worldRef.current?.style.setProperty('--mx', '0px')
          worldRef.current?.style.setProperty('--my', '0px')
        }}
      >
        <ProceduralWorld planet={planet} profile={profile} event={event} onSpeak={speak} />
        <WorldMarkers planet={planet} profile={profile} active={region} onSelect={setRegion} />
        <div className="world-help"><MapPin size={14} /> Tap a pulsing location to explore</div>
        {dialogue && <div className={`dialogue-bubble dialogue-${dialogue.kind}`}><button onClick={() => setDialogue(null)} aria-label="Close dialogue"><X /></button>“{dialogue.text}”<span /></div>}
        {event && (
          <div className="event-alert">
            <span><Zap size={14} /> LIVE CHAOS REPORT</span>
            <strong>{event.title}</strong>
            <p>{event.text}</p>
            <button onClick={() => setEvent(null)}><X /></button>
          </div>
        )}
        {region && <RegionPanel region={region} planet={planet} profile={profile} onClose={() => setRegion(null)} onSpeak={speak} onEvent={triggerEvent} />}
      </div>

      <div className="world-controls">
        <button className="happening-button" onClick={() => triggerEvent()}><Zap /> WHAT&apos;S HAPPENING TODAY?</button>
        <button onClick={() => setProfileOpen(true)}><Map /> Planet Profile</button>
        <button onClick={() => speak('local')}><Users /> Meet the Locals</button>
        <button onClick={() => setChangeOpen(!changeOpen)}><Edit3 /> Change My Planet</button>
        <button onClick={onShare}><Share2 /> {copied ? 'Link Copied!' : 'Share Universe'}</button>
      </div>

      {changeOpen && (
        <div className="change-drawer">
          <div><strong>Change one thing.</strong><span>Watch the whole world rebuild around it.</span></div>
          {['Weather', 'Gravity', 'Ruler', 'Food', 'Biggest law'].map((label, index) => (
            <button key={label} onClick={() => onChange(index)}><span>0{index + 1}</span>{label}<ChevronRight /></button>
          ))}
          <button className="drawer-close" onClick={() => setChangeOpen(false)}><X /></button>
        </div>
      )}

      <div className="universe-lower">
        <div className="fact-strip"><Sparkles /><span>UNBELIEVABLE BUT TRUE</span><strong>{planet.fact}</strong></div>
        <div className="universe-actions">
          <button onClick={onDownload}><Download /> Planet Passport</button>
          <button onClick={onSurprise}><Sparkles /> Visit Another Planet</button>
          <button onClick={onAgain}><RotateCcw /> Build From Scratch</button>
        </div>
      </div>

      {profileOpen && <PlanetProfile planet={planet} profile={profile} onClose={() => setProfileOpen(false)} onDownload={onDownload} />}
    </section>
  )
}

function Cinematic({ phase, planet, onSkip }) {
  return (
    <section className={`cinematic cinematic-${phase}`}>
      <div className="warp-stars">{Array.from({ length: 42 }, (_, i) => <i key={i} style={{ '--i': i }} />)}</div>
      <div className="ship-window"><span /><span /><span /></div>
      <div className="cinematic-copy">
        {phase === 'travel' ? (
          <><span>COORDINATES ACCEPTED</span><h1>JUMPING TO<br />QUESTIONABLE SPACE</h1><p>Hold onto something that has gravity.</p></>
        ) : (
          <><span>NEW PLANET DISCOVERED</span><h1>{planet.name}</h1><p>Atmosphere: breathable-ish • Vibes: immaculate</p></>
        )}
      </div>
      <div className="cinematic-planet" style={{ '--cinematic-tone': planet.answers[0].tone }}><i /><b /></div>
      <button className="skip-cinematic" onClick={onSkip}>SKIP THE DRAMA <ChevronRight /></button>
    </section>
  )
}

function ProceduralWorld({ planet, profile, event, onSpeak }) {
  const [weather, gravity, ruler, food, law] = planet.indexes
  const riverColors = ['#ffb333', '#5b261f', '#7e5cff', '#ff8f58', '#69b9ff', '#65d9df', '#f5a5ff', '#f2c75b']
  const groundColors = ['#6fd19a', '#d6a66d', '#62c8b2', '#dc8c79', '#a7d879', '#7ad8cb', '#9a85db', '#e6bd6e']
  const palette = {
    river: riverColors[food],
    ground: groundColors[(weather + food) % groundColors.length],
    accent: planet.answers[0].tone,
    building: ['#86d98b', '#ffad65', '#78a9e9', '#9c7df2', '#d4a15c', '#f4d34d', '#99a9bc', '#da7188'][ruler],
  }
  return (
    <svg className={`world-svg weather-${weather} gravity-world-${gravity} law-world-${law}`} viewBox="0 0 1200 720" role="img" aria-label={`Living landscape of planet ${planet.name}`}>
      <defs>
        <linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6f66dc" /><stop offset=".55" stopColor="#e69ac7" /><stop offset="1" stopColor="#ffd49d" /></linearGradient>
        <linearGradient id="skyNight" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#100d2a" /><stop offset="1" stopColor="#493977" /></linearGradient>
        <linearGradient id="waterGlow" x1="0" y1="0" x2="1" y2="1"><stop stopColor={palette.river} /><stop offset=".5" stopColor={palette.river} stopOpacity=".72" /><stop offset="1" stopColor="#fff1c2" /></linearGradient>
        <linearGradient id="groundLight" x1="0" y1="0" x2="0" y2="1"><stop stopColor={palette.ground} /><stop offset="1" stopColor="#236b66" /></linearGradient>
        <filter id="softShadow"><feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#17102d" floodOpacity=".35" /></filter>
        <filter id="glow"><feGaussianBlur stdDeviation="9" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <rect className="sky-day" width="1200" height="720" fill="url(#skyDay)" />
      <rect className="sky-night" width="1200" height="720" fill="url(#skyNight)" />
      <g className="star-field">{Array.from({ length: 25 }, (_, i) => <circle key={i} cx={(i * 97) % 1180} cy={(i * 53) % 340} r={i % 4 === 0 ? 2.4 : 1.2} fill="#fff" opacity={.35 + (i % 3) * .2} />)}</g>
      <g className="celestial">
        <circle className="world-sun" cx="965" cy="112" r="55" fill="#fff1a8" filter="url(#glow)" />
        <g className="world-moon"><circle cx="965" cy="112" r="38" fill="#e8e5ff" /><circle cx="979" cy="98" r="38" fill="#181333" /></g>
      </g>

      <g className="cloud-layer far">
        <Cloud x={100} y={140} scale={.8} food={weather} /><Cloud x={730} y={165} scale={1.1} food={weather} /><Cloud x={460} y={88} scale={.62} food={weather} />
      </g>
      <g className="far-mountains">
        <path d="M0 420 L160 245 L275 380 L430 210 L605 410 L775 250 L920 390 L1085 230 L1200 370 L1200 720 L0 720Z" fill="#574f92" opacity=".62" />
        <path d="M0 470 L145 330 L260 440 L390 300 L530 460 L700 330 L860 440 L1015 310 L1200 455 L1200 720 L0 720Z" fill="#7160a6" opacity=".72" />
        <g className="side-houses">
          <TinyHouse x={378} y={301} rotate={gravity === 1 ? 90 : 0} color={palette.building} />
          <TinyHouse x={1010} y={312} rotate={gravity === 7 ? 180 : 0} color={palette.accent} />
        </g>
      </g>

      <g className="floating-islands">
        <g transform="translate(102 270)"><path d="M0 20 Q75 -20 160 18 Q125 68 85 112 Q35 65 0 20" fill="#398b77" /><ellipse cx="80" cy="15" rx="80" ry="30" fill={palette.ground} /><TinyTree x={42} y={2} gravity={gravity} tone={palette.accent} /><TinyHouse x={88} y={-5} rotate={gravity === 7 ? 180 : 0} color={palette.building} /></g>
        <g transform="translate(930 245) scale(.72)"><path d="M0 20 Q75 -20 160 18 Q125 68 85 112 Q35 65 0 20" fill="#398b77" /><ellipse cx="80" cy="15" rx="80" ry="30" fill={palette.ground} /><TinyTree x={60} y={-4} gravity={gravity} tone={palette.accent} /></g>
      </g>

      <path className="world-ground" d="M0 480 Q160 420 305 472 Q440 520 590 450 Q735 380 900 454 Q1050 515 1200 450 L1200 720 L0 720Z" fill="url(#groundLight)" />
      <path className="ground-highlight" d="M0 504 Q170 446 310 490 Q450 540 600 469 Q742 403 900 474 Q1050 530 1200 473" fill="none" stroke="#b6f2bd" strokeOpacity=".36" strokeWidth="16" />

      <g className="river-system">
        <path className="food-river" d="M-40 620 C190 490 320 670 510 560 C695 450 820 635 1240 515 L1240 720 L-40 720Z" fill="url(#waterGlow)" />
        <path className="river-shine" d="M-20 618 C200 516 330 674 520 574 C715 470 845 630 1220 535" fill="none" stroke="#fff" strokeOpacity=".38" strokeWidth="7" strokeDasharray="20 34" />
        <WaferBridge x={650} y={522} tone={palette.building} />
        <FoodDetails food={food} />
      </g>

      <g className="forest-layer">
        {[70, 165, 255, 890, 985, 1080].map((x, i) => <TinyTree key={x} x={x} y={i % 2 ? 488 : 520} gravity={gravity} tone={i % 2 ? palette.accent : '#ffb6c8'} food={food} />)}
      </g>

      <g className="capital" filter="url(#softShadow)">
        <Capital x={520} y={300} ruler={ruler} tone={palette.building} accent={palette.accent} />
        <text x="600" y="438" textAnchor="middle" className="city-label">{profile.city.toUpperCase()}</text>
      </g>

      <g className="citizens">
        <Citizen x={440} y={522} tone="#ffca63" law={law} gravity={gravity} onClick={() => onSpeak('local')} />
        <Citizen x={500} y={548} tone="#6ad4d1" law={law} gravity={gravity} onClick={() => onSpeak('local')} />
        <Citizen x={770} y={510} tone="#fa7b9d" law={law} gravity={gravity} onClick={() => onSpeak('local')} />
        <Citizen x={835} y={550} tone="#9c88ff" law={law} gravity={gravity} onClick={() => onSpeak('local')} />
        <RulerCharacter x={596} y={405} ruler={ruler} tone={palette.building} onClick={() => onSpeak('ruler')} />
      </g>

      <g className="vehicles">
        <g className="flying-car"><path d="M0 15 Q10 0 42 4 L64 16 L55 28 L8 27Z" fill="#ffcf58" /><circle cx="17" cy="29" r="7" fill="#2a2540" /><circle cx="48" cy="29" r="7" fill="#2a2540" /><path d="M13 4 L25 -9 L43 4Z" fill="#a8efff" /></g>
        <g className="sky-creature"><path d="M0 12 Q15 -10 30 12 Q45 -10 62 12 Q45 5 31 22 Q17 5 0 12Z" fill="#ffe6a3" /></g>
      </g>

      <WeatherSystem weather={weather} />
      <LawDetails law={law} />
      {event && <EventLayer event={event} />}
      <rect className="world-vignette" width="1200" height="720" fill="none" />
    </svg>
  )
}

function Cloud({ x, y, scale, food }) {
  if (food === 0) return <g className="world-cloud pizza-cloud" transform={`translate(${x} ${y}) scale(${scale})`}><path d="M0 15 L120 0 L68 105Z" fill="#f2bb55" stroke="#8c4939" strokeWidth="6" /><path d="M0 15 Q55 -12 120 0" fill="none" stroke="#f8e39e" strokeWidth="16" /><circle cx="52" cy="28" r="9" fill="#d94b49" /><circle cx="76" cy="48" r="8" fill="#d94b49" /><circle cx="46" cy="68" r="7" fill="#d94b49" /></g>
  return <g className="world-cloud" transform={`translate(${x} ${y}) scale(${scale})`}><ellipse cx="25" cy="26" rx="35" ry="22" fill="#fff" opacity=".8" /><ellipse cx="65" cy="18" rx="45" ry="31" fill="#fff" opacity=".88" /><ellipse cx="112" cy="29" rx="39" ry="23" fill="#fff" opacity=".8" /><rect x="20" y="25" width="93" height="26" rx="13" fill="#fff" opacity=".82" /></g>
}

function TinyHouse({ x, y, rotate = 0, color }) {
  return <g transform={`translate(${x} ${y}) rotate(${rotate} 25 40)`}><rect x="2" y="18" width="48" height="38" rx="6" fill={color} /><path d="M-5 21 L25 -5 L57 21Z" fill="#4d366b" /><rect x="20" y="34" width="13" height="22" rx="3" fill="#ffe69a" /><rect x="6" y="29" width="10" height="10" rx="2" fill="#bdf4ff" /></g>
}

function TinyTree({ x, y, gravity, tone, food = 0 }) {
  const rotate = gravity === 1 ? -82 : gravity === 7 ? 180 : gravity === 2 ? 15 : 0
  return <g className="tiny-tree" transform={`translate(${x} ${y}) rotate(${rotate} 0 45)`}><path d="M0 55 Q7 25 3 -2" fill="none" stroke="#684431" strokeWidth="10" strokeLinecap="round" />{food === 3 ? <g fill="#ffd8ed"><circle cx="-15" cy="-6" r="17" /><circle cx="10" cy="-12" r="19" /><circle cx="22" cy="5" r="15" /></g> : <g fill={tone}><circle cx="-14" cy="-5" r="20" /><circle cx="11" cy="-12" r="24" /><circle cx="25" cy="8" r="17" /></g>}</g>
}

function WaferBridge({ x, y, tone }) {
  return <g transform={`translate(${x} ${y}) rotate(-12)`}><path d="M0 26 Q60 -26 135 18" fill="none" stroke={tone} strokeWidth="20" /><path d="M5 19 Q62 -23 130 12" fill="none" stroke="#fff1c2" strokeWidth="5" strokeDasharray="12 8" /><path d="M18 25 L12 48 M112 16 L123 42" stroke="#6d4735" strokeWidth="8" /></g>
}

function FoodDetails({ food }) {
  if (food === 1) return <g className="food-details chocolate-falls"><path d="M1020 390 Q1080 420 1120 390 L1110 540 Q1075 575 1028 540Z" fill="#6a2d25" /><path d="M1028 400 Q1070 425 1112 398" fill="none" stroke="#e59b72" strokeWidth="8" /></g>
  if (food === 2) return <g className="food-details burgers">{[150, 350, 980].map((x) => <g key={x} transform={`translate(${x} 400)`}><path d="M0 20 Q25 -8 50 20" fill="#e3a34b" /><rect y="20" width="50" height="9" rx="4" fill="#6db65f" /><rect y="29" width="50" height="12" rx="5" fill="#7b3e30" /><path d="M0 41 Q25 55 50 41" fill="#efbd62" /></g>)}</g>
  if (food === 4) return <g className="food-details spaghetti-clouds" stroke="#f6d37a" strokeWidth="6" fill="none">{[160, 920].map((x) => <path key={x} d={`M${x} 350 q80 50 10 110 q-50 40 20 75`} />)}</g>
  if (food === 5) return <g className="food-details pancake-mountain"><path d="M880 500 L980 375 L1080 500Z" fill="#d99a4c" /><path d="M900 480 Q980 450 1060 480 M920 450 Q980 425 1040 450 M940 420 Q980 400 1020 420" stroke="#ffe09a" strokeWidth="11" fill="none" /></g>
  if (food === 6) return <g className="food-details popcorn-volcano"><path d="M900 510 L970 375 L1040 510Z" fill="#7f5967" /><g fill="#fff0aa">{[930, 960, 990, 1020].map((x, i) => <circle key={x} cx={x} cy={355 - (i % 2) * 22} r="15" />)}</g></g>
  return <g className="food-details river-bites">{[220, 395, 860, 1050].map((x, i) => <circle key={x} cx={x} cy={625 - (i % 2) * 25} r="12" fill="#fff0a6" opacity=".8" />)}</g>
}

function Capital({ x, y, ruler, tone, accent }) {
  const tops = ruler === 0 ? 'M36 42 Q60 -5 84 42' : ruler === 1 ? 'M34 42 L45 2 L60 27 L78 2 L88 42' : ruler === 2 ? 'M36 42 Q60 0 84 42' : ruler === 3 ? 'M28 42 L60 -10 L94 42' : ruler === 4 ? 'M27 42 L40 5 L55 25 L70 0 L88 26 L100 5 L108 42' : ruler === 5 ? 'M30 42 Q60 12 90 42' : 'M28 42 L38 4 L52 28 L68 0 L84 28 L98 4 L108 42'
  return <g transform={`translate(${x} ${y})`}><ellipse cx="80" cy="136" rx="118" ry="25" fill="#251b43" opacity=".28" /><rect x="18" y="38" width="125" height="102" rx="15" fill={tone} /><path d={tops} fill={accent} /><rect x="55" y="78" width="52" height="62" rx="24" fill="#30234e" /><rect x="28" y="62" width="20" height="27" rx="10" fill="#c7f5ff" /><rect x="115" y="62" width="20" height="27" rx="10" fill="#c7f5ff" /><path d="M-5 140 H166" stroke="#f8d47d" strokeWidth="10" strokeLinecap="round" /><g className="palace-flags"><path d="M80 6 V-45" stroke="#3c2e5e" strokeWidth="5" /><path d="M83 -44 Q118 -35 83 -21Z" fill="#ffd052" /></g></g>
}

function Citizen({ x, y, tone, law, gravity, onClick }) {
  const rotate = gravity === 1 ? 90 : gravity === 7 ? 180 : 0
  return <g className={`citizen law-${law}`} transform={`translate(${x} ${y}) rotate(${rotate})`} onClick={onClick} onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && onClick()} role="button" aria-label="Talk to local citizen" tabIndex="0"><ellipse cx="0" cy="27" rx="18" ry="25" fill={tone} /><circle cy="-1" r="17" fill="#ffe2b8" /><circle cx="-6" cy="-3" r="2.5" fill="#2c2340" /><circle cx="6" cy="-3" r="2.5" fill="#2c2340" /><path d="M-5 6 Q0 11 6 6" fill="none" stroke="#2c2340" strokeWidth="2.5" /><path className="citizen-arm left" d="M-15 18 L-28 32" stroke={tone} strokeWidth="8" strokeLinecap="round" /><path className="citizen-arm right" d="M15 18 L27 29" stroke={tone} strokeWidth="8" strokeLinecap="round" />{law === 4 && <path d="M-18 -15 L0 -38 L20 -15Z" fill="#ffce58" stroke="#5c3f73" strokeWidth="3" />}</g>
}

function RulerCharacter({ x, y, ruler, onClick }) {
  const shapes = [
    <g key="frog"><ellipse cy="8" rx="24" ry="22" fill="#66c76b" /><circle cx="-13" cy="-14" r="10" fill="#66c76b" /><circle cx="13" cy="-14" r="10" fill="#66c76b" /></g>,
    <g key="cat"><path d="M-22 -8 L-16 -32 L-3 -17 L12 -32 L22 -8 V22 Q0 38 -22 22Z" fill="#e69b55" /></g>,
    <g key="penguin"><ellipse cy="4" rx="22" ry="30" fill="#263247" /><ellipse cy="9" rx="13" ry="21" fill="#f7f2df" /><path d="M-7 -5 L8 -5 L0 3Z" fill="#f4b33f" /></g>,
    <g key="alien"><ellipse cy="0" rx="22" ry="29" fill="#7ce38d" /><ellipse cx="-9" cy="-6" rx="6" ry="10" fill="#201b38" /><ellipse cx="9" cy="-6" rx="6" ry="10" fill="#201b38" /></g>,
    <g key="potato"><path d="M-22 -20 Q12 -34 25 -5 Q32 25 2 31 Q-26 27 -24 0Z" fill="#b98955" /><circle cx="-8" cy="-4" r="3" fill="#4b382d" /><circle cx="10" cy="-3" r="3" fill="#4b382d" /></g>,
    <g key="duck"><ellipse cy="6" rx="24" ry="28" fill="#f2d34d" /><path d="M-6 -3 H25 L8 8Z" fill="#ef8d38" /><circle cx="-9" cy="-8" r="3" fill="#2d263a" /></g>,
    <g key="robot"><rect x="-22" y="-25" width="44" height="45" rx="8" fill="#9aabc1" /><circle cx="-8" cy="-7" r="5" fill="#66f2e2" /><circle cx="9" cy="-7" r="5" fill="#66f2e2" /><path d="M-10 8 H11" stroke="#263247" strokeWidth="4" /></g>,
    <g key="worms"><path d="M-13 25 Q-28 0 -11 -18 Q6 -2 -2 25 M2 25 Q-7 -5 8 -22 Q25 -5 16 25 M14 25 Q10 0 25 -12 Q39 6 29 25" fill="none" stroke="#e26c82" strokeWidth="12" strokeLinecap="round" /></g>,
  ]
  return <g className="ruler-character" transform={`translate(${x} ${y})`} onClick={onClick} onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && onClick()} role="button" aria-label="Talk to the planet's ruler" tabIndex="0">{shapes[ruler]}<path d="M-18 -28 L-9 -44 L0 -31 L10 -45 L20 -28Z" fill="#ffd45b" stroke="#8b6126" strokeWidth="2" /><ellipse cy="32" rx="28" ry="7" fill="#271d42" opacity=".25" /></g>
}

function WeatherSystem({ weather }) {
  if (weather === 0) return <g className="weather-system pizza-rain">{Array.from({ length: 12 }, (_, i) => <g key={i} style={{ '--i': i }}><path d="M0 0 L20 5 L7 27Z" fill="#f4c252" stroke="#8d4f36" strokeWidth="2" /><circle cx="8" cy="8" r="2.5" fill="#d44c48" /></g>)}</g>
  if (weather === 1) return <g className="weather-system cocoa-storm"><path d="M315 120 L278 190 L326 180 L290 255" fill="none" stroke="#ffe26c" strokeWidth="8" /><g>{Array.from({ length: 15 }, (_, i) => <path key={i} style={{ '--i': i }} d="M0 0 Q8 12 0 19 Q-8 12 0 0Z" fill="#612d2a" />)}</g></g>
  if (weather === 2) return <g className="weather-system rainbow-snow">{Array.from({ length: 22 }, (_, i) => <circle key={i} style={{ '--i': i }} r={4 + i % 4} fill={['#ff6f91','#ffd45c','#63d4b2','#7e75f2'][i % 4]} />)}</g>
  if (weather === 4) return <g className="weather-system pet-rain">{Array.from({ length: 8 }, (_, i) => <g key={i} style={{ '--i': i }}><circle r="10" fill={i % 2 ? '#e9aa61' : '#e9e3da'} /><path d="M-8 -5 L-13 -15 L-2 -10 M8 -5 L13 -15 L2 -10" fill={i % 2 ? '#e9aa61' : '#e9e3da'} /></g>)}</g>
  if (weather === 5) return <g className="weather-system bubbles">{Array.from({ length: 16 }, (_, i) => <circle key={i} style={{ '--i': i }} r={9 + i % 12} fill="none" stroke={i % 2 ? '#b7fbff' : '#ffd5f1'} strokeWidth="3" />)}</g>
  if (weather === 6) return <g className="weather-system glitter">{Array.from({ length: 24 }, (_, i) => <path key={i} style={{ '--i': i }} d="M0 -8 L3 -2 L9 0 L3 3 L0 9 L-3 3 L-9 0 L-3 -2Z" fill={i % 2 ? '#ffd65e' : '#ff9ee2'} />)}</g>
  if (weather === 7) return <g className="weather-system noodles">{Array.from({ length: 12 }, (_, i) => <path key={i} style={{ '--i': i }} d="M0 0 Q20 20 0 40 Q-20 60 0 80" fill="none" stroke="#f6d26b" strokeWidth="5" strokeLinecap="round" />)}</g>
  return null
}

function LawDetails({ law }) {
  const signs = ['NO BORING WALKING', 'DANCE, THEN TALK', 'NO MONDAYS', 'NAP ZONE', 'HAT CHECK', 'BAD JOKES ONLY', 'SOCK POLICE', 'FANFARE PLEASE']
  return <g className="law-details" transform="translate(280 485)"><path d="M0 70 V0" stroke="#563e3e" strokeWidth="8" /><rect x="-73" y="-10" width="146" height="47" rx="8" fill="#fff1bd" stroke="#563e3e" strokeWidth="4" /><text x="0" y="18" textAnchor="middle">{signs[law]}</text></g>
}

function EventLayer({ event }) {
  if (event.id === 'meteor') return <g className="event-layer meteor-event"><circle cx="950" cy="500" r="66" fill="#e7674d" /><path d="M920 460 L760 280" stroke="#ffcf57" strokeWidth="35" strokeLinecap="round" opacity=".7" /></g>
  if (event.id === 'giant') return <g className="event-layer giant-event"><circle cx="1040" cy="230" r="70" fill="#8ed8bd" /><rect x="970" y="295" width="140" height="270" rx="60" fill="#7657c8" /><circle cx="1015" cy="220" r="8" fill="#241c39" /><circle cx="1065" cy="220" r="8" fill="#241c39" /></g>
  if (event.id === 'parade') return <g className="event-layer parade-event">{[0,1,2,3,4].map((i) => <g key={i} transform={`translate(${350 + i * 90} ${570 - i % 2 * 20})`}><path d="M0 0 V-75" stroke="#fff" strokeWidth="5" /><path d="M3 -74 Q50 -65 3 -38Z" fill={['#ff6e8c','#ffd052','#6addc0','#9b83ff','#ff9c63'][i]} /></g>)}</g>
  return null
}

function WorldMarkers({ planet, profile, active, onSelect }) {
  const regions = [
    { id: 'capital', label: profile.city, type: 'CAPITAL CITY', x: '52%', y: '46%', title: `${planet.answers[2].title} run this town`, detail: `Every important decision in ${profile.city} is settled by ${planet.answers[4].title.toLowerCase()}. City hall has issued seventeen apologies today.` },
    { id: 'falls', label: `${planet.answers[3].title.split(' ')[0]} Falls`, type: 'NATURAL WONDER', x: '86%', y: '58%', title: `The tastiest danger on ${planet.name}`, detail: `A roaring river of ${planet.answers[3].title.toLowerCase()} supplies the entire planet. Swimming is discouraged but suspiciously popular.` },
    { id: 'highlands', label: weatherNames[planet.indexes[0]], type: 'WEATHER ZONE', x: '20%', y: '34%', title: 'Bring an umbrella. And courage.', detail: `${planet.answers[0].title} here every afternoon. The locals consider it normal and sell premium viewing helmets.` },
    { id: 'forest', label: 'The Lawful Wilds', type: 'FORBIDDEN FOREST', x: '17%', y: '69%', title: `Even the trees obey the law`, detail: `${planet.answers[4].title} applies to plants too. Park rangers have arrested two bushes and a suspicious fern.` },
  ]
  return <>{regions.map((item) => <button key={item.id} className={`world-marker marker-${item.id} ${active?.id === item.id ? 'active' : ''}`} style={{ left: item.x, top: item.y }} onClick={() => onSelect(item)}><i /><span><small>{item.type}</small>{item.label}</span></button>)}</>
}

function RegionPanel({ region, planet, profile, onClose, onSpeak, onEvent }) {
  const interaction = region.id === 'capital' ? 'Ring the palace bell' : region.id === 'falls' ? 'Taste the river' : region.id === 'highlands' ? 'Touch the weather' : 'Ask a tree for advice'
  return (
    <aside className="region-panel">
      <button className="region-close" onClick={onClose}><ArrowLeft /> BACK TO WORLD</button>
      <span>{region.type}</span>
      <h2>{region.label}</h2>
      <h3>{region.title}</h3>
      <p>{region.detail}</p>
      <div className="region-mini-stats">
        <div><small>LOCAL DANGER</small><strong>{31 + seeded(planet.seed, region.id.length, 67)}%</strong></div>
        <div><small>GIFT SHOP</small><strong>{region.id === 'forest' ? 'Probably cursed' : 'Open-ish'}</strong></div>
      </div>
      <button className="region-action" onClick={() => onEvent(eventTemplates[(region.id.length + planet.seed) % eventTemplates.length])}><Zap /> {interaction}</button>
      <button className="region-local" onClick={() => onSpeak(region.id === 'capital' ? 'ruler' : 'local')}><Users /> Talk to somebody suspicious</button>
      <p className="region-note">{profile.transport} depart every nine minutes, except during lunch.</p>
    </aside>
  )
}

function PlanetProfile({ planet, profile, onClose, onDownload }) {
  return (
    <div className="profile-backdrop" onClick={onClose}>
      <article className="planet-profile" onClick={(event) => event.stopPropagation()}>
        <button className="profile-close" onClick={onClose}><X /></button>
        <header><span>KRSNA.FUN • OFFICIAL PLANET PASSPORT</span><h2>{planet.name}</h2><p>INTERGALACTIC FILE #{String(planet.seed).padStart(4, '0')}</p></header>
        <div className="passport-stamp"><Map /> <b>VISITED</b><span>{profile.city}</span></div>
        <div className="profile-grid">
          <ProfileItem label="GOVERNMENT" value={profile.government} />
          <ProfileItem label="POPULATION" value={profile.population} />
          <ProfileItem label="CAPITAL" value={profile.city} />
          <ProfileItem label="CURRENCY" value={profile.currency} />
          <ProfileItem label="ECONOMY" value={profile.economy} />
          <ProfileItem label="MAIN TRANSPORT" value={profile.transport} />
          <ProfileItem label="NATIONAL SPORT" value={profile.sport} />
          <ProfileItem label="NATIONAL ANTHEM" value={profile.anthem} />
          <ProfileItem label="WEIRDEST TRADITION" value={profile.tradition} wide />
          <ProfileItem label="SUPREME LAW" value={planet.answers[4].title} wide />
        </div>
        <div className="profile-facts"><span>THREE THINGS TOURISM DOESN&apos;T WANT YOU TO KNOW</span>{profile.facts.map((fact, index) => <p key={fact}><b>0{index + 1}</b>{fact}</p>)}</div>
        <div className="passport-scores"><span>HAPPINESS <b>{planet.happiness}%</b></span><span>CHAOS <b>{planet.chaos}%</b></span></div>
        <button className="download-passport" onClick={onDownload}><Download /> DOWNLOAD MY PLANET CARD</button>
      </article>
    </div>
  )
}

function ProfileItem({ label, value, wide }) {
  return <div className={wide ? 'wide' : ''}><span>{label}</span><strong>{value}</strong></div>
}
