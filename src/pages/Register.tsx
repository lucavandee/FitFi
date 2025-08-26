import { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'

export default function Register() {
  const { signUp } = useAuth()
  const [email, setEmail] = useState(''), [pw, setPw] = useState('')
  const [msg, setMsg] = useState<string>('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await signUp(email, pw)
    setMsg(error ? error.message : 'Check your email to confirm your account.')
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto p-6 space-y-3">
      <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full border p-2 rounded" type="password" placeholder="Password" value={pw} onChange={e=>setPw(e.target.value)} />
      <button className="cta-btn" type="submit">Registreren</button>
      {msg && <p>{msg}</p>}
    </form>
  )
}