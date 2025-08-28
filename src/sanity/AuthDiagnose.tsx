import { ENV } from '@/env';
import { AUTH_REDIRECT } from '@/config/app';
import { useState } from 'react';

export default function AuthDiagnose(){
  const [email,setEmail]=useState('');
  const [pw,setPw]=useState('');
  const [out,setOut]=useState<string>('');

  async function test(){
    setOut('…');
    try{
      const res = await fetch(`${ENV.SUPABASE_URL}/auth/v1/signup`,{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'apikey': ENV.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email, password: pw,
          data: {},
          gotrue_meta_security: {}, // geen captcha
          redirect_to: AUTH_REDIRECT
        }),
      });
      const text = await res.text();
      setOut(`HTTP ${res.status}\n${text.slice(0,2000)}`);
    }catch(e:any){
      setOut(`FETCH ERROR: ${e?.message||e}`);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold">Auth Diagnose</h1>
      <p><code>redirect_to</code>: {AUTH_REDIRECT}</p>
      <input className="w-full border p-2 rounded" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full border p-2 rounded" type="password" placeholder="password" value={pw} onChange={e=>setPw(e.target.value)} />
      <button className="border rounded p-2" onClick={test}>Raw signup call</button>
      <pre className="bg-gray-50 p-3 rounded whitespace-pre-wrap">{out}</pre>
    </div>
  );
}