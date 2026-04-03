import { useEffect, useMemo, useState } from 'react'
import { SkeletonAuto } from 'skeleton-ui-loader'
import 'skeleton-ui-loader/styles.css'
import './App.css'

const names = ['Anika Patel', 'Marcus Lee', 'Elena Rossi', 'Noah Kim']
const roles = ['Frontend Engineer', 'Product Designer', 'Data Engineer', 'PM']

function getUser(seed: number) {
  const pick = seed % names.length
  return {
    name: names[pick],
    role: roles[pick],
    bio: 'Building accessible products and performance focused interfaces for global users.',
    avatar: `https://i.pravatar.cc/160?img=${seed + 20}`,
    projects: 12 + pick,
    reviews: 98 - pick * 4,
    score: 4.8 - pick * 0.1
  }
}

function App() {
  const [seed, setSeed] = useState(1)
  const [loading, setLoading] = useState(true)

  const user = useMemo(() => getUser(seed), [seed])

  useEffect(() => {
    setLoading(true)

    const timeout = window.setTimeout(() => {
      setLoading(false)
    }, 3000)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [seed])

  const reload = () => {
    setSeed((value) => value + 1)
  }

  return (
    <main className="page">
      <section className="intro">
        <p className="kicker">skeleton-ui-loader demo</p>
        <h1>Auto generated skeleton for a real card layout</h1>
        <button onClick={reload}>{loading ? 'Loading...' : 'Reload profile'}</button>
      </section>

      <SkeletonAuto
        loading={loading}
        snapshot="demo-user-card"
        baseColor="#000000"
        shimmerColor="#080909b5"
        borderRadius={10}
        animation="shimmer"
      >
        <article className="card" data-skeleton-id="user-card">
          <header className="card-header">
            <img src={user.avatar} alt={user.name} className="avatar" />
            <div>
              <h2>{user.name}</h2>
              <p>{user.role}</p>
            </div>
          </header>

          <p className="bio">{user.bio}</p>

          <div className="stats">
            <div>
              <span>Projects</span>
              <strong>{user.projects}</strong>
            </div>
            <div>
              <span>Reviews</span>
              <strong>{user.reviews}</strong>
            </div>
            <div>
              <span>Score</span>
              <strong>{user.score.toFixed(1)}</strong>
            </div>
          </div>

          <button className="cta">View profile</button>
        </article>
      </SkeletonAuto>
    </main>
  )
}

export default App
