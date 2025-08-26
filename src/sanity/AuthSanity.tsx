import { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'

export default function AuthSanity(){
  const { user, loading, signUp, signIn, signOut } = useAuth()
  const [email,setEmail]=useState(''); const [pw,setPw]=useState(''); const [msg,setMsg]=useState('')
  return (
    <div className="max-w-md mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold">Auth Sanity</h1>
      <p>User: {loading? 'loading…' : user? user.email : 'none'}</p>
      <input className="w-full border p-2 rounded" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full border p-2 rounded" type="password" placeholder="password" value={pw} onChange={e=>setPw(e.target.value)} />
      <div className="flex gap-2">
        <button className="cta-btn" onClick={async()=>{ const {error}=await signUp(email,pw); setMsg(error?error.message:'Check inbox to confirm'); }}>Register</button>
        <button className="cta-btn" onClick={async()=>{ const {error}=await signIn(email,pw); setMsg(error?error.message:'Signed in'); }}>Login</button>
        <button className="cta-btn" onClick={async()=>{ await signOut(); setMsg('Signed out') }}>Logout</button>
      </div>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  )
}