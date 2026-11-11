import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './auth'
import { menu } from './menu'
import Layout from './Layout'
import LoginPage from './pages/LoginPage'
import PlaceholderPage from './pages/PlaceholderPage'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <p className="p-8 text-slate-500">Memuat...</p>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to={menu[0].path} replace />} />
        {menu.map((m) => (
          <Route key={m.path} path={m.path} element={<PlaceholderPage title={m.label} />} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
