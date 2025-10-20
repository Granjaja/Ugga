'use client';

import { loginUser } from '../auth/actions';
import { FormEvent, useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from './ui/button';
import { signIn } from 'next-auth/react';


export default function LoginForm() {

   const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  // const [state, action, pending] = useActionState(loginUser, { errors: {}, success: false });
  // const router = useRouter()

  // useEffect(()=>{
  //   if (state.success ){
  //     router.push("/chat")
  //   }
  // })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);


// Call signIn from the client side
  const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setPending(false);

    if (result?.ok) {
      router.push('/chat');
      router.refresh();
    } else {
      setError(result?.error || 'Uknown error');
    }
  };


  return (
    <div>
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 space-y-4 border p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold">Login</h2>

        <div>
          <label htmlFor="email" className="block font-medium">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label htmlFor="password" className="block font-medium">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? 'Logging in...' : 'Login'}
        </button>

        {/* Display the error message from the signIn result */}
        {error && <p className="text-red-600">{error}</p>}
      </form>
      <div className='flex items-center justify-center gap-4 mt-4'>
        <div>New user? </div>
        <div className="flex items-center justify-center gap-4 ">
          <Link href={"/auth/signup"}>
            <Button>Signup</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}