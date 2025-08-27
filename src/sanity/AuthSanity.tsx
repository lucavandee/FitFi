import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';

export default function AuthSanity(){
  const { user, loading, signUp, signIn, signOut, lastError } = useAuth();
  const [email,setEmail]=useState(''); const [pw,setPw]=useState('');

  return (
    <div className="max-w-md mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold">Auth Sanity</h1>
      <p>User: {loading? 'loading…' : user? user.email : 'none'}</p>
      <input className="w-full border p-2 rounded" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full border p-2 rounded" type="password" placeholder="password" value={pw} onChange={e=>setPw(e.target.value)} />
      <div className="flex gap-2">
        <button className="border rounded p-2" onClick={()=>signUp(email,pw).catch(()=>{})}>Register</button>
        <button className="border rounded p-2" onClick={()=>signIn(email,pw).catch(()=>{})}>Login</button>
        <button className="border rounded p-2" onClick={()=>signOut().catch(()=>{})}>Logout</button>
      </div>
      {lastError && <p className="text-sm text-red-600">Last error: {lastError}</p>}
    </div>
  );
}