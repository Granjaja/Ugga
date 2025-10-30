"use client"
import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react';
import { logoutUser } from '../auth/actions';
import { useRouter } from 'next/navigation';

function Nav() {

  // Use session data from next-auth/react to get user name and check authentication
  const {data: session} = useSession();
  const router = useRouter()

  // const handleLogout = async () => {
  //   await logoutUser()
  //   router.push('/auth/login')
  // }

  
  return (
    <nav className="flex items-center m-2 bg-white rounded-md shadow-sm">
        <div className='m-2'>
          <Link href={"/"}>
        <h2 className=" flex items-center justify-center text-xl font-bold bg-gradient-to-r from-black via-blue-500 to-green-500 text-orange-500 p-2 rounded-md"> Ugga</h2>
        </Link>
        </div>
        <div className='flex items-center justify-center w-full'>
          <div className='p-2'>
        <h3 className='cursor-pointer hover:underline hover:text-orange-400 font-bold'>
          <Link href={"/"}>Home</Link>
          </h3>
      </div>
      <div className='flex-grow text-center'>
        <h3 className="font-medium m-2 md:inline-block">
          Welcome {session?.access_token ? <span className="text-orange-400">{session?.user?.name}</span> : ""}
      </h3>
      </div>
      
      
<div className="flex items-center justify-center gap-4">
    {session?.access_token ? (
          <Button onClick={() => signOut()} className='hover:underline hover:text-teal-400'>Logout</Button> 
      ) : (
        <Link href={"/auth/login"} >
          <Button className='hover:underline hover:text-teal-400'>Login</Button> 
          </Link>
        
      )}
    
      </div>
        </div>
      
    </nav>
  )
}

export default Nav
