'use server'
import { getSession, signIn } from 'next-auth/react'
import { cookies } from 'next/headers'



interface FormState {
  success: boolean;
  errors: {
    name?: string ;
    email?: string ;
    password?: string[];
    general?: string ;
  };
}

// Function to handle user registration

export async function registerUser(prevState: FormState, formData: FormData):Promise<FormState> {

  /*
  Takes previous state and form data as arguments
  Returns object with success status, errors object, and empty errors object on success
  */
 
  const name = formData.get('name')?.toString().trim()
  const email = formData.get('email')?.toString().trim()
  const password = formData.get('password')?.toString()

  const errors: Record<string, string|string[]> = {}

  // Frontend validation
  if (!name) errors.name = 'Name is required'
  if (!email || !email.includes('@')) errors.email = 'Valid email is required'
  if (!password || password.length < 6)
    errors.password = ['be at least 6 characters long']

  if (Object.keys(errors).length > 0) {
    return { errors, success: false }
  }

  // Call backend API to register user
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

    if (!res.ok) {
      const responseText = await res.text();
      try {
        const data = JSON.parse(responseText);
        return {
          errors: { email: data.detail || 'Registration failed' },
          success: false,
        };
      } catch {
        console.error('Error parsing JSON:', responseText);
        return {
          errors: { general: 'An unexpected error occurred from the server.' },
          success: false,
        };
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

// Function to login user
export async function loginUser(prevState: FormState, formData: FormData) {
  const email = formData.get('email')?.toString().trim()
  const password = formData.get('password')?.toString()

//Use sign in from next-auth to handle login
  try {
      const res = await signIn('credentials', {
          redirect: false,
          email,
          password,
      });

      console.log('Login response:', res);

      if (res?.error) {
        return {
          errors: { general: res.error || 'Login failed' },
          success: false,
        };
      }
      return { ...prevState, success: true }

  } catch (err) {
      console.error('Error:', err)
      return {...prevState,
          errors: { general: 'Server not reachable' },
          success: false,
      }
  }

}
 
// Function to logout user using backend API
export async function logoutUser() {
  try {
    const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL

    const res = await fetch(`${NEXT_PUBLIC_API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    })

    console.log('Logout response:', res);

    if (!res.ok) {
      const responseText = await res.text();
      try {
        const data = JSON.parse(responseText);
        return {
          errors: { general: data.detail || 'Logout failed' },
          success: false,
        };
      } catch {
        console.error('Error parsing JSON:', responseText);
        return {
          errors: { general: 'An unexpected error occurred from the server.' },
          success: false,
        };
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

// Function to fetch user data using backend API
export async function fetchUserData() {

  // check if user is authenticated
  const session = await getSession()
  const token = session?.access_token

  if (!token) {
    throw new Error('No token found. User may not be authenticated.')
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get_current_user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',

  })
  if (!res.ok) {
    throw new Error('Failed to fetch user data')
  }
  const user = await res.json()
  return user
}


export async function currentUser() {
  try {
    const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    
    // Set cookies for server-side requests

    /* windows is an object on the client-side, and undefined on the server-side */
    if (typeof window === 'undefined') {
      const cookieStore = await cookies()
      const cookieHeader = cookieStore.toString()
      if (cookieHeader) {
        headers['cookie'] = cookieHeader
      }
    }

    const res = await fetch(`${NEXT_PUBLIC_API_URL}/get_current_user`, {
      method: 'GET',
      credentials: 'include',
      headers,
    })

    if (!res.ok) {
      const responseText = await res.text().catch(() => '')
      console.error('currentUser: backend responded non-OK:', res.status, responseText)
      return {
        errors: { general: 'Not authenticated' },
        success: false,
        status: res.status,
      }
    }

    const user = await res.json();
    return { success: true, user: user.user };
  } catch (err) {
    console.error('Error:', err)
    return {
      errors: { general: 'Server not reachable' },
      success: false,
    }
  }
}
