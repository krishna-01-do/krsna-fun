import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowRight, Check, Globe2, Heart, Home, Menu,
  MousePointer2, Play, Shuffle, Sparkles, Star, Volume2, VolumeX, X, Zap,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import './App.css'

const ThreeDUniverse = lazy(() => import('./game/ThreeDUniverse'))

const questions = [
  {
    key: 'weather',
    kicker: 'THE SKY IS BEING WEIRD',
    title: "What's the weather like?",
    options: [
      { emoji: '🍕', title: "It's raining pizza", desc: 'Mostly pepperoni, light crust after 6.', tone: '#ff7452' },
      { emoji: '🍫', title: 'Chocolate thunderstorms', desc: 'Delicious. Slightly sticky. Very loud.', tone: '#8b5a3c' },
      { emoji: '🌈', title: 'Rainbow snow', desc: 'Cold, colourful, tastes like Tuesdays.', tone: '#7357ff' },
      { emoji: '🌅', title: 'Permanent sunset', desc: 'Golden hour. Every hour. Forever.', tone: '#f9789c' },
      { emoji: '🐈', title: 'Cats & dogs', desc: 'Literally falling from the sky. Gently.', tone: '#42a5ef' },
      { emoji: '🫧', title: 'Bubble tornadoes', desc: 'Very dramatic. Smells like strawberries.', tone: '#31bea8' },
      { emoji: '✨', title: 'Glitter fog', desc: 'Visibility: zero. Fabulousness: maximum.', tone: '#e34ecb' },
      { emoji: '🍜', title: 'Noodle monsoon', desc: 'Bring an umbrella and a very large fork.', tone: '#ef9e35' },
    ],
  },
  {
    key: 'gravity',
    kicker: 'PHYSICS HAS LEFT THE CHAT',
    title: 'What happens to gravity?',
    options: [
      { emoji: '🎈', title: 'Everyone floats', desc: 'Doorways are now merely suggestions.', tone: '#4b8cf7' },
      { emoji: '➡️', title: 'Everything falls sideways', desc: 'The east side is getting crowded.', tone: '#f26965' },
      { emoji: '🔄', title: 'Changes every 10 seconds', desc: 'Hold onto something. No, something else.', tone: '#714ee8' },
      { emoji: '🍩', title: 'Only food has gravity', desc: 'Donuts are surprisingly dependable.', tone: '#ed6596' },
      { emoji: '🏖️', title: 'Gravity is on vacation', desc: 'It left a note. Back eventually. Maybe.', tone: '#26ad98' },
      { emoji: '🕺', title: 'Works only while dancing', desc: 'The moonwalk is now public transport.', tone: '#f18b2f' },
      { emoji: '🧲', title: 'Attracted to silliness', desc: 'Bad jokes carry serious weight.', tone: '#e14954' },
      { emoji: '⬆️', title: 'Up is the new down', desc: 'Ceilings are premium real estate.', tone: '#3e70d9' },
    ],
  },
  {
    key: 'ruler',
    kicker: 'SOMEONE HAS TO BE IN CHARGE',
    title: 'Who runs this place?',
    options: [
      { emoji: '🐸', title: 'Intelligent frogs', desc: 'They have tiny glasses and huge opinions.', tone: '#4cad61' },
      { emoji: '🐈', title: 'A council of cats', desc: 'Meetings are mostly naps and judgement.', tone: '#f09d3a' },
      { emoji: '🐧', title: 'One confused penguin', desc: 'Nobody elected him. Including him.', tone: '#397cca' },
      { emoji: '👽', title: 'Dancing aliens', desc: 'All laws must have a four-on-the-floor beat.', tone: '#6b52db' },
      { emoji: '🥔', title: 'A crowned potato', desc: 'Starchy, fair, beloved by the people.', tone: '#a76b3f' },
      { emoji: '🦆', title: 'A loud duck', desc: 'Every speech is just QUACK, but inspiring.', tone: '#eab742' },
      { emoji: '🤖', title: 'A polite toaster', desc: 'Firmly pro-breakfast. Anti-soggy bread.', tone: '#68778b' },
      { emoji: '🐛', title: 'Three worms in a coat', desc: 'Surprisingly competent economic policy.', tone: '#dc6674' },
    ],
  },
  {
    key: 'food',
    kicker: 'IMPORTANT CIVILISATION STUFF',
    title: "What's the main food?",
    options: [
      { emoji: '🍕', title: 'Unlimited pizza', desc: 'The crust is renewable energy.', tone: '#ee6550' },
      { emoji: '🍫', title: 'Chocolate rivers', desc: 'Bridges exist, but nobody uses them.', tone: '#8e593c' },
      { emoji: '🍔', title: 'Flying burgers', desc: 'Dinner migration season is beautiful.', tone: '#e49039' },
      { emoji: '🍦', title: 'Ice cream trees', desc: 'Watch out for brain-freeze season.', tone: '#e96a9b' },
      { emoji: '🍝', title: 'Spaghetti clouds', desc: 'Forecast: saucy with a chance of meatballs.', tone: '#dc5d45' },
      { emoji: '🥞', title: 'Pancake mountains', desc: 'Maple syrup avalanches are a real concern.', tone: '#c98a39' },
      { emoji: '🍿', title: 'Popcorn volcanoes', desc: 'Eruptions mean movie night.', tone: '#e2b33e' },
      { emoji: '🥐', title: 'Moon croissants', desc: 'Flaky, mysterious, excellent with coffee.', tone: '#d89948' },
    ],
  },
  {
    key: 'law',
    kicker: 'THE VERY SERIOUS RULEBOOK',
    title: "What's the biggest law?",
    options: [
      { emoji: '🦀', title: 'No normal walking', desc: 'Skip, moonwalk or crab-walk. Choose wisely.', tone: '#e2514d' },
      { emoji: '💃', title: 'Dance before speaking', desc: 'Courtrooms take absolutely forever.', tone: '#d94fa4' },
      { emoji: '📅', title: 'Mondays are illegal', desc: 'Tuesday is nervous but staying quiet.', tone: '#5c78dd' },
      { emoji: '😴', title: 'Naps are compulsory', desc: 'Productivity has never been cozier.', tone: '#8368d8' },
      { emoji: '🤠', title: 'Silly hats at all times', desc: 'Top hats count double on tax day.', tone: '#c4773d' },
      { emoji: '🤣', title: 'One bad joke daily', desc: 'Pun enforcement is extremely strict.', tone: '#e69b25' },
      { emoji: '🧦', title: 'Mismatched socks only', desc: 'Matching pairs are immediately separated.', tone: '#3b9a9a' },
      { emoji: '🎺', title: 'Entrances need fanfare', desc: 'Buying milk has become quite theatrical.', tone: '#db6240' },
    ],
  },
]

const activities = [
  { title: "Build a Planet That Shouldn't Exist", desc: 'Five choices. One deeply questionable world.', icon: '🪐', className: 'planet-card', live: true },
  { title: 'The Useless Button', desc: 'It does nothing. Until it does too much.', icon: '🔴', className: 'red-card' },
  { title: 'What Does Your Name Look Like?', desc: 'Finally, your name gets a weird little face.', icon: '🫠', className: 'yellow-card' },
  { title: 'The Tiny Life Simulator', desc: 'A whole tiny life. Questionable tiny choices.', icon: '🏡', className: 'green-card' },
  { title: 'The Internet Time Machine', desc: 'Visit the web in years that never happened.', icon: '💾', className: 'blue-card' },
  { title: 'What If...?', desc: 'Serious answers to deeply unserious questions.', icon: '💭', className: 'pink-card' },
  { title: 'Random Superpower Machine', desc: 'Incredible powers. Almost zero usefulness.', icon: '⚡', className: 'purple-card' },
  { title: 'Make a Weird Creature', desc: 'Nature had rules. You do not.', icon: '🦖', className: 'orange-card' },
]

const nameStarts = ['Pizz', 'Wobble', 'Zorp', 'Bongo', 'Fluff', 'Quirk', 'Noodle', 'Bonk', 'Gloop', 'Disco']
const nameEnds = ['atron', 'opolis', 'onia', 'topia', 'aroo', 'ulon', 'berry', ' Prime', ' IX', '-9000']
const funFacts = [
  'Its national anthem is just one extremely long kazoo note.',
  'The moon is legally classified as a snack.',
  'Nobody knows where the spoons come from. They just appear.',
  'The planet celebrates its birthday every Thursday.',
  'All doors say “nice!” when opened.',
  'Its scientists recently discovered the colour Thursday.',
  'The local currency is compliments and shiny buttons.',
  'There are no mosquitoes. This is its greatest achievement.',
]
const currentYear = new Date().getFullYear()

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)]
}

function ping(frequency = 480, duration = 0.09, enabled = true) {
  if (!enabled) return
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return
  const ctx = new AudioContext()
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.4, ctx.currentTime + duration)
  gain.gain.setValueAtTime(0.055, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  oscillator.connect(gain).connect(ctx.destination)
  oscillator.start()
  oscillator.stop(ctx.currentTime + duration)
  oscillator.addEventListener('ended', () => ctx.close())
}

function App() {
  const [view, setView] = useState('home')
  const [step, setStep] = useState(0)
  const [choices, setChoices] = useState([])
  const [planet, setPlanet] = useState(null)
  const [sound, setSound] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [chaosMode, setChaosMode] = useState(false)
  const topRef = useRef(null)

  const scrollTop = () => requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth' }))

  const start = () => {
    setView('play')
    setStep(0)
    setChoices([])
    setPlanet(null)
    setEditing(false)
    setMenuOpen(false)
    window.history.replaceState({}, '', window.location.pathname)
    ping(520, 0.12, sound)
    scrollTop()
  }

  const makePlanet = (answers, savedScore) => {
    const indexes = answers.map((answer, i) => questions[i].options.indexOf(answer))
    const score = savedScore ?? indexes.reduce((sum, value, i) => sum + value * (i + 3), 0) + Math.floor(Math.random() * 99)
    const generated = {
      name: `${nameStarts[score % nameStarts.length]}${nameEnds[(score * 3) % nameEnds.length]}`.toUpperCase(),
      chaos: 73 + (score % 27),
      happiness: 82 + ((score * 7) % 19),
      fact: funFacts[score % funFacts.length],
      answers,
      indexes,
      seed: score,
    }
    setPlanet(generated)
    setView('reveal')
    window.history.replaceState({}, '', `?planet=${indexes.join('')}-${score}`)
    setTimeout(() => {
      confetti({ particleCount: 130, spread: 90, origin: { y: 0.55 }, colors: ['#ffce55', '#ff6b78', '#7157ff', '#58d6b5'] })
      ping(660, 0.22, sound)
    }, 400)
    scrollTop()
  }

  const choose = (option) => {
    ping(420 + step * 60, 0.08, sound)
    const next = [...choices]
    next[step] = option
    setChoices(next)
    setTimeout(() => {
      if (editing) {
        setEditing(false)
        makePlanet(next)
      } else if (step === questions.length - 1) makePlanet(next)
      else {
        setStep(step + 1)
        scrollTop()
      }
    }, 260)
  }

  const surprise = () => {
    const answers = questions.map((question) => randomItem(question.options))
    setChoices(answers)
    ping(580, 0.12, sound)
    makePlanet(answers)
  }

  const goHome = () => {
    setView('home')
    setMenuOpen(false)
    window.history.replaceState({}, '', window.location.pathname)
    scrollTop()
  }

  const changeChoice = (choiceIndex) => {
    setView('play')
    setStep(choiceIndex)
    setPlanet(null)
    setEditing(true)
    window.history.replaceState({}, '', window.location.pathname)
    scrollTop()
  }

  const toggleChaos = () => {
    const next = !chaosMode
    setChaosMode(next)
    ping(next ? 760 : 320, .14, sound)
    if (next) {
      confetti({ particleCount: 75, spread: 95, origin: { y: .08 }, colors: ['#ffcf59', '#ff6e8a', '#7455e9', '#62d8b0'] })
    }
  }

  useEffect(() => {
    const encoded = new URLSearchParams(window.location.search).get('planet')
    const [answerCode, savedScore] = encoded?.split('-') ?? []
    if (answerCode?.length === 5) {
      const answers = [...answerCode].map((value, i) => questions[i].options[Number(value) % questions[i].options.length])
      setChoices(answers)
      makePlanet(answers, Number(savedScore) || undefined)
    }
    // Shared links are restored only once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sharePlanet = async () => {
    const data = {
      title: `I discovered Planet ${planet.name}`,
      text: `${planet.name}: ${planet.answers[0].title}, ruled by ${planet.answers[2].title.toLowerCase()}. Chaos level: ${planet.chaos}% 🪐`,
      url: window.location.href,
    }
    if (navigator.share) {
      try { await navigator.share(data); return } catch { /* user cancelled */ }
    }
    await navigator.clipboard.writeText(`${data.text} ${data.url}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const downloadCard = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 1500
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 0, 1200, 1500)
    gradient.addColorStop(0, '#17122d')
    gradient.addColorStop(1, '#38216d')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1200, 1500)
    ctx.fillStyle = 'rgba(255,255,255,.07)'
    for (let i = 0; i < 45; i++) {
      ctx.beginPath()
      ctx.arc((i * 193) % 1200, (i * 331) % 1500, (i % 3) + 2, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffdf69'
    ctx.font = '800 34px Arial'
    ctx.fillText(`KRSNA.FUN  •  OFFICIAL PLANET PASSPORT  #${planet.seed}`, 600, 85)

    ctx.save()
    ctx.beginPath()
    ctx.roundRect(65, 140, 1070, 720, 38)
    ctx.clip()
    const sky = ctx.createLinearGradient(0, 140, 0, 860)
    sky.addColorStop(0, planet.answers[0].tone)
    sky.addColorStop(.55, '#9b78cc')
    sky.addColorStop(1, '#ffd49d')
    ctx.fillStyle = sky
    ctx.fillRect(65, 140, 1070, 720)
    ctx.fillStyle = '#fff4ae'
    ctx.beginPath()
    ctx.arc(940, 265, 72, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#5e538c'
    ctx.beginPath()
    ctx.moveTo(65, 610)
    ;[[180,350],[340,570],[510,300],[680,555],[850,325],[1010,540],[1135,370]].forEach(([x, y]) => ctx.lineTo(x, y))
    ctx.lineTo(1135, 860)
    ctx.lineTo(65, 860)
    ctx.fill()
    ctx.fillStyle = '#64b98d'
    ctx.beginPath()
    ctx.moveTo(65, 640)
    ctx.bezierCurveTo(300, 540, 450, 700, 640, 590)
    ctx.bezierCurveTo(820, 480, 940, 690, 1135, 570)
    ctx.lineTo(1135, 860)
    ctx.lineTo(65, 860)
    ctx.fill()
    const riverColours = ['#f3a63c', '#58271f', '#7560e8', '#f18f69', '#70c2ef', '#73d8cf', '#e6a2ef', '#e5c260']
    ctx.fillStyle = riverColours[planet.indexes[3]]
    ctx.beginPath()
    ctx.moveTo(20, 815)
    ctx.bezierCurveTo(300, 655, 430, 875, 650, 735)
    ctx.bezierCurveTo(850, 610, 960, 790, 1180, 660)
    ctx.lineTo(1180, 900)
    ctx.lineTo(20, 900)
    ctx.fill()
    ctx.fillStyle = '#33234f'
    ctx.fillRect(520, 460, 180, 190)
    ctx.fillStyle = ['#79ce80','#e79b58','#79a9e5','#9d7de8','#c99255','#f0d04e','#9daebe','#d97287'][planet.indexes[2]]
    ctx.beginPath()
    ctx.roundRect(495, 425, 230, 215, 25)
    ctx.fill()
    ctx.fillStyle = '#33234f'
    ctx.beginPath()
    ctx.moveTo(480, 435)
    ctx.lineTo(610, 290)
    ctx.lineTo(740, 435)
    ctx.fill()
    ctx.fillStyle = '#261b40'
    ctx.beginPath()
    ctx.arc(610, 570, 55, Math.PI, 0)
    ctx.lineTo(665, 640)
    ctx.lineTo(555, 640)
    ctx.fill()
    for (let i = 0; i < 8; i++) {
      const x = 185 + i * 112
      const y = 690 + (i % 3) * 32
      ctx.fillStyle = ['#ffce62','#65d4ca','#fa7898','#9683ed'][i % 4]
      ctx.beginPath()
      ctx.arc(x, y, 18, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillRect(x - 14, y + 14, 28, 34)
    }
    ctx.restore()

    ctx.fillStyle = '#ffdf69'
    ctx.font = '900 31px Arial'
    ctx.fillText('NEW WORLD DISCOVERED', 600, 935)
    ctx.fillStyle = '#fff'
    ctx.font = '900 79px Arial'
    ctx.fillText(`PLANET ${planet.name}`, 600, 1020)
    ctx.fillStyle = '#c8bfe7'
    ctx.font = '31px Arial'
    ctx.fillText(`${planet.answers[0].title}  •  ${planet.answers[1].title}`, 600, 1090)
    ctx.fillText(`${planet.answers[2].title}  •  ${planet.answers[3].title}`, 600, 1138)
    ctx.fillStyle = '#ffdf69'
    ctx.font = '800 42px Arial'
    ctx.fillText(`CHAOS ${planet.chaos}%   ·   HAPPINESS ${planet.happiness}%`, 600, 1235)
    ctx.fillStyle = '#fff'
    ctx.font = '700 29px Arial'
    ctx.fillText(`SUPREME LAW: ${planet.answers[4].title.toUpperCase()}`, 600, 1310)
    ctx.fillStyle = '#aaa0bf'
    ctx.font = '26px Arial'
    ctx.fillText('A living world generated at KRSNA.FUN', 600, 1410)
    const link = document.createElement('a')
    link.download = `${planet.name.toLowerCase().replaceAll(' ', '-')}-krsna-fun.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    ping(720, 0.14, sound)
  }

  return (
    <div className={`app view-${view} ${chaosMode ? 'chaos-mode' : ''}`} ref={topRef}>
      <a className="skip-link" href="#main">Skip to the fun</a>
      <FunCursor />
      <Header view={view} onHome={goHome} onPlay={start} menuOpen={menuOpen} setMenuOpen={setMenuOpen} sound={sound} setSound={setSound} chaosMode={chaosMode} onChaos={toggleChaos} />
      <main id="main">
        {view === 'home' && <HomePage onStart={start} onSurprise={surprise} chaosMode={chaosMode} onChaos={toggleChaos} />}
        {view === 'play' && (
          <PlanetBuilder
            step={step}
            choices={choices}
            onChoose={choose}
            onBack={() => step ? setStep(step - 1) : goHome()}
          />
        )}
        {view === 'reveal' && planet && (
          <Suspense fallback={<div className="engine-boot"><i /><span>STARTING 3D ENGINE</span></div>}>
            <ThreeDUniverse
              planet={planet}
              onAgain={start}
              onSurprise={surprise}
              onShare={sharePlanet}
              onDownload={downloadCard}
              onChange={changeChoice}
              copied={copied}
            />
          </Suspense>
        )}
      </main>
      {view === 'home' && <Footer />}
    </div>
  )
}

function Header({ view, onHome, onPlay, menuOpen, setMenuOpen, sound, setSound, chaosMode, onChaos }) {
  return (
    <header className="site-header">
      <button className="logo" onClick={onHome} aria-label="KRSNA.FUN home">
        KRSNA<span>.</span>FUN <i>✦</i>
      </button>
      <p className="header-whisper">{view === 'home' ? 'A little corner where weird things happen.' : 'Planet Department • Definitely Official'}</p>
      <nav className={menuOpen ? 'open' : ''} aria-label="Main navigation">
        <button onClick={onHome}><Home size={16} /> Home</button>
        <button onClick={onHome}>Explore</button>
        <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
      </nav>
      <div className="header-actions">
        <button className={`chaos-toggle ${chaosMode ? 'active' : ''}`} onClick={onChaos} aria-pressed={chaosMode}><Zap size={13} fill="currentColor" /> {chaosMode ? 'CHAOS ON' : 'ADD CHAOS'}</button>
        {view !== 'home' && <button className="sound-button" onClick={() => setSound(!sound)} aria-label={`${sound ? 'Mute' : 'Enable'} sounds`}>{sound ? <Volume2 /> : <VolumeX />}</button>}
        <button className="mini-play" onClick={onPlay}><Play size={14} fill="currentColor" /> Play</button>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
      </div>
    </header>
  )
}

function HomePage({ onStart, onSurprise, chaosMode, onChaos }) {
  const [toyMessage, setToyMessage] = useState('psst... poke me')
  const pokeToy = () => {
    const messages = ['rude. do it again.', 'hehe that tickles', 'you found a secret!', 'okay bestie 💅', 'certified button-poker', 'the blob remembers.']
    setToyMessage(randomItem(messages))
    confetti({ particleCount: 28, spread: 55, origin: { x: .11, y: .63 }, colors: ['#ffd95a', '#7455e9', '#f16d75'] })
  }
  return (
    <>
      <section className="hero-section">
        <div className="hero-doodles" aria-hidden="true">
          <span className="doodle doodle-star">✦</span><span className="doodle doodle-smile">☺</span>
          <span className="doodle doodle-arrow">↝</span><span className="doodle doodle-orbit">🪐</span>
        </div>
        <div className="eyebrow"><span className="eyebrow-dot" /> THE INTERNET&apos;S PLAYGROUND <span className="eyebrow-new">NEW DROP</span></div>
        <h1><span>BORED?</span><br />GOOD.</h1>
        <p>Your screen time finally has a personality.<br className="desktop-break" /> Click something. Make something unhinged. Send it to the group chat.</p>
        <div className="hero-actions">
          <button className="primary-button wobble hero-main-cta" onClick={onSurprise}><Sparkles size={20} /> DROP ME SOMEWHERE WEIRD <span>↗</span></button>
          <button className="text-button" onClick={() => document.querySelector('#playground')?.scrollIntoView({ behavior: 'smooth' })}>See all the fun <ArrowRight size={18} /></button>
        </div>
        <button className="hero-toy" onClick={pokeToy} aria-label="Poke the floating blob">
          <div className="toy-orbit orbit-one"><span>🍕</span></div>
          <div className="toy-orbit orbit-two"><span>✨</span></div>
          <div className="toy-face"><i></i><i></i><b></b></div>
          <span className="toy-message">{toyMessage}</span>
        </button>
        <button className={`chaos-sticker ${chaosMode ? 'active' : ''}`} onClick={onChaos}>
          <Zap fill="currentColor" /> {chaosMode ? 'MAXIMUM\nCHAOS!' : 'MAKE IT\nWEIRDER'}
        </button>
        <div className="hero-proof"><span><MousePointer2 /> NO LOGIN</span><span><Heart /> PURE SEROTONIN</span><span><Globe2 /> MADE FOR EVERYONE</span></div>
        <div className="scroll-note">SCROLL FOR FUN <span>↓</span></div>
      </section>

      <div className="fun-marquee" aria-label="KRSNA.FUN highlights">
        <div>
          <span>MAKE WEIRD STUFF</span><i>✦</i><span>ZERO PRODUCTIVITY</span><i>☺</i><span>32,768 PLANETS</span><i>✦</i><span>BUILT FOR THE GROUP CHAT</span><i>↗</i>
          <span>MAKE WEIRD STUFF</span><i>✦</i><span>ZERO PRODUCTIVITY</span><i>☺</i><span>32,768 PLANETS</span><i>✦</i><span>BUILT FOR THE GROUP CHAT</span><i>↗</i>
        </div>
      </div>

      <section className="playground-section" id="playground">
        <div className="section-heading">
          <div>
            <span className="section-kicker">PICK YOUR CHAOS</span>
            <h2>THE PLAYGROUND <em>✦</em></h2>
          </div>
          <p>No sign-ups. No instructions manual.<br />Just click something that looks fun.</p>
        </div>
        <div className="activity-grid">
          {activities.map((activity, index) => (
            <button
              key={activity.title}
              className={`activity-card ${activity.className} ${activity.live ? 'featured' : ''}`}
              onClick={activity.live ? onStart : undefined}
              aria-disabled={!activity.live}
            >
              <div className="card-topline">
                <span className={activity.live ? 'live-pill' : 'soon-pill'}>{activity.live ? 'PLAY NOW' : 'COMING SOON'}</span>
                <span className="card-number">0{index + 1}</span>
              </div>
              <div className="card-art" aria-hidden="true">
                {activity.live && <><span className="tiny-moon">🌙</span><span className="planet-ring"></span></>}
                <span className="activity-emoji">{activity.icon}</span>
                {!activity.live && <span className="art-spark">✦</span>}
              </div>
              <div className="card-copy">
                <h3>{activity.title}</h3>
                <p>{activity.desc}</p>
                {activity.live && <span className="play-cta">LET&apos;S MAKE A PLANET <ArrowRight size={17} /></span>}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="vibe-section">
        <div className="vibe-heading">
          <span className="section-kicker">LOW EFFORT. HIGH REWARD.</span>
          <h2>FUN THAT <em>ACTUALLY</em><br />FUNS.</h2>
          <p>We removed the boring bits. No accounts, no tutorials, no “book a demo.” Just instant nonsense.</p>
        </div>
        <div className="vibe-grid">
          <article className="vibe-card combo-card">
            <span>THE POSSIBILITY MACHINE</span>
            <strong>32,768</strong>
            <h3>possible weird planets</h3>
            <div className="combo-orbit"><i /><i /><i /><b>?</b></div>
            <p>And somehow you&apos;ll still make the strangest one.</p>
          </article>
          <article className="vibe-card instant-card">
            <span>TIME TO FUN</span>
            <strong>0.2<small>SEC</small></strong>
            <h3>faster than your attention span</h3>
            <div className="speed-lines"><i /><i /><i /><i /></div>
            <p>No onboarding. Your inner chaos gremlin already knows what to do.</p>
          </article>
          <article className="vibe-card share-card">
            <span>GROUP CHAT ENERGY</span>
            <div className="chat-stack"><i>what is this 😭</i><i>mine has a potato king</i><i>send the link rn</i></div>
            <h3>made to be sent,<br />not scrolled past</h3>
            <p>Every planet gets a shareable passport and its own permanent link.</p>
          </article>
        </div>
        <div className="how-it-works">
          <span>HOW TO KRSNA.FUN</span>
          <div><b>01</b><i><MousePointer2 /></i><strong>Pick your chaos</strong><small>Five extremely important nonsense decisions.</small></div>
          <div><b>02</b><i><Star /></i><strong>Discover a world</strong><small>Watch your choices become a living planet.</small></div>
          <div><b>03</b><i><Shuffle /></i><strong>Explore & share</strong><small>Meet locals, cause disasters, confuse friends.</small></div>
        </div>
      </section>

      <section className="manifesto" id="about">
        <span className="big-asterisk">✻</span>
        <p>THE INTERNET NEEDED<br />MORE <em>FUN.</em></p>
        <p className="manifesto-small">So we made this. No productivity. No doomscrolling.<br />Just tiny moments that make your day a little less ordinary.</p>
        <button className="primary-button dark-button" onClick={onStart}>Start with a planet <ArrowRight size={19} /></button>
      </section>
    </>
  )
}

function PlanetBuilder({ step, choices, onChoose, onBack }) {
  const question = questions[step]
  return (
    <section className="builder">
      <div className="builder-sky" aria-hidden="true"><span>✦</span><span>·</span><span>✧</span><span>·</span></div>
      <div className="builder-top">
        <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {step ? 'Previous' : 'Exit planet lab'}</button>
        <div className="progress-wrap">
          <span>PLANET COMPLETION</span>
          <b>{step + 1} / {questions.length}</b>
          <div className="progress-track"><i style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
        </div>
      </div>
      <div className="choice-journey" aria-label="Your planet choices">
        {questions.map((item, index) => (
          <div key={item.key} className={`${index === step ? 'current' : ''} ${choices[index] ? 'done' : ''}`}>
            <span>{choices[index]?.emoji ?? index + 1}</span>
            <small>{item.key}</small>
          </div>
        ))}
      </div>
      <div className="question-heading" key={question.key}>
        <span>{question.kicker}</span>
        <h1>{question.title}</h1>
        <p>Pick the answer your heart says yes to. Your brain isn&apos;t invited.</p>
        <button className="random-answer" onClick={() => onChoose(randomItem(question.options))}><Shuffle /> Pick for me, I&apos;m chaotic</button>
      </div>
      <div className="answer-grid" key={`${question.key}-answers`}>
        {question.options.map((option, i) => (
          <button
            key={option.title}
            className={`answer-card ${choices[step]?.title === option.title ? 'selected' : ''}`}
            style={{ '--tone': option.tone, '--delay': `${i * 35}ms` }}
            onClick={() => onChoose(option)}
          >
            <span className="answer-check"><Check size={15} strokeWidth={4} /></span>
            <span className="answer-visual" aria-hidden="true"><i></i><b>{option.emoji}</b><em>✦</em></span>
            <strong>{option.title}</strong>
            <small>{option.desc}</small>
          </button>
        ))}
      </div>
      <p className="builder-tip"><span>💡</span> There are no wrong answers. Only increasingly questionable planets.</p>
    </section>
  )
}

function FunCursor() {
  const dot = useRef(null)
  const ring = useRef(null)

  useEffect(() => {
    const move = (event) => {
      dot.current?.style.setProperty('transform', `translate3d(${event.clientX}px, ${event.clientY}px, 0)`)
      ring.current?.animate(
        { transform: `translate3d(${event.clientX}px, ${event.clientY}px, 0)` },
        { duration: 280, fill: 'forwards', easing: 'cubic-bezier(.2,.8,.2,1)' },
      )
      const hovering = Boolean(event.target.closest('button, a, [role="button"]'))
      ring.current?.classList.toggle('is-hovering', hovering)
    }
    const down = () => ring.current?.classList.add('is-clicking')
    const up = () => ring.current?.classList.remove('is-clicking')
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  return <div className="fun-cursor" aria-hidden="true"><i ref={dot} /><b ref={ring}>✦</b></div>
}

function Footer() {
  return (
    <footer>
      <div className="logo footer-logo">KRSNA<span>.</span>FUN <i>✦</i></div>
      <p>Made for bored humans everywhere.</p>
      <span>© {currentYear} • STAY WEIRD</span>
    </footer>
  )
}

export default App
