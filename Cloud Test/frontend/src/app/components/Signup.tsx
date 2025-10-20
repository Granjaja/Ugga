'use client'

import { useActionState, useEffect } from 'react'
import { registerUser } from '../auth/actions'
import { useRouter } from 'next/navigation'

export default function SignupForm() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(registerUser, {
    errors: {},
    success: false,
  })

  useEffect(() => {
    if (state.success) {
      router.push('/auth/login')
    }
  }, [state.success, router])

  return (
    <form action={formAction} className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg space-y-4">
      <h2 className="text-2xl font-semibold text-center mb-4">Create an Account</h2>

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
        <input
          id="name"
          name="name"
          placeholder="Your Name"
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
        />
        {state?.errors?.name && <p className="text-red-500 text-sm mt-1">{state.errors.name}</p>}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
        <input
          id="email"
          name="email"
          placeholder="you@example.com"
          type="email"
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
        />
        {state?.errors?.email && <p className="text-red-500 text-sm mt-1">{state.errors.email}</p>}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
        />
        {state?.errors?.password && (
          <div className="text-red-500 text-sm mt-1">
            <p>Password must:</p>
            <ul className="list-disc ml-4">
              {state.errors.password.map((error: string) => (
                <li key={error}>- {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button
        disabled={pending}
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-all"
      >
        {pending ? 'Creating Account...' : 'Sign Up'}
      </button>

      {state?.success && (
        <p className="text-green-600 text-center mt-3">✅ Account created successfully!</p>
      )}
    </form>
  )
}
