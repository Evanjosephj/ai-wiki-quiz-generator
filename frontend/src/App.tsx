import { useState } from 'react'

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

function App() {
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [showModal, setShowModal] = useState(false)
  
  // Take Quiz Mode States
  const [quizMode, setQuizMode] = useState<'view' | 'take'>('view')
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

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
        body: JSON.stringify({ url })
      })

      if (!response.ok) {
        throw new Error('Failed to generate quiz')
      }

      const data = await response.json()
      setQuiz(data)
      setQuizMode('view')
      setUserAnswers({})
      setShowResults(false)
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
    } catch (error) {
      alert('Error loading quiz: ' + error)
    }
  }

  const handleTakeQuiz = () => {
    setQuizMode('take')
    setUserAnswers({})
    setShowResults(false)
    setScore(0)
  }

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: answer
    })
  }

  const handleSubmitQuiz = () => {
    if (!quiz) return
    
    const answeredCount = Object.keys(userAnswers).length
    if (answeredCount < quiz.quiz.length) {
      const confirm = window.confirm(
        `You've only answered ${answeredCount} out of ${quiz.quiz.length} questions. Submit anyway?`
      )
      if (!confirm) return
    }

    let correctCount = 0
    quiz.quiz.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) {
        correctCount++
      }
    })

    setScore(correctCount)
    setShowResults(true)
  }

  const handleBackToView = () => {
    setQuizMode('view')
    setUserAnswers({})
    setShowResults(false)
  }

  const QuizDisplay = ({ quizData, mode = 'view' }: { quizData: Quiz, mode?: 'view' | 'take' }) => {
    const isViewMode = mode === 'view'
    const isTakeMode = mode === 'take'

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-3xl font-bold text-gray-800">{quizData.title}</h2>
            {isViewMode && (
              <button
                onClick={handleTakeQuiz}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                📝 Take Quiz
              </button>
            )}
            {isTakeMode && !showResults && (
              <button
                onClick={handleBackToView}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                👁️ View Mode
              </button>
            )}
          </div>

          {showResults && (
            <div className={`mb-6 p-6 rounded-lg ${
              score >= quizData.quiz.length * 0.8 ? 'bg-green-100 border-2 border-green-500' :
              score >= quizData.quiz.length * 0.5 ? 'bg-yellow-100 border-2 border-yellow-500' :
              'bg-red-100 border-2 border-red-500'
            }`}>
              <h3 className="text-2xl font-bold mb-2">
                {score >= quizData.quiz.length * 0.8 ? '🎉 Excellent!' :
                 score >= quizData.quiz.length * 0.5 ? '👍 Good Job!' :
                 '💪 Keep Learning!'}
              </h3>
              <p className="text-xl">
                Your Score: <strong>{score}</strong> out of <strong>{quizData.quiz.length}</strong>
                {' '}({Math.round((score / quizData.quiz.length) * 100)}%)
              </p>
              <button
                onClick={handleBackToView}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                View Answers & Explanations
              </button>
            </div>
          )}

          {isViewMode && (
            <>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Summary</h3>
                <p className="text-gray-600">{quizData.summary}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">Key Entities</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded">
                    <strong className="text-blue-700">People:</strong>
                    <p className="text-gray-700 mt-1">{quizData.key_entities?.people?.join(', ') || 'None'}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded">
                    <strong className="text-green-700">Organizations:</strong>
                    <p className="text-gray-700 mt-1">{quizData.key_entities?.organizations?.join(', ') || 'None'}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded">
                    <strong className="text-purple-700">Locations:</strong>
                    <p className="text-gray-700 mt-1">{quizData.key_entities?.locations?.join(', ') || 'None'}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              {isTakeMode && !showResults ? 'Answer the Questions' : 'Quiz Questions'}
            </h3>
            <div className="space-y-4">
              {quizData.quiz?.map((q, idx) => (
                <div 
                  key={idx} 
                  className={`border rounded-lg p-5 ${
                    showResults 
                      ? userAnswers[idx] === q.answer 
                        ? 'bg-green-50 border-green-500' 
                        : 'bg-red-50 border-red-500'
                      : isTakeMode 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-semibold text-gray-800">Question {idx + 1}</h4>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      q.difficulty === 'easy' ? 'bg-green-200 text-green-800' :
                      q.difficulty === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4 font-medium">{q.question}</p>

                  {isTakeMode && !showResults ? (
                    <div className="space-y-2">
                      {q.options.map((opt, i) => (
                        <label 
                          key={i} 
                          className={`flex items-center p-3 rounded cursor-pointer transition-colors ${
                            userAnswers[idx] === opt.charAt(0) 
                              ? 'bg-blue-200 border-2 border-blue-500' 
                              : 'bg-white border-2 border-gray-300 hover:bg-blue-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${idx}`}
                            value={opt.charAt(0)}
                            checked={userAnswers[idx] === opt.charAt(0)}
                            onChange={(e) => handleAnswerSelect(idx, e.target.value)}
                            className="mr-3 w-4 h-4"
                          />
                          <span className="text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <>
                      <ul className="space-y-2 mb-4">
                        {q.options.map((opt, i) => (
                          <li 
                            key={i} 
                            className={`pl-4 ${
                              showResults && opt.charAt(0) === q.answer ? 'font-bold text-green-700' :
                              showResults && opt.charAt(0) === userAnswers[idx] ? 'font-bold text-red-700' :
                              'text-gray-600'
                            }`}
                          >
                            {opt}
                            {showResults && opt.charAt(0) === q.answer && ' ✓'}
                            {showResults && opt.charAt(0) === userAnswers[idx] && opt.charAt(0) !== q.answer && ' ✗'}
                          </li>
                        ))}
                      </ul>

                      {(isViewMode || showResults) && (
                        <details className="cursor-pointer" open={showResults}>
                          <summary className="text-blue-600 font-medium hover:text-blue-800">
                            {showResults ? 'Answer & Explanation' : 'Show Answer'}
                          </summary>
                          <div className="mt-3 p-4 bg-white rounded border-l-4 border-blue-500">
                            <p className="text-gray-800"><strong>Answer:</strong> {q.answer}</p>
                            <p className="text-gray-600 mt-2"><strong>Explanation:</strong> {q.explanation}</p>
                            {showResults && userAnswers[idx] && (
                              <p className="mt-2">
                                <strong>Your Answer:</strong> 
                                <span className={userAnswers[idx] === q.answer ? 'text-green-600' : 'text-red-600'}>
                                  {' '}{userAnswers[idx]} {userAnswers[idx] === q.answer ? '✓' : '✗'}
                                </span>
                              </p>
                            )}
                          </div>
                        </details>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {isTakeMode && !showResults && (
              <button
                onClick={handleSubmitQuiz}
                className="w-full mt-6 bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                Submit Quiz 🎯
              </button>
            )}
          </div>

          {isViewMode && (
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">Related Topics</h3>
              <div className="flex flex-wrap gap-2">
                {quizData.related_topics?.map((topic, idx) => (
                  <span key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">🧠 AI Quiz Generator</h1>
          <p className="text-gray-600 text-lg">Generate intelligent quizzes from Wikipedia articles using AI</p>
        </header>

        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'generate'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Generate Quiz
            </button>
            <button
              onClick={() => { setActiveTab('history'); loadHistory(); }}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              History
            </button>
          </div>
        </div>

        {activeTab === 'generate' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <input
                type="text"
                placeholder="Enter Wikipedia URL (e.g., https://en.wikipedia.org/wiki/Python_(programming_language))"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                onClick={generateQuiz}
                disabled={loading || !url}
                className={`w-full mt-4 py-3 rounded-lg font-semibold text-white transition-all ${
                  loading || !url
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating Quiz...
                  </span>
                ) : (
                  'Generate Quiz'
                )}
              </button>
            </div>

            {quiz && <QuizDisplay quizData={quiz} mode={quizMode} />}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {history.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <p className="text-xl">No quizzes generated yet.</p>
                  <p className="mt-2">Generate your first quiz to see it here!</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Title</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">URL</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {history.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-600">{item.id}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{item.title}</td>
                        <td className="px-6 py-4 text-sm text-blue-600 truncate max-w-xs">{item.url}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(item.date_generated).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => loadQuizDetails(item.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {showModal && selectedQuiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Quiz Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <QuizDisplay quizData={selectedQuiz} mode={quizMode} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App