'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

interface Word {
  id: string
  word: string
  phonetic: string | null
  meaning: string | null
  examples: string[]
  images: string[]
  scenario: string | null
  scenarioImages: string[]
  emotionalConnection: string | null
  tags: string[]
}

interface User {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
}

interface Quiz {
  id: string
  title: string
  description: string | null
  type: string
  wordIds: string[]
  createdBy: { id: string; name: string | null; email: string }
  createdAt: string
}

async function fetchDefinition(word: string, targetPOS: string, level: string = 'A1') {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: word.trim(), partOfSpeech: targetPOS, level })
    })
    
    if (response.ok) {
      return await response.json()
    }
    return null
  } catch (error) {
    console.error('Fetch definition error:', error)
    return null
  }
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'words' | 'users' | 'quizzes'>('words')
  const [words, setWords] = useState<Word[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [topicFilter, setTopicFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  
  // Quiz form state
  const [quizTitle, setQuizTitle] = useState('')
  const [quizDescription, setQuizDescription] = useState('')
  const [quizType, setQuizType] = useState('image-to-word')
  const [quizWordIds, setQuizWordIds] = useState<string[]>([])
  const [showAddQuizModal, setShowAddQuizModal] = useState(false)
  
  // Add user form fields
  const [addUserForm, setAddUserForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'User',
  })
  
  const [formData, setFormData] = useState({
    phonetic: '',
    meaning: '',
    scenario: '',
    emotionalConnection: '',
    images: '',
    scenarioImages: '',
    examples: '',
    partOfSpeech: 'noun',
    category: 'General',
    level: 'A1',
  })

  const [autoFilling, setAutoFilling] = useState(false)

  function initFormFromWord(word: Word) {
    const tags = word.tags || []
    return {
      phonetic: word.phonetic || '',
      meaning: word.meaning || '',
      scenario: word.scenario || '',
      emotionalConnection: word.emotionalConnection || '',
      images: word.images.join('\n'),
      scenarioImages: word.scenarioImages.join('\n'),
      examples: (word.examples || []).join('\n'),
      partOfSpeech: tags[0] || 'noun',
      category: tags[1] || 'General',
      level: tags[2] || 'A1',
    }
  }

  const [addForm, setAddForm] = useState({
    word: '',
    phonetic: '',
    meaning: '',
    scenario: '',
    emotionalConnection: '',
    images: '',
    scenarioImages: '',
    examples: '',
    partOfSpeech: 'noun',
    category: 'General',
    level: 'A1',
  })

  const resetAddForm = () => {
    setAddForm({
      word: '',
      phonetic: '',
      meaning: '',
      scenario: '',
      emotionalConnection: '',
      images: '',
      scenarioImages: '',
      examples: '',
      partOfSpeech: 'noun',
      category: 'General',
      level: 'A1',
    })
  }

  const { user, token } = useAuth()

  const openAddModal = () => {
    resetAddForm()
    setShowAddModal(true)
  }
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    
    if (!user) {
      router.push('/login')
    } else if (user.role !== 'admin' && user.role !== 'Admin' && user.role !== 'Teacher' && user.role !== 'teacher') {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'Admin' && user.role !== 'Teacher' && user.role !== 'teacher')) return
    
    setLoading(true)
    if (activeTab === 'words') {
      fetchWords()
    } else if (activeTab === 'users' && (user.role === 'admin' || user.role === 'Admin')) {
      fetchUsers()
    } else if (activeTab === 'quizzes') {
      fetchQuizzes()
    }
  }, [user, activeTab])

  async function fetchQuizzes() {
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const res = await fetch('/api/quiz', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setQuizzes(data.quizzes || [])
    } catch (error) {
      console.error('Failed to fetch quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchWords() {
    try {
      const res = await fetch('/api/words?limit=5000')
      const data = await res.json()
      setWords(data.words || [])
    } catch (error) {
      console.error('Failed to fetch words:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchUsers() {
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  function selectWord(word: Word) {
    setSelectedWord(word)
    setFormData(initFormFromWord(word))
  }

  async function saveWord() {
    if (!selectedWord || !token) return
    
    setSaving(true)
    try {
      const images = formData.images.split('\n').filter((url) => url.trim())
      const scenarioImages = formData.scenarioImages.split('\n').filter((url) => url.trim())
      const tags = [formData.partOfSpeech, formData.category, formData.level]

      const res = await fetch(`/api/words/${selectedWord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phonetic: formData.phonetic || null,
          meaning: formData.meaning || null,
          scenario: formData.scenario || null,
          emotionalConnection: formData.emotionalConnection || null,
          images: JSON.stringify(images),
          scenarioImages: JSON.stringify(scenarioImages),
          examples: JSON.stringify(formData.examples.split('\n').filter(s => s.trim())),
          tags: JSON.stringify(tags),
        }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Word saved successfully!' })
        fetchWords()
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: 'Failed to save word' })
      }
    } catch (error) {
      console.error('Failed to save:', error)
      setMessage({ type: 'error', text: 'Failed to save word' })
    } finally {
      setSaving(false)
    }
  }

  async function deleteWord() {
    if (!selectedWord || !token) return
    if (!confirm(`Are you sure you want to delete "${selectedWord.word}"?`)) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/words?id=${selectedWord.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Word deleted successfully!' })
        setSelectedWord(null)
        fetchWords()
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: 'Failed to delete word' })
      }
    } catch (error) {
      console.error('Failed to delete:', error)
      setMessage({ type: 'error', text: 'Failed to delete word' })
    } finally {
      setSaving(false)
    }
  }

  async function autoFillWord() {
    if (!selectedWord || !token) return
    
    setAutoFilling(true)
    try {
      const word = selectedWord.word
      const result = await fetchDefinition(word, formData.partOfSpeech, formData.level)
      
      if (!result) {
        throw new Error('Failed to fetch definition')
      }

      setFormData(prev => ({
        ...prev,
        phonetic: result.phonetic || prev.phonetic,
        meaning: result.meaning || prev.meaning,
        examples: Array.isArray(result.examples) ? result.examples.join('\n') : prev.examples,
        scenario: result.scenario || prev.scenario,
        emotionalConnection: result.emotionalConnection || prev.emotionalConnection,
      }))
      setMessage({ type: 'success', text: '✨ Auto-filled by AI!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Auto-fill error:', error)
      setMessage({ type: 'error', text: 'Failed to auto-fill' })
    } finally {
      setAutoFilling(false)
    }
  }

  async function addWord() {
    if (!addForm.word.trim() || !token) return
    
    setSaving(true)
    try {
      const images = addForm.images.split('\n').filter((url) => url.trim())
      const scenarioImages = addForm.scenarioImages.split('\n').filter((url) => url.trim())
      const tags = [addForm.partOfSpeech, addForm.category, addForm.level]

      const res = await fetch('/api/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          word: addForm.word.trim(),
          phonetic: addForm.phonetic || null,
          meaning: addForm.meaning || null,
          scenario: addForm.scenario || null,
          emotionalConnection: addForm.emotionalConnection || null,
          images,
          scenarioImages,
          examples: addForm.examples.split('\n').filter(s => s.trim()),
          tags,
        }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Word added successfully!' })
        resetAddForm()
        setShowAddModal(false)
        fetchWords()
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: 'Failed to add word' })
      }
    } catch (error) {
      console.error('Failed to add:', error)
      setMessage({ type: 'error', text: 'Failed to add word' })
    } finally {
      setSaving(false)
    }
  }

  async function updateUserRole(userId: string, role: string) {
    if (!token) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      })
      if (res.ok) {
        setMessage({ type: 'success', text: 'User role updated!' })
        fetchUsers()
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: 'Failed to update user' })
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      setMessage({ type: 'error', text: 'Failed to update user' })
    } finally {
      setSaving(false)
    }
  }

  async function deleteUser(userId: string) {
    if (!token) return
    if (!confirm('Are you sure you want to delete this user?')) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setMessage({ type: 'success', text: 'User deleted!' })
        setSelectedUser(null)
        fetchUsers()
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: 'Failed to delete user' })
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      setMessage({ type: 'error', text: 'Failed to delete user' })
    } finally {
      setSaving(false)
    }
  }

  async function addUser() {
    if (!addUserForm.email.trim() || !addUserForm.password || !token) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: addUserForm.email.trim(),
          password: addUserForm.password,
          name: addUserForm.name.trim() || null,
          role: addUserForm.role,
        }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'User added successfully!' })
        setShowAddUserModal(false)
        setAddUserForm({ email: '', password: '', name: '', role: 'User' })
        fetchUsers()
        setTimeout(() => setMessage(null), 3000)
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Failed to add user' })
      }
    } catch (error) {
      console.error('Failed to add user:', error)
      setMessage({ type: 'error', text: 'Failed to add user' })
    } finally {
      setSaving(false)
    }
  }

  async function deleteQuiz(quizId: string) {
    if (!token) return
    if (!confirm('Are you sure you want to delete this quiz?')) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/quiz?id=${quizId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: 'Quiz deleted!' })
        setSelectedQuiz(null)
        fetchQuizzes()
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete quiz' })
      }
    } catch (error) {
      console.error('Failed to delete quiz:', error)
      setMessage({ type: 'error', text: 'Failed to delete quiz' })
    } finally {
      setSaving(false)
    }
  }

  function toggleQuizWord(wordId: string) {
    if (quizWordIds.includes(wordId)) {
      setQuizWordIds(quizWordIds.filter(id => id !== wordId))
    } else {
      setQuizWordIds([...quizWordIds, wordId])
    }
  }

  async function createQuiz() {
    if (!quizTitle.trim() || !quizWordIds.length || !token) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: quizTitle.trim(),
          description: quizDescription.trim() || null,
          type: quizType,
          wordIds: quizWordIds,
        }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Quiz created successfully!' })
        setShowAddQuizModal(false)
        setQuizTitle('')
        setQuizDescription('')
        setQuizType('image-to-word')
        setQuizWordIds([])
        fetchQuizzes()
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: 'Failed to create quiz' })
      }
    } catch (error) {
      console.error('Failed to create quiz:', error)
      setMessage({ type: 'error', text: 'Failed to create quiz' })
    } finally {
      setSaving(false)
    }
  }

  const filteredWords = words.filter((w) => {
    const matchesSearch = w.word.toLowerCase().includes(search.toLowerCase())
    const matchesLevel = !levelFilter || w.tags.includes(levelFilter)
    const matchesTopic = !topicFilter || w.tags.includes(topicFilter)
    return matchesSearch && matchesLevel && matchesTopic
  })

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
    return matchesSearch
  })

  const topics = [...new Set(words.map((w) => w.tags[1]).filter(Boolean))]
  const levels = [...new Set(words.map((w) => w.tags[2]).filter(Boolean))]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('words')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'words' ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}
            >
              Words
            </button>
            {(user?.role === 'admin' || user?.role === 'Admin') && (
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'users' ? 'bg-purple-600 text-white' : 'bg-gray-200'
                }`}
              >
                Users
              </button>
            )}
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'quizzes' ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}
            >
              Quizzes
            </button>
            {activeTab === 'users' && (user?.role === 'admin' || user?.role === 'Admin') && (
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                + Add User
              </button>
            )}
            {activeTab === 'quizzes' && (
              <button
                onClick={() => setShowAddQuizModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                + Create Quiz
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {activeTab === 'words' && (user?.role === 'admin' || user?.role === 'Admin') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Word List */}
            <div className="lg:col-span-1 bg-white rounded-2xl p-4 shadow-md">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search words..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              
              <div className="flex gap-2 mb-4">
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="flex-1 p-2 border rounded-lg text-sm"
                >
                  <option value="">All Levels</option>
                  {levels.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                <select
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                  className="flex-1 p-2 border rounded-lg text-sm"
                >
                  <option value="">All Topics</option>
                  {topics.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">{filteredWords.length} words</span>
                <button
                  onClick={openAddModal}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                >
                  + Add
                </button>
              </div>

              <div className="max-h-[600px] overflow-y-auto space-y-1">
                {filteredWords.map((word) => (
                  <button
                    key={word.id}
                    onClick={() => selectWord(word)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedWord?.id === word.id
                        ? 'bg-purple-500 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{word.word}</div>
                    <div className={`text-xs ${selectedWord?.id === word.id ? 'text-white/70' : 'text-gray-500'}`}>
                      {word.tags.slice(0, 2).join(' • ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Edit Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-md">
              {selectedWord ? (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedWord.word}</h2>
                      <p className="text-gray-500">
                        {selectedWord.tags.join(' • ')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={autoFillWord}
                        disabled={autoFilling}
                        className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm rounded hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 flex items-center gap-1"
                      >
                        {autoFilling ? (
                          <>
                            <span className="animate-spin">⏳</span> Filling...
                          </>
                        ) : (
                          <>✨ Auto Fill</>
                        )}
                      </button>
                      <button
                        onClick={deleteWord}
                        disabled={saving}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {selectedWord.meaning && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <label className="block text-xs font-medium text-blue-600 mb-1">Meaning</label>
                      <p className="text-sm text-gray-700">{selectedWord.meaning}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Part of Speech</label>
                      <select
                        value={formData.partOfSpeech}
                        onChange={(e) => setFormData({ ...formData, partOfSpeech: e.target.value })}
                        className="w-full p-2 border rounded-lg text-sm"
                      >
                        <option value="noun">noun</option>
                        <option value="verb">verb</option>
                        <option value="adjective">adjective</option>
                        <option value="adverb">adverb</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-2 border rounded-lg text-sm"
                      >
                        <option value="General">General</option>
                        <option value="food">food</option>
                        <option value="travel">travel</option>
                        <option value="sports">sports</option>
                        <option value="work">work</option>
                        <option value="animals">animals</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Level</label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full p-2 border rounded-lg text-sm"
                      >
                        <option value="A1">A1</option>
                        <option value="A2">A2</option>
                        <option value="B1">B1</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phonetic</label>
                      <input
                        type="text"
                        value={formData.phonetic}
                        onChange={(e) => setFormData({ ...formData, phonetic: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Definition</label>
                      <textarea
                        value={formData.meaning}
                        onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                        rows={4}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Scenario</label>
                      <textarea
                        value={formData.scenario}
                        onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
                        rows={3}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Examples (one per line)</label>
                      <textarea
                        value={formData.examples}
                        onChange={(e) => setFormData({ ...formData, examples: e.target.value })}
                        rows={4}
                        className="w-full p-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Images (one per line)</label>
                      <textarea
                        value={formData.images}
                        onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                        rows={3}
                        className="w-full p-2 border rounded-lg font-mono text-sm"
                      />
                    </div>
                    <button
                      onClick={saveWord}
                      disabled={saving}
                      className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  Select a word to edit
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (user?.role === 'admin' || user?.role === 'Admin') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User List */}
            <div className="lg:col-span-1 bg-white rounded-2xl p-4 shadow-md">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="text-sm text-gray-500 mb-2">{filteredUsers.length} users</div>
              <div className="max-h-[600px] overflow-y-auto space-y-1">
                {filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedUser?.id === u.id
                        ? 'bg-purple-500 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{u.name || u.email}</div>
                    <div className={`text-xs ${selectedUser?.id === u.id ? 'text-white/70' : 'text-gray-500'}`}>
                      {u.role} • {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* User Edit */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-md">
              {selectedUser ? (
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedUser.name || 'No name'}</h2>
                      <p className="text-gray-500">{selectedUser.email}</p>
                    </div>
                    <button
                      onClick={() => deleteUser(selectedUser.id)}
                      disabled={saving || selectedUser.id === user?.id}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>

                    <div className="p-4 bg-gray-50 rounded-lg mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                      value={selectedUser.role}
                      onChange={(e) => updateUserRole(selectedUser.id, e.target.value)}
                      disabled={saving || selectedUser.id === user?.id}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="User">User</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div className="text-sm text-gray-500">
                    Created: {new Date(selectedUser.createdAt).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  Select a user to edit
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quiz List */}
            <div className="lg:col-span-1 bg-white rounded-2xl p-4 shadow-md">
              <div className="text-sm text-gray-500 mb-2">{quizzes.length} quizzes</div>
              <div className="max-h-[600px] overflow-y-auto space-y-1">
                {quizzes.map((quiz) => (
                  <button
                    key={quiz.id}
                    onClick={() => setSelectedQuiz(quiz)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedQuiz?.id === quiz.id
                        ? 'bg-purple-500 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{quiz.title}</div>
                    <div className={`text-xs ${selectedQuiz?.id === quiz.id ? 'text-white/70' : 'text-gray-500'}`}>
                      {quiz.type} • {quiz.wordIds.length} words
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quiz Detail */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-md">
              {selectedQuiz ? (
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedQuiz.title}</h2>
                      <p className="text-gray-500">{selectedQuiz.description}</p>
                    </div>
                    <button
                      onClick={() => deleteQuiz(selectedQuiz.id)}
                      disabled={saving}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                        <span className="font-medium">{selectedQuiz.type}</span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Words</label>
                        <span className="font-medium">{selectedQuiz.wordIds.length}</span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Created By</label>
                        <span className="font-medium">{selectedQuiz.createdBy.name || selectedQuiz.createdBy.email}</span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Created</label>
                        <span className="font-medium">{new Date(selectedQuiz.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/quiz/${selectedQuiz.id}`)}
                    className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                  >
                    Take Quiz
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  Select a quiz to view details
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && activeTab === 'words' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Add New Word</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Word *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={addForm.word}
                      onChange={(e) => setAddForm({ ...addForm, word: e.target.value })}
                      className="flex-1 p-2 border rounded-lg"
                      placeholder="Enter new word"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!addForm.word.trim()) return
                        setAutoFilling(true)
                        try {
                          const result = await fetchDefinition(addForm.word, addForm.partOfSpeech, addForm.level)
                          
                          if (!result) {
                            throw new Error('Failed to fetch definition')
                          }
                          
                          setAddForm(prev => ({
                            ...prev,
                            phonetic: result.phonetic || prev.phonetic,
                            meaning: result.meaning || prev.meaning,
                            examples: Array.isArray(result.examples) ? result.examples.join('\n') : prev.examples,
                            scenario: result.scenario || prev.scenario,
                            emotionalConnection: result.emotionalConnection || prev.emotionalConnection,
                          }))
                          setMessage({ type: 'success', text: '✨ AI generation complete!' })
                          setTimeout(() => setMessage(null), 3000)
                        } catch (error) {
                          console.error('Auto-fill error:', error)
                          setMessage({ type: 'error', text: 'Failed to auto-fill' })
                        } finally {
                          setAutoFilling(false)
                        }
                      }}
                      disabled={autoFilling || !addForm.word.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
                    >
                      {autoFilling ? 'Generating...' : '✨ Auto Fill'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Part of Speech</label>
                    <select
                      value={addForm.partOfSpeech}
                      onChange={(e) => setAddForm({ ...addForm, partOfSpeech: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="noun">noun</option>
                      <option value="verb">verb</option>
                      <option value="adjective">adjective</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={addForm.category}
                      onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="General">General</option>
                      <option value="food">food</option>
                      <option value="travel">travel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                    <select
                      value={addForm.level}
                      onChange={(e) => setAddForm({ ...addForm, level: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="A1">A1</option>
                      <option value="A2">A2</option>
                      <option value="B1">B1</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phonetic</label>
                  <input
                    type="text"
                    value={addForm.phonetic}
                    onChange={(e) => setAddForm({ ...addForm, phonetic: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Definition</label>
                  <textarea
                    value={addForm.meaning}
                    onChange={(e) => setAddForm({ ...addForm, meaning: e.target.value })}
                    rows={3}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scenario</label>
                  <textarea
                    value={addForm.scenario}
                    onChange={(e) => setAddForm({ ...addForm, scenario: e.target.value })}
                    rows={2}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Examples (one per line)</label>
                  <textarea
                    value={addForm.examples}
                    onChange={(e) => setAddForm({ ...addForm, examples: e.target.value })}
                    rows={3}
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Images (one per line)</label>
                  <textarea
                    value={addForm.images}
                    onChange={(e) => setAddForm({ ...addForm, images: e.target.value })}
                    rows={2}
                    className="w-full p-2 border rounded-lg font-mono text-sm"
                  />
                </div>
              </div>

                <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    resetAddForm()
                    setShowAddModal(false)
                  }}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={addWord}
                  disabled={saving || !addForm.word.trim()}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add Word'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Add New User</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={addUserForm.email}
                    onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    value={addUserForm.password}
                    onChange={(e) => setAddUserForm({ ...addUserForm, password: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={addUserForm.name}
                    onChange={(e) => setAddUserForm({ ...addUserForm, name: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={addUserForm.role}
                    onChange={(e) => setAddUserForm({ ...addUserForm, role: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="User">User</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={addUser}
                  disabled={saving || !addUserForm.email.trim() || !addUserForm.password}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Quiz Modal */}
        {showAddQuizModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Create Quiz</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="Quiz title"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={quizDescription}
                    onChange={(e) => setQuizDescription(e.target.value)}
                    placeholder="Optional description"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Type *</label>
                  <select
                    value={quizType}
                    onChange={(e) => setQuizType(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="image-to-word">Image → Word (see image, type word)</option>
                    <option value="word-to-image">Word → Image (see word, pick image)</option>
                    <option value="fill-blank">Fill in the Blanks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Words ({quizWordIds.length}) *</label>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                    {words.map((word) => (
                      <button
                        key={word.id}
                        type="button"
                        onClick={() => toggleQuizWord(word.id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          quizWordIds.includes(word.id)
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {word.word}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowAddQuizModal(false)}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={createQuiz}
                  disabled={saving || !quizTitle.trim() || !quizWordIds.length}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Quiz'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
