import { useMemo, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './features/auth/AuthContext'
import AuthPage from "./features/auth/AuthPage";
import AuthCallback from "./features/auth/AuthCallback";
import UpdatePasswordPage from "./features/auth/UpdatePasswordPage";
import ProtectedRoute from './features/auth/ProtectedRoute'
import {
  ArrowDownRight,
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  Compass,
  Heart,
  Library,
  Menu,
  Search,
  SlidersHorizontal,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import './App.css'

type Book = {
  id: string
  title: string
  author: string
  genre: string
  note: string
  cover: string
  tone: string
}

const books: Book[] = [
  {
    id: 'midnight-library',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    genre: 'Fiction',
    note: 'For the what-ifs and second chances',
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=700&q=85',
    tone: 'olive',
  },
  {
    id: 'educated',
    title: 'Educated',
    author: 'Tara Westover',
    genre: 'Memoir',
    note: 'A life rebuilt through learning',
    cover: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=700&q=85',
    tone: 'rust',
  },
  {
    id: 'small-things',
    title: 'Small Things Like These',
    author: 'Claire Keegan',
    genre: 'Literary fiction',
    note: 'Quiet, precise, and deeply human',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=85',
    tone: 'blue',
  },
  {
    id: 'design-everyday',
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    genre: 'Design',
    note: 'See ordinary things differently',
    cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=700&q=85',
    tone: 'gold',
  },
  {
    id: 'song-achilles',
    title: 'The Song of Achilles',
    author: 'Madeline Miller',
    genre: 'Fantasy',
    note: 'Myth, memory, and devotion',
    cover: 'https://images.unsplash.com/photo-1513001900722-370f803f498d?auto=format&fit=crop&w=700&q=85',
    tone: 'plum',
  },
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Personal growth',
    note: 'Small changes, thoughtfully applied',
    cover: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=700&q=85',
    tone: 'sand',
  },
]

const navItems = [
  { to: '/', label: 'Home', icon: Compass, end: true },
  { to: '/discover', label: 'Discover', icon: Search, end: false },
  { to: '/library', label: 'My library', icon: Library, end: false },
]

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { user, signOut } = useAuth()

  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="LIBRIS home" onClick={() => setMobileOpen(false)}>
        <span className="brand-mark"><BookOpen size={19} strokeWidth={1.7} /></span>
        <span className="brand-word">libris<span>.</span></span>
      </Link>

      <nav className={`main-nav ${mobileOpen ? 'main-nav-open' : ''}`} aria-label="Main navigation">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            <Icon size={16} strokeWidth={1.8} /> {label}
          </NavLink>
        ))}
        <a className="nav-link nav-link-muted" href="#reading-note" onClick={() => setMobileOpen(false)}>
          <Sparkles size={16} strokeWidth={1.8} /> The Libris idea
        </a>
      </nav>

      <div className="header-actions">
        <Link to="/discover" className="header-search" aria-label="Search books"><Search size={18} /></Link>
        {user ? (
          <button
            className="avatar-button"
            type="button"
            onClick={() => void signOut()}
            aria-label="Sign out"
            title={`Signed in as ${user.email}. Click to sign out.`}
          >
          {(user.user_metadata?.full_name ?? user.email ?? '?').charAt(0).toUpperCase()}
          </button>
          ) : (
          <Link to="/auth" className="avatar-button" aria-label="Sign in" title="Sign in">
            <User size={18} />
          </Link>
        )}
        <button className="mobile-menu" type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      <span className="route-announcer" aria-live="polite">{location.pathname === '/' ? 'Home' : location.pathname.slice(1)}</span>
    </header>
  )
}

function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: { label: string; to: string } }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {action && <Link className="text-link" to={action.to}>{action.label} <ArrowRight size={15} /></Link>}
    </div>
  )
}

function BookCard({ book, saved, onToggleSave, compact = false }: { book: Book; saved: boolean; onToggleSave: (id: string) => void; compact?: boolean }) {
  return (
    <article className={`book-card ${compact ? 'book-card-compact' : ''}`}>
      <div className={`book-cover-wrap cover-${book.tone}`}>
        <img className="book-cover" src={book.cover} alt={`Decorative cover image for ${book.title}`} loading="lazy" />
        <button className={`save-book ${saved ? 'save-book-active' : ''}`} type="button" onClick={() => onToggleSave(book.id)} aria-label={saved ? `Remove ${book.title} from saved books` : `Save ${book.title}`} title={saved ? 'Saved to your sample shelf' : 'Save to your sample shelf'}>
          {saved ? <Heart size={17} fill="currentColor" /> : <Bookmark size={17} />}
        </button>
        <span className="cover-caption">{book.genre}</span>
      </div>
      <div className="book-meta">
        <h3>{book.title}</h3>
        <p className="book-author">{book.author}</p>
        {!compact && <p className="book-note">{book.note}</p>}
      </div>
    </article>
  )
}

function SearchBox({ value, onChange, onSubmit }: { value: string; onChange: (value: string) => void; onSubmit: () => void }) {
  return (
    <form className="hero-search" onSubmit={(event) => { event.preventDefault(); onSubmit() }} role="search">
      <Search size={19} strokeWidth={1.8} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="A book, a feeling, a half-remembered story…" aria-label="Search books or describe what you want to read" />
      <button type="submit">Find a book <ArrowRight size={16} /></button>
    </form>
  )
}

function HomePage({ savedIds, onToggleSave, search, setSearch, onSearch }: {
  savedIds: string[]; onToggleSave: (id: string) => void; search: string; setSearch: (value: string) => void; onSearch: () => void
}) {
  const picks = books.slice(0, 4)
  return (
    <>
      <main>
        <section className="hero-section page-gutter">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow"><span className="eyebrow-line" /> YOUR NEXT CHAPTER STARTS HERE</p>
            <h1>Find the book<br />that <em>finds you.</em></h1>
            <p className="hero-description">A little help finding your next favourite. Explore by mood, follow a passing curiosity, or describe that story you can almost remember.</p>
            <SearchBox value={search} onChange={setSearch} onSubmit={onSearch} />
            <div className="hero-footnote"><span className="tiny-sparkle">✳</span> No perfect search terms needed. Just tell us what you're in the mood for.</div>
          </div>
          <div className="hero-art" aria-label="A quiet reading corner with books">
            <div className="art-sun" />
            <div className="art-window"><div className="window-cross window-cross-v" /><div className="window-cross window-cross-h" /><div className="window-shadow" /></div>
            <div className="art-plant"><span /><span /><span /><i /></div>
            <div className="art-stack"><div className="stack-book stack-book-one" /><div className="stack-book stack-book-two" /><div className="stack-book stack-book-three" /></div>
            <div className="art-cup"><span /></div>
            <div className="art-label"><span className="label-mark">✳</span><span>Make room<br />for wonder.</span></div>
          </div>
        </section>

        <section className="mood-strip page-gutter" aria-label="Explore by mood">
          <span className="mood-label">IN THE MOOD FOR</span>
          <Link to="/discover?mood=comforting">Something comforting <ArrowDownRight size={14} /></Link>
          <Link to="/discover?mood=thought-provoking">A mind-bender <ArrowDownRight size={14} /></Link>
          <Link to="/discover?mood=escapist">Somewhere else entirely <ArrowDownRight size={14} /></Link>
        </section>

        <section className="section-block page-gutter">
          <SectionHeading eyebrow="A FEW PLACES TO BEGIN" title="Books worth getting lost in" action={{ label: 'Explore the shelves', to: '/discover' }} />
          <div className="book-grid book-grid-featured">
            {picks.map((book) => <BookCard key={book.id} book={book} saved={savedIds.includes(book.id)} onToggleSave={onToggleSave} />)}
          </div>
        </section>

        <section className="reading-note page-gutter" id="reading-note">
          <div className="note-symbol"><BookOpen size={25} strokeWidth={1.4} /></div>
          <div className="note-copy"><p className="eyebrow">A DIFFERENT KIND OF BOOK SPACE</p><h2>For the books you love.<br /><em>And the ones you haven't met yet.</em></h2></div>
          <p className="note-description">Your reading life isn't a checklist. It's a collection of curiosities, unexpected favourites, and stories that stay with you. LIBRIS is being built to make more room for all of it.</p>
        </section>

        <section className="section-block section-last page-gutter">
          <SectionHeading eyebrow="FOLLOW YOUR CURIOSITY" title="A shelf for every side of you" />
          <div className="interest-grid">
            <Link to="/discover?genre=Literary%20fiction" className="interest-tile tile-literary"><span className="tile-number">01 / FICTION</span><span className="tile-title">Stories that<br /><em>stay with you.</em></span><ArrowUpRightIcon /></Link>
            <Link to="/discover?genre=Design" className="interest-tile tile-ideas"><span className="tile-number">02 / IDEAS</span><span className="tile-title">New ways<br />to <em>see things.</em></span><ArrowUpRightIcon /></Link>
            <Link to="/discover?genre=Memoir" className="interest-tile tile-lives"><span className="tile-number">03 / REAL LIVES</span><span className="tile-title">Someone else's<br /><em>world, for a while.</em></span><ArrowUpRightIcon /></Link>
          </div>
        </section>
      </main>
    </>
  )
}

function ArrowUpRightIcon() { return <ArrowRight className="tile-arrow" size={19} /> }

function DiscoverPage({ savedIds, onToggleSave, search, setSearch }: { savedIds: string[]; onToggleSave: (id: string) => void; search: string; setSearch: (value: string) => void }) {
  const [genre, setGenre] = useState('All books')
  const [sort, setSort] = useState('Recommended')
  const genres = ['All books', 'Fiction', 'Literary fiction', 'Memoir', 'Design', 'Fantasy', 'Personal growth']
  const filteredBooks = useMemo(() => {
    const term = search.trim().toLowerCase()
    const result = books.filter((book) => {
      const matchesSearch = !term || `${book.title} ${book.author} ${book.genre} ${book.note}`.toLowerCase().includes(term)
      const matchesGenre = genre === 'All books' || book.genre.toLowerCase() === genre.toLowerCase()
      return matchesSearch && matchesGenre
    })
    return sort === 'Title A–Z' ? [...result].sort((a, b) => a.title.localeCompare(b.title)) : result
  }, [genre, search, sort])

  return (
    <main className="page-gutter discover-page">
      <div className="page-intro">
        <p className="eyebrow">THE OPEN SHELF</p>
        <h1>Follow a <em>feeling.</em></h1>
        <p>Search by title, author, genre, or the kind of story you need today. This first preview uses sample books; live catalogue search arrives in a later milestone.</p>
      </div>
      <SearchBox value={search} onChange={setSearch} onSubmit={() => undefined} />
      <div className="discover-toolbar">
        <div className="filter-label"><SlidersHorizontal size={16} /> Browse by</div>
        <div className="genre-filters" aria-label="Filter by genre">
          {genres.map((item) => <button key={item} className={`genre-chip ${genre === item ? 'genre-chip-active' : ''}`} type="button" onClick={() => setGenre(item)}>{item}</button>)}
        </div>
        <label className="sort-control">Sort <ChevronDown size={14} /><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort books"><option>Recommended</option><option>Title A–Z</option></select></label>
      </div>
      <div className="results-line"><span>{filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} to explore</span><span>Preview catalogue · sample data</span></div>
      {filteredBooks.length ? <div className="book-grid discover-grid">{filteredBooks.map((book) => <BookCard key={book.id} book={book} saved={savedIds.includes(book.id)} onToggleSave={onToggleSave} />)}</div> : <div className="empty-state"><Search size={25} /><h2>No matches on this shelf</h2><p>Try a different title, author, or genre. The live catalogue will expand these results later.</p><button className="button-secondary" type="button" onClick={() => { setSearch(''); setGenre('All books') }}>Clear search and filters</button></div>}
    </main>
  )
}

function LibraryPage({ savedIds, onToggleSave }: { savedIds: string[]; onToggleSave: (id: string) => void }) {
  const savedBooks = books.filter((book) => savedIds.includes(book.id))
  return (
    <main className="page-gutter discover-page library-page">
      <div className="page-intro"><p className="eyebrow">YOUR PERSONAL CORNER</p><h1>My <em>shelf.</em></h1><p>Keep the books that caught your eye close by. In this first preview, saved books stay in this browser session; account-based syncing comes later.</p></div>
      {savedBooks.length ? <><div className="results-line"><span>{savedBooks.length} saved {savedBooks.length === 1 ? 'book' : 'books'}</span><span>Preview shelf</span></div><div className="book-grid discover-grid">{savedBooks.map((book) => <BookCard key={book.id} book={book} saved onToggleSave={onToggleSave} />)}</div></> : <div className="empty-state"><Bookmark size={25} /><h2>Your shelf is waiting</h2><p>Save a book that catches your attention and it'll appear here.</p><Link className="button-primary" to="/discover">Find your first book <ArrowRight size={16} /></Link></div>}
    </main>
  )
}

function FutureFeaturePage({ title, description, icon: Icon }: { title: string; description: string; icon: typeof Sparkles }) {
  return <main className="page-gutter future-page"><div className="future-card"><div className="future-icon"><Icon size={25} /></div><p className="eyebrow">ON THE READING LIST</p><h1>{title}</h1><p>{description}</p><span className="future-note"><Check size={15} /> Planned for a later milestone — not active yet.</span><Link className="text-link" to="/discover">Explore books in the meantime <ArrowRight size={15} /></Link></div></main>
}

function Footer() {
  return <footer className="site-footer page-gutter"><Link className="brand footer-brand" to="/"><span className="brand-mark"><BookOpen size={17} /></span><span className="brand-word">libris<span>.</span></span></Link><p>For the books you love, and the ones you haven't met yet.</p><span className="footer-small">A reading space in the making · 2026</span></footer>
}

export default function App() {
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const location = useLocation()

  const toggleSave = (id: string) => {
    setSavedIds((current) => current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id])
  }

  const runSearch = () => {
    if (location.pathname !== '/discover') window.history.pushState({}, '', '/discover')
    // Keep the app's shared search state; the discover page filters it immediately on navigation.
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <div className="app-shell">
      <div className="announcement-bar"><span className="announcement-dot" /> A quieter corner of the internet, made for readers <span className="announcement-separator">·</span> <span className="announcement-end">Come as you are.</span></div>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage savedIds={savedIds} onToggleSave={toggleSave} search={search} setSearch={setSearch} onSearch={runSearch} />} />
        <Route path="/discover" element={<DiscoverPage savedIds={savedIds} onToggleSave={toggleSave} search={search} setSearch={setSearch} />} />
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <LibraryPage savedIds={savedIds} onToggleSave={toggleSave} />
            </ProtectedRoute>
          }
        />
        <Route path="/assistant" element={<FutureFeaturePage title="A thoughtful reading companion." description="A place to explore books, ask questions, and find your next read. AI features will be connected after the catalogue and secure backend are ready." icon={Sparkles} />} />
        <Route path="/detective" element={<FutureFeaturePage title="Remember a story? Let's find it." description="Describe a scene, a character, or a detail you can't quite place. Book Detective will arrive in a later milestone." icon={Search} />} />
        <Route path="*" element={<FutureFeaturePage title="This page is still being written." description="That part of LIBRIS hasn't been built yet. Head back to discovery to find something to read." icon={BookOpen} />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/update-password" element={<UpdatePasswordPage />} />
      </Routes>
      <Footer />
    </div>
  )
}
