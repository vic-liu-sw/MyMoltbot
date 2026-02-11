import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

type Todo = {
  id: string
  title: string
  completed: boolean
  createdAt: number
}

type Filter = 'all' | 'active' | 'completed'

const STORAGE_KEY = 'my-moltbot-todos'

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as Todo[]
      setTodos(parsed)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const activeCount = useMemo(() => todos.filter((t) => !t.completed).length, [todos])

  const filteredTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((t) => !t.completed)
    if (filter === 'completed') return todos.filter((t) => t.completed)
    return todos
  }, [filter, todos])

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const title = input.trim()
    if (!title) return

    setTodos((prev) => [
      {
        id: crypto.randomUUID(),
        title,
        completed: false,
        createdAt: Date.now(),
      },
      ...prev,
    ])
    setInput('')
  }

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setEditingText('')
    }
  }

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id)
    setEditingText(todo.title)
  }

  const saveEdit = (id: string) => {
    const next = editingText.trim()
    if (!next) return

    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, title: next } : todo)))
    setEditingId(null)
    setEditingText('')
  }

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed))
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <header className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">MyMoltbot</p>
          <h1 className="mt-1 text-3xl font-bold text-stone-900">To-Do List</h1>
          <p className="mt-2 text-sm text-stone-500">簡潔、高效、可持久保存的任務清單。</p>
        </header>

        <form onSubmit={onSubmit} className="mb-5 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="新增任務，例如：整理本週開發計劃"
            className="h-11 flex-1 rounded-xl border border-stone-300 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <button
            type="submit"
            className="h-11 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
          >
            新增
          </button>
        </form>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="text-stone-500">剩餘 {activeCount} 項待完成</div>
          <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-1">
            {(['all', 'active', 'completed'] as const).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition ${
                  filter === item ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {item === 'all' ? '全部' : item === 'active' ? '進行中' : '已完成'}
              </button>
            ))}
          </div>
        </div>

        <ul className="space-y-2">
          {filteredTodos.length === 0 && (
            <li className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
              目前沒有符合條件的任務。
            </li>
          )}

          {filteredTodos.map((todo) => (
            <li key={todo.id} className="rounded-xl border border-stone-200 bg-white px-3 py-2">
              <div className="flex items-center gap-3">
                <input
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  type="checkbox"
                  className="h-5 w-5 accent-emerald-600"
                />

                <div className="min-w-0 flex-1">
                  {editingId === todo.id ? (
                    <input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(todo.id)
                        if (e.key === 'Escape') {
                          setEditingId(null)
                          setEditingText('')
                        }
                      }}
                      autoFocus
                      className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  ) : (
                    <p
                      className={`truncate text-sm ${
                        todo.completed ? 'text-stone-400 line-through' : 'text-stone-800'
                      }`}
                    >
                      {todo.title}
                    </p>
                  )}
                </div>

                <div className="flex gap-1">
                  {editingId === todo.id ? (
                    <button
                      onClick={() => saveEdit(todo.id)}
                      className="rounded-md px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                    >
                      保存
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(todo)}
                      className="rounded-md px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100"
                    >
                      編輯
                    </button>
                  )}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="rounded-md px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    刪除
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <footer className="mt-5 flex items-center justify-between text-xs text-stone-500">
          <span>資料已自動儲存在本機瀏覽器。</span>
          <button
            onClick={clearCompleted}
            className="rounded-md px-2.5 py-1.5 font-medium text-stone-600 hover:bg-stone-100"
          >
            清除已完成
          </button>
        </footer>
      </section>
    </main>
  )
}

export default App
