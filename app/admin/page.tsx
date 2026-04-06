'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

interface Word {
  id: string
  word: string
  partOfSpeech: string
  senseIndex: number
  phonetic: string | null
  meaning: string | null
  examples: string[]
  images: string[]
  scenario: string | null
  scenarioImages: string[]
  emotionalConnection: string | null
  tags: string[]
  level: string
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

const PAGE_SIZE = 50
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
// Default topics kept as fallback
const DEFAULT_TOPICS = ['General', 'food', 'travel', 'sports', 'work', 'animals']
const DEFAULT_POS = ['noun', 'verb', 'adjective', 'adverb']

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'words' | 'users' | 'quizzes'>('words')
  const [words, setWords] = useState<Word[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [topicFilter, setTopicFilter] = useState('')
  const [wordOffset, setWordOffset] = useState(0)
  const [hasMoreWords, setHasMoreWords] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalWords, setTotalWords] = useState(0)
  const [dynamicTopics, setDynamicTopics] = useState<string[]>(DEFAULT_TOPICS)
  const [dynamicPOS, setDynamicPOS] = useState<string[]>(DEFAULT_POS)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importWords, setImportWords] = useState<any[]>([])
  const [overrideExisting, setOverrideExisting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
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
    tags: [] as string[],
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
      partOfSpeech: word.partOfSpeech || 'noun',
      category: tags[1] || 'General',
      level: word.level || 'A1',
      tags: tags,
    }
  }

  function removeTag(tagToRemove: string) {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }))
  }

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const input = e.currentTarget
      const newTag = input.value.trim()
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }))
        input.value = ''
      }
      e.preventDefault()
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
      fetchMetadata()
    } else if (activeTab === 'users' && (user.role === 'admin' || user.role === 'Admin')) {
      fetchUsers()
    } else if (activeTab === 'quizzes') {
      fetchQuizzes()
    }
  }, [user, activeTab])

  async function fetchMetadata() {
    if (!token) return
    try {
      const res = await fetch('/api/admin/words/metadata', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setDynamicTopics(data.categories?.length > 0 ? data.categories : DEFAULT_TOPICS)
        setDynamicPOS(data.partsOfSpeech?.length > 0 ? data.partsOfSpeech : DEFAULT_POS)
      }
    } catch (error) {
      console.error('Failed to fetch metadata:', error)
    }
  }

  // Reset & refetch when filters change
  useEffect(() => {
    if (activeTab !== 'words') return
    setWords([])
    setWordOffset(0)
    setHasMoreWords(true)
    setSelectedWord(null)
    const timer = setTimeout(() => {
      setLoading(true)
      fetchWords()
    }, 300)
    return () => clearTimeout(timer)
  }, [search, levelFilter, topicFilter])

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (activeTab !== 'words') return
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMoreWords && !loadingMore && !loading) {
        fetchWords(true)
      }
    }, { threshold: 0.1 })
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current)
    return () => observerRef.current?.disconnect()
  }, [activeTab, hasMoreWords, loadingMore, loading, wordOffset])

  async function fetchQuizzes() {
    if (!token) {
      setLoading(false)
      setInitialLoading(false)
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
      setInitialLoading(false)
    }
  }

  async function fetchWords(append = false) {
    const currentOffset = append ? wordOffset : 0
    if (append) setLoadingMore(true)
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(currentOffset),
      })
      if (search) params.set('search', search)
      if (levelFilter) params.set('level', levelFilter)
      if (topicFilter) params.set('topic', topicFilter)
      const res = await fetch(`/api/words?${params}`)
      const data = await res.json()
      const newWords: Word[] = data.words || []
      setTotalWords(data.total || 0)
      if (append) {
        setWords(prev => [...prev, ...newWords])
      } else {
        setWords(newWords)
      }
      setWordOffset(currentOffset + newWords.length)
      setHasMoreWords(currentOffset + newWords.length < (data.total || 0))
    } catch (error) {
      console.error('Failed to fetch words:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setInitialLoading(false)
    }
  }

  async function fetchUsers() {
    if (!token) {
      setLoading(false)
      setInitialLoading(false)
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
      setInitialLoading(false)
    }
  }

  function selectWord(word: Word) {
    setSelectedWord(word)
    setFormData(initFormFromWord(word))
  }

  async function updateWord() {
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
          word: selectedWord.word, // In case we want to update the word string too
          partOfSpeech: formData.partOfSpeech,
          senseIndex: 0, // Default for now
          phonetic: formData.phonetic || null,
          meaning: formData.meaning || null,
          scenario: formData.scenario || null,
          emotionalConnection: formData.emotionalConnection || null,
          images: images,
          scenarioImages: scenarioImages,
          examples: formData.examples.split('\n').filter(s => s.trim()),
          tags: formData.tags,
          level: formData.level,
        }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Word saved successfully!' })
        fetchWords()
        fetchMetadata() // Refresh metadata after save
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
          partOfSpeech: addForm.partOfSpeech,
          senseIndex: 0,
          phonetic: addForm.phonetic || null,
          meaning: addForm.meaning || null,
          scenario: addForm.scenario || null,
          emotionalConnection: addForm.emotionalConnection || null,
          images,
          scenarioImages,
          examples: addForm.examples.split('\n').filter(s => s.trim()),
          tags,
          level: addForm.level,
        }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Word added successfully!' })
        resetAddForm()
        setShowAddModal(false)
        fetchWords()
        fetchMetadata() // Refresh metadata
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

  async function resetUserPassword(userId: string) {
    if (!token) return
    const newPassword = prompt('Enter new password for this user (min 6 characters):')
    if (!newPassword) return
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters.')
      return
    }
    
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      })
      if (res.ok) {
        setMessage({ type: 'success', text: 'Password reset successfully!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Failed to reset password' })
      }
    } catch (error) {
      console.error('Failed to reset password:', error)
      setMessage({ type: 'error', text: 'Failed to reset password' })
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

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
    return matchesSearch
  })

  // Export & Template Helpers
  async function downloadBackup() {
    if (!token) return
    try {
      setLoading(true)
      const res = await fetch('/api/admin/words/export', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `word_library_backup_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setMessage({ type: 'error', text: 'Backup failed' })
    } finally {
      setLoading(false)
    }
  }

  function downloadTemplate() {
    const headers = ['word', 'partOfSpeech', 'level', 'phonetic', 'meaning', 'examples', 'images', 'scenario', 'scenarioImages', 'emotionalConnection', 'tags']
    const sample = ['apple', 'noun', 'A1', '/ˈæp.əl/', 'A round fruit', 'I eat an apple.;Simple and healthy.', 'url1;url2', 'Apple on a table', 'url3', 'Vitamin C', 'fruit;food']
    const csvContent = [headers.join(','), sample.join(',')].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'words_template.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  // Import Implementation
  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = e.target?.result as string
      try {
        const rows = text.split('\n').filter(r => r.trim())
        if (rows.length < 2) throw new Error('CSV is empty or missing headers')

        const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
        const parsedWords = rows.slice(1).map(row => {
          // Manual basic CSV row parsing to handle quotes
          const cols: string[] = []
          let cur = ''
          let inQuotes = false
          for (let i = 0; i < row.length; i++) {
            const char = row[i]
            if (char === '"') inQuotes = !inQuotes
            else if (char === ',' && !inQuotes) {
              cols.push(cur.trim().replace(/^"|"$/g, '').replace(/""/g, '"'))
              cur = ''
            } else cur += char
          }
          cols.push(cur.trim().replace(/^"|"$/g, '').replace(/""/g, '"'))

          const wordObj: any = {}
          headers.forEach((h, i) => {
            const val = cols[i] || ''
            if (['examples', 'images', 'scenarioImages', 'tags'].includes(h)) {
              wordObj[h] = val ? val.split(';').map(s => s.trim()).filter(Boolean) : []
            } else {
              wordObj[h] = val
            }
          })
          return wordObj
        })

        setImportWords(parsedWords)
        setShowImportModal(true)
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to parse CSV' })
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset input
  }

  async function executeImport() {
    if (!token || !importWords.length) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/words/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ words: importWords, override: overrideExisting })
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ 
          type: 'success', 
          text: `Success! Created: ${data.created}, Updated: ${data.updated}, Skipped: ${data.skipped}` 
        })
        setShowImportModal(false)
        fetchWords()
        setTimeout(() => setMessage(null), 5000)
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Import failed' })
    } finally {
      setSaving(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen relaxed-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin"></div>
          <div className="text-xl font-black text-indigo-200 tracking-widest animate-pulse">ACCESSING SYSTEM...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relaxed-bg py-12 px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black text-indigo-950 tracking-tighter mb-2">Administration</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest ml-1">Dashboard</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-1 p-1 bg-white/40 rounded-2xl border border-indigo-100 shadow-inner">
              <button
                onClick={() => setActiveTab('words')}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  activeTab === 'words' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-indigo-600 hover:bg-white/50'
                }`}
              >
                Word Library
              </button>
              {(user?.role === 'admin' || user?.role === 'Admin') && (
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                    activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-indigo-600 hover:bg-white/50'
                  }`}
                >
                  Users
                </button>
              )}
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  activeTab === 'quizzes' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-indigo-600 hover:bg-white/50'
                }`}
              >
                Quizzes
              </button>
            </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Word List */}
            <div className="lg:col-span-1 glass-card rounded-[2.5rem] p-6 border border-indigo-100 shadow-xl flex flex-col h-[800px] bg-white/60">
              <div className="mb-6 space-y-4">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Search Words..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full p-4 bg-white/50 border-2 border-indigo-100/50 rounded-2xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">🔍</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="bg-white/50 border border-indigo-100/50 rounded-xl p-2.5 text-xs font-bold text-slate-600 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="" className="bg-white">All Levels</option>
                    {LEVELS.map((l) => (
                      <option key={l} value={l} className="bg-white">{l}</option>
                    ))}
                  </select>
                  <select
                    value={topicFilter}
                    onChange={(e) => setTopicFilter(e.target.value)}
                    className="bg-white/50 border border-indigo-100/50 rounded-xl p-2.5 text-xs font-bold text-slate-600 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="" className="bg-white">All Topics</option>
                    {dynamicTopics.map((t) => (
                      <option key={t} value={t} className="bg-white">{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{words.length} / {totalWords} WORDS</span>
                  {loading && !initialLoading && (
                    <div className="w-3 h-3 border-2 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={downloadBackup}
                    className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-all"
                    title="Backup Word Library (CSV)"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-lg transition-all"
                    title="Import Words (CSV)"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"/></svg>
                  </button>
                  <button
                    onClick={downloadTemplate}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-all"
                    title="Download Import Template"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </button>
                  <button
                    onClick={openAddModal}
                    className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all"
                    title="Add New Word"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".csv"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {words.map((word) => (
                  <button
                    key={word.id}
                    onClick={() => selectWord(word)}
                    className={`w-full text-left p-4 rounded-2xl transition-all group relative overflow-hidden ${
                      selectedWord?.id === word.id
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'hover:bg-indigo-50 text-slate-600 hover:text-indigo-900 border border-transparent hover:border-indigo-100/50'
                    }`}
                  >
                    <div className="relative z-10 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-sm tracking-tight mb-1">{word.word}</div>
                        <div className={`flex flex-wrap gap-1 mt-1 ${selectedWord?.id === word.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                          <span className="px-1 py-0.5 bg-white/20 rounded text-[8px] font-black uppercase tracking-tighter">{word.level}</span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider">{word.tags.slice(0, 2).join(' • ')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          role="button"
                          onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${word.word}"?`)) { deleteWord() ; selectWord(word) } }}
                          className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:bg-red-100 ${selectedWord?.id === word.id ? 'text-red-200 hover:text-red-100' : 'text-red-400 hover:text-red-600'}`}
                          title="Delete word"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </span>
                        {selectedWord?.id === word.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                {/* Infinite scroll sentinel */}
                <div ref={sentinelRef} className="py-4 flex justify-center">
                  {loadingMore && (
                    <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                  )}
                  {!hasMoreWords && words.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">All words loaded</span>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <div className="lg:col-span-3 glass-card rounded-[2.5rem] p-10 border border-indigo-100 shadow-xl min-h-[800px] bg-white/60">
              {selectedWord ? (
                <div className="animate-fadeIn">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12 pb-8 border-b border-indigo-100">
                      <div className="flex-1">
                        <h2 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">{selectedWord.word}</h2>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest leading-none flex items-center">
                            {formData.level}
                          </span>
                          {formData.tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5 transition-all hover:bg-white">
                              {tag}
                              <button 
                                onClick={() => removeTag(tag)}
                                className="text-red-400 hover:text-red-600 transition-colors p-0.5 rounded-full hover:bg-red-50"
                                title="Remove tag"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                              </button>
                            </span>
                          ))}
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="+ Add tag"
                              onKeyDown={addTag}
                              className="px-3 py-1 bg-white border border-dashed border-indigo-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-indigo-400 focus:outline-none focus:border-indigo-500 focus:text-indigo-600 w-24 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    <div className="flex gap-3">
                      <button
                        onClick={autoFillWord}
                        disabled={autoFilling}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs shadow-md hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {autoFilling ? (
                          <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                        ) : '✨ Auto-Fill'}
                      </button>
                      <button
                        onClick={deleteWord}
                        disabled={saving}
                        className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-2xl font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">Part of Speech</label>
                      <input
                        list="pos-options"
                        value={formData.partOfSpeech}
                        onChange={(e) => setFormData({ ...formData, partOfSpeech: e.target.value })}
                        className="w-full p-4 bg-white/60 border-2 border-indigo-100/50 rounded-2xl focus:border-indigo-500 focus:outline-none text-slate-800 placeholder-slate-400 transition-all font-medium"
                        placeholder="noun, verb, etc."
                      />
                      <datalist id="pos-options">
                        {dynamicPOS.map(p => <option key={p} value={p} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">Category</label>
                      <input
                        list="category-options"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-4 bg-white/60 border-2 border-indigo-100/50 rounded-2xl focus:border-indigo-500 focus:outline-none text-slate-800 placeholder-slate-400 transition-all font-medium"
                        placeholder="General, food, etc."
                      />
                      <datalist id="category-options">
                        {dynamicTopics.map(t => <option key={t} value={t} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">Level</label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full p-4 bg-white/60 border-2 border-indigo-100/50 rounded-2xl focus:border-indigo-500 focus:outline-none text-slate-800 transition-all font-medium cursor-pointer"
                      >
                        {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">Phonetic</label>
                        <input
                          type="text"
                          value={formData.phonetic}
                          onChange={(e) => setFormData({ ...formData, phonetic: e.target.value })}
                          className="w-full p-4 bg-white/60 border-2 border-indigo-100/50 rounded-2xl focus:border-indigo-500 focus:outline-none text-slate-800 placeholder-slate-400 transition-all font-medium"
                          placeholder="/fəˈnet.ɪk/"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">Meaning</label>
                        <input
                          type="text"
                          value={formData.meaning}
                          onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                          className="w-full p-4 bg-white/60 border-2 border-indigo-100/50 rounded-2xl focus:border-indigo-500 focus:outline-none text-slate-800 placeholder-slate-400 transition-all font-medium"
                          placeholder="Primary definition..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">Example Scenario</label>
                      <textarea
                        value={formData.scenario}
                        onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
                        rows={3}
                        className="w-full p-4 bg-white/60 border-2 border-indigo-100/50 rounded-2xl focus:border-indigo-500 focus:outline-none text-slate-800 placeholder-slate-400 transition-all font-medium resize-none"
                        placeholder="Contextual learning scenario..."
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">Examples (Newline Separated)</label>
                        <textarea
                          value={formData.examples}
                          onChange={(e) => setFormData({ ...formData, examples: e.target.value })}
                          rows={4}
                          className="w-full p-4 bg-white/60 border-2 border-indigo-100/50 rounded-2xl focus:border-indigo-500 focus:outline-none text-slate-800 placeholder-slate-400 transition-all font-medium resize-none text-sm leading-relaxed"
                          placeholder="Example usage..."
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">Image URLs (Newline Separated)</label>
                        <textarea
                          value={formData.images}
                          onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                          rows={4}
                          className="w-full p-4 bg-white/60 border-2 border-indigo-100/50 rounded-2xl focus:border-indigo-500 focus:outline-none text-slate-600 font-mono text-xs transition-all resize-none"
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                    </div>

                    <button
                      onClick={updateWord}
                      disabled={saving}
                      className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-bold text-sm tracking-wide shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 mt-8"
                    >
                      {saving ? 'Updating...' : 'Update Word'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <div className="text-8xl mb-6">📝</div>
                  <p className="text-2xl font-bold text-slate-400">Select a Word to Edit</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (user?.role === 'admin' || user?.role === 'Admin') && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fadeIn">
            {/* User List Sidebar */}
            <div className="lg:col-span-1 glass-card rounded-[2.5rem] p-6 border border-indigo-100 shadow-xl self-start h-[800px] flex flex-col bg-white/60">
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Search Users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/50 border-2 border-indigo-100/50 rounded-2xl focus:border-indigo-500 focus:outline-none text-slate-800 placeholder-slate-400 transition-all font-bold text-xs tracking-wider"
                />
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              </div>
              <div className="flex justify-between items-center mb-4 px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Users • {filteredUsers.length}</span>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all"
                  title="Add New User"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`w-full text-left p-5 rounded-[1.5rem] transition-all group relative overflow-hidden ${
                      selectedUser?.id === u.id
                        ? 'bg-indigo-600 border-2 border-indigo-600 shadow-lg text-white'
                        : 'bg-white/50 border-2 border-transparent hover:border-indigo-100/50 text-slate-600 hover:text-indigo-900'
                    }`}
                  >
                    <div className="relative z-10 flex justify-between items-center w-full">
                      <div>
                        <div className={`font-bold text-xs tracking-tight mb-1 ${selectedUser?.id === u.id ? 'text-white' : ''}`}>
                          {u.name || (u.email && u.email.split('@')[0]) || 'Anonymous'}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-semibold uppercase tracking-wider ${selectedUser?.id === u.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                            {u.role}
                          </span>
                          <span className={`w-1 h-1 rounded-full ${selectedUser?.id === u.id ? 'bg-white/30' : 'bg-slate-300'}`}></span>
                          <span className={`text-[9px] font-semibold uppercase tracking-wider ${selectedUser?.id === u.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          role="button"
                          onClick={(e) => { e.stopPropagation(); if (confirm(`Delete user "${u.email}"?`)) { deleteUser(u.id); if(selectedUser?.id === u.id) setSelectedUser(null); } }}
                          className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:bg-red-100 ${selectedUser?.id === u.id ? 'text-red-200 hover:text-red-100' : 'text-red-400 hover:text-red-600'}`}
                          title="Delete user"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </span>
                        {selectedUser?.id === u.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* User Detail/Edit */}
            <div className="lg:col-span-3 glass-card rounded-[2.5rem] p-10 border border-indigo-100 shadow-xl min-h-[800px] bg-white/60">
              {selectedUser ? (
                <div className="animate-fadeIn">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12 pb-8 border-b border-indigo-100">
                    <div className="flex-1">
                      <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-4">User Profile</div>
                      <h2 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">{selectedUser.name || 'Anonymous'}</h2>
                      <div className="text-slate-500 font-mono text-sm tracking-widest">{selectedUser.email}</div>
                    </div>
                    <button
                      onClick={() => deleteUser(selectedUser.id)}
                      disabled={saving || selectedUser.id === user?.id}
                      className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50"
                    >
                      Delete User
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="glass-card bg-white/40 rounded-3xl p-8 border border-indigo-100/50">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4 ml-1">Access Role</label>
                      <select
                        value={selectedUser.role}
                        onChange={(e) => updateUserRole(selectedUser.id, e.target.value)}
                        disabled={saving || selectedUser.id === user?.id}
                        className="w-full p-4 bg-white/60 border-2 border-indigo-100/50 rounded-2xl focus:border-indigo-500 focus:outline-none text-slate-800 transition-all font-bold text-sm cursor-pointer uppercase tracking-wider"
                      >
                        <option value="User" className="bg-white">User</option>
                        <option value="Teacher" className="bg-white">Teacher</option>
                        <option value="Admin" className="bg-white">Admin</option>
                      </select>
                      <p className="mt-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-relaxed">
                        Authorized personnel only. Modifying permissions affects system access.
                      </p>
                    </div>

                    <div className="glass-card bg-white/40 rounded-3xl p-8 border border-indigo-100/50 flex flex-col justify-center">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Created At</div>
                      <div className="text-2xl font-black text-slate-800 tracking-widest mb-4">
                        {new Date(selectedUser.createdAt).toLocaleString()}
                      </div>
                      <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active Account
                      </div>
                    </div>
                  </div>

                  <div className="glass-card bg-white/40 rounded-3xl p-8 border border-red-100/30">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <span className="text-lg">🛡️</span> Security & Actions
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={() => resetUserPassword(selectedUser.id)}
                        disabled={saving}
                        className="flex-1 min-w-[200px] px-6 py-4 bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        <span className="text-base">🔏</span>
                        Reset User Password
                      </button>
                      <div className="flex-1 min-w-[240px] p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex items-center gap-4">
                        <div className="text-2xl">🔑</div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed tracking-wider">
                          Forcing a password reset will grant the user immediate access with the new credentials. Use with caution.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <div className="text-8xl mb-6">👤</div>
                  <p className="text-2xl font-bold text-slate-400">Select a User to View</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fadeIn">
            {/* Quiz List Sidebar */}
            <div className="lg:col-span-1 glass-card rounded-[2.5rem] p-6 border border-indigo-100 shadow-xl self-start h-[800px] flex flex-col bg-white/60">
              <div className="flex justify-between items-center mb-4 px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quizzes • {quizzes.length}</span>
                <button
                  onClick={() => setShowAddQuizModal(true)}
                  className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all"
                  title="Create New Quiz"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {quizzes.map((quiz) => (
                  <button
                    key={quiz.id}
                    onClick={() => setSelectedQuiz(quiz)}
                    className={`w-full text-left p-5 rounded-[1.5rem] transition-all group relative overflow-hidden ${
                      selectedQuiz?.id === quiz.id
                        ? 'bg-indigo-600 border-2 border-indigo-600 shadow-lg text-white'
                        : 'bg-white/50 border-2 border-transparent hover:border-indigo-100/50 text-slate-600 hover:text-indigo-900'
                    }`}
                  >
                    <div className="relative z-10 flex justify-between items-center w-full">
                      <div>
                        <div className={`font-bold text-xs tracking-tight mb-1 ${selectedQuiz?.id === quiz.id ? 'text-white' : ''}`}>
                          {quiz.title}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-semibold uppercase tracking-wider ${selectedQuiz?.id === quiz.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                            {quiz.type}
                          </span>
                          <span className={`w-1 h-1 rounded-full ${selectedQuiz?.id === quiz.id ? 'bg-white/30' : 'bg-slate-300'}`}></span>
                          <span className={`text-[9px] font-semibold uppercase tracking-wider ${selectedQuiz?.id === quiz.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {quiz.wordIds.length} Words
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          role="button"
                          onClick={(e) => { e.stopPropagation(); if (confirm(`Delete quiz "${quiz.title}"?`)) { deleteQuiz(quiz.id); if(selectedQuiz?.id === quiz.id) setSelectedQuiz(null); } }}
                          className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:bg-red-100 ${selectedQuiz?.id === quiz.id ? 'text-red-200 hover:text-red-100' : 'text-red-400 hover:text-red-600'}`}
                          title="Delete quiz"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </span>
                        {selectedQuiz?.id === quiz.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quiz Detail View */}
            <div className="lg:col-span-3 glass-card rounded-[2.5rem] p-10 border border-indigo-100 shadow-xl min-h-[800px] bg-white/60">
              {selectedQuiz ? (
                <div className="animate-fadeIn">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12 pb-8 border-b border-indigo-100">
                    <div className="flex-1">
                      <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-4">Quiz Details</div>
                      <h2 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">{selectedQuiz.title}</h2>
                      <p className="text-slate-500 font-medium text-lg max-w-2xl">{selectedQuiz.description}</p>
                    </div>
                    <button
                      onClick={() => deleteQuiz(selectedQuiz.id)}
                      disabled={saving}
                      className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50"
                    >
                      Delete Quiz
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                      { label: 'Quiz Type', value: selectedQuiz.type },
                      { label: 'Word Count', value: selectedQuiz.wordIds.length },
                      { label: 'Created By', value: selectedQuiz.createdBy.name || selectedQuiz.createdBy.email.split('@')[0] },
                      { label: 'Created At', value: new Date(selectedQuiz.createdAt).toLocaleDateString() }
                    ].map((stat, i) => (
                      <div key={i} className="glass-card bg-white/40 rounded-3xl p-6 border border-indigo-100/50">
                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">{stat.label}</div>
                        <div className="text-xl font-black text-slate-800 tracking-widest truncate">{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => router.push(`/quiz/${selectedQuiz.id}`)}
                      className="group relative px-12 py-6 bg-indigo-600 rounded-[2.5rem] shadow-lg hover:shadow-xl hover:bg-indigo-700 transition-all overflow-hidden"
                    >
                      <div className="relative z-10 flex items-center gap-4">
                        <span className="text-3xl">🚀</span>
                        <div className="text-left">
                          <div className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Start Quiz</div>
                          <div className="text-xl font-black text-white tracking-wide">Launch Quiz</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <div className="text-8xl mb-6">📝</div>
                  <p className="text-2xl font-bold text-slate-400">Select a Quiz to View</p>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Add Modal */}
        {showAddModal && activeTab === 'words' && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white/95 rounded-[3rem] p-10 border border-indigo-100 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar relative">
              <button 
                onClick={() => { resetAddForm(); setShowAddModal(false); }}
                className="absolute top-8 right-8 text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <div className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">CLOSE</div>
              </button>

              <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4">Word Registry</div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-10">Add New Word</h2>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Word *</label>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={addForm.word}
                      onChange={(e) => setAddForm({ ...addForm, word: e.target.value })}
                      className="flex-1 p-5 bg-slate-50 border-2 border-indigo-50 rounded-[1.5rem] focus:border-indigo-400 focus:outline-none text-slate-900 placeholder-slate-300 transition-all font-bold tracking-wide"
                      placeholder="Enter word..."
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!addForm.word.trim()) return
                        setAutoFilling(true)
                        try {
                          const result = await fetchDefinition(addForm.word, addForm.partOfSpeech, addForm.level)
                          if (!result) throw new Error('Autofill failed')
                          setAddForm(prev => ({
                            ...prev,
                            phonetic: result.phonetic || prev.phonetic,
                            meaning: result.meaning || prev.meaning,
                            examples: Array.isArray(result.examples) ? result.examples.join('\n') : prev.examples,
                            scenario: result.scenario || prev.scenario,
                            emotionalConnection: result.emotionalConnection || prev.emotionalConnection,
                          }))
                          setMessage({ type: 'success', text: '✨ Definition synthesized!' })
                          setTimeout(() => setMessage(null), 3000)
                        } catch (error) {
                          setMessage({ type: 'error', text: 'Synthesis failed' })
                        } finally {
                          setAutoFilling(false)
                        }
                      }}
                      disabled={autoFilling || !addForm.word.trim()}
                      className="px-8 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {autoFilling ? 'Synthesizing...' : '✨ AI Autofill'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Part of Speech', field: 'partOfSpeech', options: dynamicPOS, isCreatable: true },
                    { label: 'Category', field: 'category', options: dynamicTopics, isCreatable: true },
                    { label: 'Level', field: 'level', options: LEVELS, isCreatable: false }
                  ].map((sel) => (
                    <div key={sel.field}>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{sel.label}</label>
                      {sel.isCreatable ? (
                        <>
                          <input
                            list={`${sel.field}-add-options`}
                            value={(addForm as any)[sel.field]}
                            onChange={(e) => setAddForm({ ...addForm, [sel.field]: e.target.value })}
                            className="w-full p-4 bg-slate-50 border-2 border-indigo-50 rounded-2xl focus:border-indigo-400 focus:outline-none text-slate-700 text-xs font-bold uppercase tracking-widest transition-all"
                            placeholder={`Pick or type...`}
                          />
                          <datalist id={`${sel.field}-add-options`}>
                            {sel.options.map(opt => <option key={opt} value={opt} />)}
                          </datalist>
                        </>
                      ) : (
                        <select
                          value={(addForm as any)[sel.field]}
                          onChange={(e) => setAddForm({ ...addForm, [sel.field]: e.target.value })}
                          className="w-full p-4 bg-slate-50 border-2 border-indigo-50 rounded-2xl focus:border-indigo-400 focus:outline-none text-slate-700 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
                        >
                          {sel.options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Phonetic</label>
                    <input
                      type="text"
                      value={addForm.phonetic}
                      onChange={(e) => setAddForm({ ...addForm, phonetic: e.target.value })}
                      className="w-full p-4 bg-slate-50 border-2 border-indigo-50 rounded-2xl focus:border-indigo-400 focus:outline-none text-slate-800 transition-all font-medium"
                      placeholder="/fəˈnet.ɪk/"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Meaning</label>
                    <input
                      type="text"
                      value={addForm.meaning}
                      onChange={(e) => setAddForm({ ...addForm, meaning: e.target.value })}
                      className="w-full p-4 bg-slate-50 border-2 border-indigo-50 rounded-2xl focus:border-indigo-400 focus:outline-none text-slate-800 transition-all font-medium"
                      placeholder="Primary definition..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Scenario</label>
                  <textarea
                    value={addForm.scenario}
                    onChange={(e) => setAddForm({ ...addForm, scenario: e.target.value })}
                    rows={2}
                    className="w-full p-4 bg-slate-50 border-2 border-indigo-50 rounded-2xl focus:border-indigo-400 focus:outline-none text-slate-800 transition-all font-medium resize-none"
                    placeholder="Contextual usage scenario..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Examples</label>
                    <textarea
                      value={addForm.examples}
                      onChange={(e) => setAddForm({ ...addForm, examples: e.target.value })}
                      rows={3}
                      className="w-full p-4 bg-slate-50 border-2 border-indigo-50 rounded-2xl focus:border-indigo-400 focus:outline-none text-slate-700 text-xs leading-relaxed transition-all resize-none"
                      placeholder="One example per line..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Images</label>
                    <textarea
                      value={addForm.images}
                      onChange={(e) => setAddForm({ ...addForm, images: e.target.value })}
                      rows={3}
                      className="w-full p-4 bg-slate-50 border-2 border-indigo-50 rounded-2xl focus:border-indigo-400 focus:outline-none text-indigo-600 font-mono text-[10px] transition-all resize-none"
                      placeholder="image URLs, one per line..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => { resetAddForm(); setShowAddModal(false); }}
                    className="flex-1 py-5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addWord}
                    disabled={saving || !addForm.word.trim()}
                    className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Adding Word...' : 'Create Word'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white/95 rounded-[3rem] p-12 border border-indigo-100 shadow-2xl max-w-md w-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
              
              <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4">User Management</div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-8">Register User</h2>
              
              <div className="space-y-6 relative z-10">
                {[
                  { label: 'Email Address *', field: 'email', type: 'email', placeholder: 'user@example.com' },
                  { label: 'Security Password *', field: 'password', type: 'password', placeholder: '••••••••' },
                  { label: 'Full Name', field: 'name', type: 'text', placeholder: 'Citizen name' }
                ].map((input) => (
                  <div key={input.field}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{input.label}</label>
                    <input
                      type={input.type}
                      value={(addUserForm as any)[input.field]}
                      onChange={(e) => setAddUserForm({ ...addUserForm, [input.field]: e.target.value })}
                      className="w-full p-4 bg-slate-50 border-2 border-indigo-50 rounded-2xl focus:border-indigo-400 focus:outline-none text-slate-800 placeholder-slate-300 transition-all font-medium"
                      placeholder={input.placeholder}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Access Role</label>
                  <select
                    value={addUserForm.role}
                    onChange={(e) => setAddUserForm({ ...addUserForm, role: e.target.value })}
                    className="w-full p-4 bg-slate-50 border-2 border-indigo-50 rounded-2xl focus:border-indigo-400 focus:outline-none text-slate-700 transition-all font-bold uppercase tracking-widest text-xs cursor-pointer"
                  >
                    <option value="User" className="bg-white">User</option>
                    <option value="Teacher" className="bg-white">Teacher</option>
                    <option value="Admin" className="bg-white">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-10 relative z-10">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={addUser}
                  disabled={saving || !addUserForm.email.trim() || !addUserForm.password}
                  className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {saving ? 'Registering...' : 'Add User'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Quiz Modal */}
        {showAddQuizModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white/95 rounded-[3rem] p-10 border border-indigo-100 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4">Quiz Architecture</div>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-10">Construct Module</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Module Title *</label>
                    <input
                      type="text"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      placeholder="English Core A1..."
                      className="w-full p-5 bg-slate-50 border-2 border-indigo-50 rounded-3xl focus:border-indigo-400 focus:outline-none text-slate-900 transition-all font-black tracking-widest"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Description</label>
                    <textarea
                      value={quizDescription}
                      onChange={(e) => setQuizDescription(e.target.value)}
                      placeholder="Quick summary of the module content..."
                      rows={3}
                      className="w-full p-5 bg-slate-50 border-2 border-indigo-50 rounded-3xl focus:border-indigo-400 focus:outline-none text-slate-800 transition-all font-medium resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Quiz Engine Type *</label>
                    <select
                      value={quizType}
                      onChange={(e) => setQuizType(e.target.value)}
                      className="w-full p-5 bg-slate-50 border-2 border-indigo-50 rounded-3xl focus:border-indigo-400 focus:outline-none text-slate-700 transition-all font-black uppercase tracking-widest text-xs cursor-pointer"
                    >
                      <option value="image-to-word" className="bg-white">IMAGE_TO_WORD</option>
                      <option value="word-to-image" className="bg-white">WORD_TO_IMAGE</option>
                      <option value="fill-blank" className="bg-white">FILL_IN_THE_BLANKS</option>
                    </select>
                  </div>
                </div>

                <div className="border-l border-indigo-50 pl-10">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 ml-1 flex justify-between items-center">
                    <span>Selected Vocabulary</span>
                    <span className="text-indigo-600">{quizWordIds.length} Linked</span>
                  </label>
                  
                  <div className="bg-slate-50 border border-indigo-50 rounded-[2rem] p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                    <div className="flex flex-wrap gap-2">
                      {words.map((word) => {
                        const isSelected = quizWordIds.includes(word.id);
                        return (
                          <button
                            key={word.id}
                            type="button"
                            onClick={() => toggleQuizWord(word.id)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                : 'bg-white text-slate-400 hover:text-indigo-600 border border-indigo-100'
                            }`}
                          >
                            {word.word}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-12">
                <button
                  onClick={() => setShowAddQuizModal(false)}
                  className="flex-1 py-5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={createQuiz}
                  disabled={saving || !quizTitle.trim() || !quizWordIds.length}
                  className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Construct Module'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Import Confirmation Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fadeIn">
            <div className="bg-white/95 rounded-[3rem] p-12 border border-indigo-100 shadow-2xl max-w-md w-full relative">
              <div className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <span>📦</span> Ready to Import
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-6">Confirm CSV Import</h2>
              <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">
                We've decoded <strong className="text-indigo-600 font-black">{importWords.length}</strong> words from your file. How should we handle existing records?
              </p>

              <div className="bg-slate-50 border border-indigo-50 rounded-2xl p-6 mb-8">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={overrideExisting}
                      onChange={(e) => setOverrideExisting(e.target.checked)}
                      className="peer appearance-none w-6 h-6 border-2 border-indigo-200 rounded-lg checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                    />
                    <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <div>
                    <span className="text-sm font-black text-slate-800 uppercase tracking-wide group-hover:text-indigo-600 transition-colors">Override Existing Records</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 leading-tight">Match by Word + Part of Speech</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={executeImport}
                  disabled={saving}
                  className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/30 active:scale-95 transition-all disabled:opacity-50"
                >
                  {saving ? 'Importing...' : 'Launch Import'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
