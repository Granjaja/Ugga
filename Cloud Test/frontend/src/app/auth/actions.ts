'use server'


export async function registerUser(prevState: any, formData: FormData) {
  const name = formData.get('name')?.toString().trim()
  const email = formData.get('email')?.toString().trim()
  const password = formData.get('password')?.toString()

  const errors: Record<string, any> = {}

  // Frontend validation
  if (!name) errors.name = 'Name is required'
  if (!email || !email.includes('@')) errors.email = 'Valid email is required'
  if (!password || password.length < 6)
    errors.password = ['be at least 6 characters long']

  if (Object.keys(errors).length > 0) {
    return { errors, success: false }
  }

  // Backend request 
  try {
    const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL

    const res = await fetch(`${NEXT_PUBLIC_API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        role: 'employee',
      })
    })
    console.log('Response:', res)

    if (!res.ok) {
      const data = await res.json()
      return {
        errors: { email: data.detail || 'Registration failed' },
        success: false,
      }
    }

    return { success: true, errors: {} }
  } catch (err) {
    console.error('Error:', err)
    return {
      errors: { general: 'Server not reachable' },
      success: false,
    }
  }
}
