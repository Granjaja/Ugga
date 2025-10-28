"use client"
import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'

import { useSession } from 'next-auth/react';

function Nav() {

  // Use session data from next-auth/react to get user name and check authentication
  const {data: session} = useSession();

  return (
    <nav className="flex items-center m-2 p-2 bg-white rounded-md shadow-sm">
        <div className='p-2 m-2'>
          <Link href={"/"}>
        <h2 className=" flex items-center justify-center text-xl font-bold bg-gradient-to-r from-black via-blue-500 to-green-500 text-orange-500 p-2 rounded-md"> Ugga</h2>
        </Link>
        </div>
        <div className='flex items-center justify-center w-full'>
          <div className='m-2 p-2'>
        <h3 className='cursor-pointer hover:underline hover:text-orange-400 font-bold'>
          <Link href={"/"}>Home</Link>
          </h3>
      </div>
      <div className='flex-grow text-center'>
        <h3 className="text-lg font-medium m-2 md:inline-block">
                {session ? (
                    <>
                    Welcome, <span className="text-orange-400">{session?.user?.name}</span>
                    </>
                ) : ( "Welcome to Ugga")}

      </h3>
      </div>
      
      
<div className="flex items-center justify-center gap-4">
    {session ? (
        <Link href={"/auth/login"} >
          <Button className='hover:underline hover:text-teal-400'>Logout</Button> 
          </Link>
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
