import { useState } from 'react'
import {
  RiBrainLine,
  RiHistoryLine,
  RiSparklingLine,
  RiSendPlaneLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiTimeLine,
  RiBookOpenLine,
  RiUserLine,
  RiBuildingLine,
  RiMapPinLine,
  RiAwardLine,
  RiEyeLine,
  RiPencilLine,
  RiCloseLine,
  RiLinkM,
  RiFlashlightLine,
  RiMedalLine,
  RiTrophyLine,
} from 'react-icons/ri'

interface Quiz {
  id: number
  url: string
  title: string
  date_generated: string
  summary: string
  key_entities: {
    people: string[]
    organizations: string[]
    locations: string[]
  }
  sections: string[]
  quiz: {
    question: string
    options: string[]
    answer: string
    difficulty: string
    explanation: string
  }[]
  related_topics: string[]
}

interface HistoryItem {
  id: number
  url: string
  title: string
  date_generated: string
}

const difficultyConfig: Record<string, { label: string; color: string }> = {
  easy: { label: 'Easy', color: '#22c55e' },
  medium: { label: 'Medium', color: '#f59e0b' },
  hard: { label: 'Hard', color: '#ef4444' },
}

function App() {
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [quizMode, setQuizMode] = useState<'view' | 'take'>('view')
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [openExplanations, setOpenExplanations] = useState<Set<number>>(new Set())

  const generateQuiz = async () => {
    if (!url.startsWith('https://en.wikipedia.org/wiki/')) {
      alert('Please enter a valid Wikipedia URL')
      return
    }
    setLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/generate_quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (!response.ok) throw new Error('Failed to generate quiz')
      const data = await response.json()
      setQuiz(data)
      setQuizMode('view')
      setUserAnswers({})
      setShowResults(false)
      setOpenExplanations(new Set())
    } catch (error) {
      alert('Error generating quiz: ' + error)
    }
    setLoading(false)
  }

  const loadHistory = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/history')
      const data = await response.json()
      setHistory(data)
    } catch (error) {
      alert('Error loading history: ' + error)
    }
  }

  const loadQuizDetails = async (id: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/quiz/${id}`)
      const data = await response.json()
      setSelectedQuiz(data)
      setShowModal(true)
      setQuizMode('view')
      setUserAnswers({})
      setShowResults(false)
      setOpenExplanations(new Set())
    } catch (error) {
      alert('Error loading quiz: ' + error)
    }
  }

  const handleTakeQuiz = () => {
    setQuizMode('take')
    setUserAnswers({})
    setShowResults(false)
    setScore(0)
    setOpenExplanations(new Set())
  }

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setUserAnswers({ ...userAnswers, [questionIndex]: answer })
  }

  const handleSubmitQuiz = () => {
    if (!quiz) return
    const answeredCount = Object.keys(userAnswers).length
    if (answeredCount < quiz.quiz.length) {
      if (!window.confirm(`You've answered ${answeredCount} of ${quiz.quiz.length} questions. Submit anyway?`)) return
    }
    let correctCount = 0
    quiz.quiz.forEach((q, idx) => { if (userAnswers[idx] === q.answer) correctCount++ })
    setScore(correctCount)
    setShowResults(true)
  }

  const handleBackToView = () => {
    setQuizMode('view')
    setUserAnswers({})
    setShowResults(false)
  }

  const toggleExplanation = (idx: number) => {
    setOpenExplanations(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  const getScoreInfo = (s: number, total: number) => {
    const pct = Math.round((s / total) * 100)
    if (pct >= 80) return { label: 'Outstanding!', icon: <RiTrophyLine />, color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' }
    if (pct >= 50) return { label: 'Well Done!', icon: <RiMedalLine />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' }
    return { label: 'Keep Going!', icon: <RiFlashlightLine />, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' }
  }

  const QuizDisplay = ({ quizData, mode = 'view' }: { quizData: Quiz; mode?: 'view' | 'take' }) => {
    const isView = mode === 'view'
    const isTake = mode === 'take'
    const scoreInfo = getScoreInfo(score, quizData.quiz.length)

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div className="chip" style={{ marginBottom: '0.75rem' }}>
                <RiBookOpenLine style={{ fontSize: '0.75rem' }} /> Wikipedia Article
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1.2, marginBottom: '0.5rem' }}>{quizData.title}</h2>
              <a href={quizData.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none', opacity: 0.8 }}>
                <RiLinkM /> {quizData.url}
              </a>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
              {isView && (
                <button className="btn-primary" onClick={handleTakeQuiz}>
                  <RiPencilLine /> Take Quiz
                </button>
              )}
              {isTake && !showResults && (
                <button className="btn-ghost" onClick={handleBackToView}>
                  <RiEyeLine /> View Mode
                </button>
              )}
            </div>
          </div>

          {/* Score Banner */}
          {showResults && (
            <div style={{ marginTop: '1.5rem', padding: '1.5rem', borderRadius: '12px', background: scoreInfo.bg, border: `1px solid ${scoreInfo.border}`, display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '2.5rem', color: scoreInfo.color }}>{scoreInfo.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: scoreInfo.color, fontFamily: 'var(--font-display)' }}>{scoreInfo.label}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                  You scored <strong style={{ color: 'var(--text-primary)' }}>{score}</strong> out of <strong style={{ color: 'var(--text-primary)' }}>{quizData.quiz.length}</strong> &mdash; {Math.round((score / quizData.quiz.length) * 100)}%
                </div>
              </div>
              <button className="btn-ghost" onClick={handleBackToView} style={{ fontSize: '0.85rem' }}>
                <RiEyeLine /> See Explanations
              </button>
            </div>
          )}
        </div>

        {/* Summary + Entities */}
        {isView && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div className="section-label">Summary</div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>{quizData.summary}</p>
            </div>
            <div className="card entity-card" style={{ '--entity-accent': '#3b82f6' } as React.CSSProperties}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <RiUserLine style={{ color: '#3b82f6' }} />
                <div className="section-label" style={{ marginBottom: 0 }}>People</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {(quizData.key_entities?.people || []).map((p, i) => <span key={i} className="tag tag-blue">{p}</span>)}
                {!quizData.key_entities?.people?.length && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None listed</span>}
              </div>
            </div>
            <div className="card entity-card" style={{ '--entity-accent': '#10b981' } as React.CSSProperties}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <RiBuildingLine style={{ color: '#10b981' }} />
                <div className="section-label" style={{ marginBottom: 0 }}>Organizations</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {(quizData.key_entities?.organizations || []).map((o, i) => <span key={i} className="tag tag-green">{o}</span>)}
                {!quizData.key_entities?.organizations?.length && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None listed</span>}
              </div>
            </div>
            <div className="card entity-card" style={{ '--entity-accent': '#8b5cf6', gridColumn: '1 / -1' } as React.CSSProperties}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <RiMapPinLine style={{ color: '#8b5cf6' }} />
                <div className="section-label" style={{ marginBottom: 0 }}>Locations</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {(quizData.key_entities?.locations || []).map((l, i) => <span key={i} className="tag tag-purple">{l}</span>)}
                {!quizData.key_entities?.locations?.length && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None listed</span>}
              </div>
            </div>
          </div>
        )}

        {/* Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {isTake && !showResults ? 'Answer Each Question' : `${quizData.quiz.length} Questions`}
            </h3>
            {isTake && !showResults && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {Object.keys(userAnswers).length} / {quizData.quiz.length} answered
              </div>
            )}
          </div>

          {quizData.quiz?.map((q, idx) => {
            const isCorrect = userAnswers[idx] === q.answer
            const isAnswered = userAnswers[idx] !== undefined
            let cardBorder = 'var(--border)'
            if (showResults) cardBorder = isCorrect ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'
            else if (isTake && isAnswered) cardBorder = 'var(--accent)'
            const diff = difficultyConfig[q.difficulty] || { label: q.difficulty, color: '#94a3b8' }
            const isOpen = openExplanations.has(idx)

            return (
              <div key={idx} className="card question-card" style={{ borderColor: cardBorder, transition: 'border-color 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div className="q-number">{idx + 1}</div>
                    {showResults && (
                      isCorrect
                        ? <RiCheckboxCircleLine style={{ color: '#22c55e', fontSize: '1.1rem' }} />
                        : <RiCloseCircleLine style={{ color: '#ef4444', fontSize: '1.1rem' }} />
                    )}
                  </div>
                  <span className="difficulty-badge" style={{ background: diff.color + '20', color: diff.color, borderColor: diff.color + '40' }}>
                    {diff.label}
                  </span>
                </div>

                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.55, fontSize: '0.975rem' }}>{q.question}</p>

                {isTake && !showResults ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {q.options.map((opt, i) => {
                      const isSelected = userAnswers[idx] === opt.charAt(0)
                      return (
                        <label key={i} className="option-label" style={{
                          background: isSelected ? 'rgba(99,102,241,0.08)' : 'var(--surface-2)',
                          borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                          color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                        }}>
                          <input type="radio" name={`q-${idx}`} value={opt.charAt(0)} checked={isSelected}
                            onChange={(e) => handleAnswerSelect(idx, e.target.value)}
                            style={{ display: 'none' }} />
                          <span className="option-key">{opt.charAt(0)}</span>
                          <span style={{ fontSize: '0.9rem' }}>{opt.slice(2)}</span>
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                    {q.options.map((opt, i) => {
                      const letter = opt.charAt(0)
                      const isCorrectOpt = letter === q.answer
                      const isUserWrong = showResults && letter === userAnswers[idx] && !isCorrectOpt
                      return (
                        <div key={i} style={{
                          padding: '0.6rem 0.875rem',
                          borderRadius: '8px',
                          fontSize: '0.88rem',
                          display: 'flex', alignItems: 'center', gap: '0.6rem',
                          background: isCorrectOpt && showResults ? 'rgba(34,197,94,0.1)' : isUserWrong ? 'rgba(239,68,68,0.08)' : 'var(--surface-2)',
                          color: isCorrectOpt && showResults ? '#22c55e' : isUserWrong ? '#ef4444' : 'var(--text-secondary)',
                          fontWeight: (isCorrectOpt && showResults) || isUserWrong ? 600 : 400,
                        }}>
                          <span style={{ fontWeight: 700, opacity: 0.7, minWidth: '1rem' }}>{letter}.</span>
                          {opt.slice(2)}
                          {isCorrectOpt && showResults && <RiCheckboxCircleLine style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                          {isUserWrong && <RiCloseCircleLine style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Explanation toggle */}
                {(isView || showResults) && (
                  <div>
                    <button
                      onClick={() => toggleExplanation(idx)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600, padding: '0.25rem 0',
                      }}
                    >
                      {isOpen ? <RiArrowLeftLine /> : <RiArrowRightLine />}
                      {isOpen ? 'Hide' : 'Show'} Explanation
                    </button>
                    {isOpen && (
                      <div style={{ marginTop: '0.75rem', padding: '1rem', background: 'var(--surface-2)', borderRadius: '10px', borderLeft: '3px solid var(--accent)' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', marginBottom: '0.4rem' }}>
                          Correct Answer: {q.answer}
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{q.explanation}</p>
                        {showResults && userAnswers[idx] && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: isCorrect ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                            Your answer: {userAnswers[idx]} {isCorrect ? '— Correct!' : '— Incorrect'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {isTake && !showResults && (
            <button className="btn-primary" onClick={handleSubmitQuiz} style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginTop: '0.5rem' }}>
              <RiAwardLine style={{ fontSize: '1.2rem' }} /> Submit Quiz
            </button>
          )}
        </div>

        {/* Related Topics */}
        {isView && quizData.related_topics?.length > 0 && (
          <div className="card">
            <div className="section-label">Related Topics</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {quizData.related_topics.map((t, i) => (
                <span key={i} className="tag tag-default">{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

        :root {
          --font-display: 'Syne', sans-serif;
          --font-body: 'DM Sans', sans-serif;
          --bg: #0c0f14;
          --surface: #13181f;
          --surface-2: #1a2030;
          --border: rgba(255,255,255,0.07);
          --border-hover: rgba(255,255,255,0.14);
          --accent: #6366f1;
          --accent-2: #818cf8;
          --accent-glow: rgba(99,102,241,0.15);
          --text-primary: #f1f5f9;
          --text-secondary: #94a3b8;
          --text-muted: #4b5563;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: var(--bg);
          color: var(--text-primary);
          font-family: var(--font-body);
          min-height: 100vh;
        }

        .app-root {
          min-height: 100vh;
          background:
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.12) 0%, transparent 70%),
            var(--bg);
        }

        .container {
          max-width: 860px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem 4rem;
        }

        /* Header */
        .header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .logo-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px; height: 56px;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          border-radius: 16px;
          font-size: 1.6rem;
          color: white;
          margin-bottom: 1rem;
          box-shadow: 0 0 32px rgba(99,102,241,0.35);
        }
        .header h1 {
          font-family: var(--font-display);
          font-size: clamp(2rem, 5vw, 2.75rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #f1f5f9 30%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
          margin-bottom: 0.5rem;
        }
        .header p {
          color: var(--text-secondary);
          font-size: 1rem;
          letter-spacing: 0.01em;
        }

        /* Tabs */
        .tabs {
          display: flex;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 4px;
          gap: 4px;
          margin-bottom: 2rem;
          width: fit-content;
          margin-left: auto;
          margin-right: auto;
        }
        .tab-btn {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.6rem 1.4rem;
          border-radius: 9px;
          border: none;
          font-family: var(--font-body);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s;
          color: var(--text-secondary);
          background: transparent;
        }
        .tab-btn.active {
          background: var(--accent);
          color: white;
          box-shadow: 0 2px 12px rgba(99,102,241,0.35);
        }
        .tab-btn:not(.active):hover { color: var(--text-primary); background: var(--surface-2); }

        /* Input card */
        .input-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.75rem;
        }
        .url-input {
          width: 100%;
          padding: 0.875rem 1rem;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          margin-bottom: 0.875rem;
        }
        .url-input::placeholder { color: var(--text-muted); }
        .url-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }

        /* Buttons */
        .btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 0.75rem 1.5rem;
          font-family: var(--font-body);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          box-shadow: 0 2px 16px rgba(99,102,241,0.3);
          width: 100%;
        }
        .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 24px rgba(99,102,241,0.45); }
        .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: var(--surface-2);
          color: var(--text-secondary);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0.65rem 1.25rem;
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s;
        }
        .btn-ghost:hover { border-color: var(--border-hover); color: var(--text-primary); }

        /* Cards */
        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.5rem;
          transition: border-color 0.2s;
        }
        .question-card { padding: 1.25rem 1.5rem; }
        .entity-card { padding: 1.25rem; }

        .section-label {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: 0.6rem;
        }

        /* Q number */
        .q-number {
          width: 28px; height: 28px;
          background: var(--accent-glow);
          border: 1px solid rgba(99,102,241,0.3);
          color: var(--accent-2);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display);
          font-size: 0.8rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        /* Difficulty badge */
        .difficulty-badge {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          padding: 0.25rem 0.7rem;
          border-radius: 999px;
          border: 1px solid;
          flex-shrink: 0;
        }

        /* Option */
        .option-label {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.7rem 1rem;
          border-radius: 10px;
          border: 1.5px solid;
          cursor: pointer;
          transition: all 0.15s;
          font-weight: 500;
        }
        .option-label:hover { border-color: var(--accent) !important; }
        .option-key {
          width: 26px; height: 26px;
          background: rgba(255,255,255,0.05);
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.78rem;
          font-weight: 700;
          font-family: var(--font-display);
          flex-shrink: 0;
        }

        /* Tags */
        .tag {
          font-size: 0.78rem;
          padding: 0.25rem 0.7rem;
          border-radius: 6px;
          font-weight: 500;
        }
        .tag-blue { background: rgba(59,130,246,0.12); color: #93c5fd; }
        .tag-green { background: rgba(16,185,129,0.12); color: #6ee7b7; }
        .tag-purple { background: rgba(139,92,246,0.12); color: #c4b5fd; }
        .tag-default { background: var(--surface-2); color: var(--text-secondary); border: 1px solid var(--border); }

        .chip {
          display: inline-flex; align-items: center; gap: 0.35rem;
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--accent-2);
          background: var(--accent-glow);
          border: 1px solid rgba(99,102,241,0.2);
          padding: 0.25rem 0.65rem;
          border-radius: 6px;
        }

        /* History table */
        .history-table-wrap {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
        }
        .history-table { width: 100%; border-collapse: collapse; }
        .history-table th {
          padding: 0.875rem 1.25rem;
          text-align: left;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          background: var(--surface-2);
          border-bottom: 1px solid var(--border);
        }
        .history-table td {
          padding: 0.875rem 1.25rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border);
        }
        .history-table tr:last-child td { border-bottom: none; }
        .history-table tr:hover td { background: rgba(255,255,255,0.02); }
        .history-table td.title { color: var(--text-primary); font-weight: 500; }

        /* Empty state */
        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
        }
        .empty-icon {
          font-size: 2.5rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
          display: block;
        }
        .empty-state h3 { font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 0.4rem; }
        .empty-state p { color: var(--text-muted); font-size: 0.875rem; }

        /* Loading spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.8s linear infinite; display: inline-block; }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          z-index: 50;
        }
        .modal-box {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 20px;
          max-width: 820px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 80px rgba(0,0,0,0.6);
        }
        .modal-header {
          position: sticky; top: 0;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
          padding: 1.25rem 1.5rem;
          display: flex; justify-content: space-between; align-items: center;
          z-index: 10;
        }
        .modal-close {
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.15s;
        }
        .modal-close:hover { color: var(--text-primary); border-color: var(--border-hover); }

        .small-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.4rem 0.875rem;
          font-size: 0.8rem;
          font-weight: 600;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 7px;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .small-btn:hover { opacity: 0.85; }
      `}</style>

      <div className="app-root">
        <div className="container">
          {/* Header */}
          <header className="header">
            <div className="logo-wrap">
              <RiBrainLine />
            </div>
            <h1>AI Quiz Generator</h1>
            <p>Turn any Wikipedia article into an intelligent quiz</p>
          </header>

          {/* Tabs */}
          <div className="tabs">
            <button className={`tab-btn ${activeTab === 'generate' ? 'active' : ''}`} onClick={() => setActiveTab('generate')}>
              <RiSparklingLine /> Generate
            </button>
            <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => { setActiveTab('history'); loadHistory() }}>
              <RiHistoryLine /> History
            </button>
          </div>

          {/* Generate Tab */}
          {activeTab === 'generate' && (
            <div>
              <div className="input-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.875rem' }}>
                  <RiLinkM style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Wikipedia URL</span>
                </div>
                <input
                  className="url-input"
                  type="text"
                  placeholder="https://en.wikipedia.org/wiki/Artificial_intelligence"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !loading && url && generateQuiz()}
                />
                <button className="btn-primary" onClick={generateQuiz} disabled={loading || !url}>
                  {loading ? (
                    <>
                      <span className="spinner"><RiSparklingLine /></span>
                      Generating Quiz…
                    </>
                  ) : (
                    <>
                      <RiSendPlaneLine /> Generate Quiz
                    </>
                  )}
                </button>
              </div>

              {quiz && <QuizDisplay quizData={quiz} mode={quizMode} />}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="history-table-wrap">
              {history.length === 0 ? (
                <div className="empty-state">
                  <RiHistoryLine className="empty-icon" />
                  <h3>No quizzes yet</h3>
                  <p>Generate your first quiz and it will appear here</p>
                </div>
              ) : (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id}>
                        <td style={{ color: 'var(--text-muted)' }}>{item.id}</td>
                        <td className="title">{item.title}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <RiTimeLine style={{ opacity: 0.5, fontSize: '0.85rem' }} />
                            {new Date(item.date_generated).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </td>
                        <td>
                          <button className="small-btn" onClick={() => loadQuizDetails(item.id)}>
                            <RiEyeLine /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedQuiz && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RiBookOpenLine style={{ color: 'var(--accent)' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>Quiz Details</span>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <RiCloseLine />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <QuizDisplay quizData={selectedQuiz} mode={quizMode} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App