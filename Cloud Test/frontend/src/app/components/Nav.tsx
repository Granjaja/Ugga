"use client"
import React, { use, useEffect, useState } from 'react'
import { Button } from './ui/button'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation';
import { currentUser, logoutUser } from '../auth/actions';
import { useSession, signIn, signOut } from 'next-auth/react';

function Nav() {

    const [user_name, setUser_name] = useState("");
    const [isLogged, setIslogged] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const {data: session} = useSession();

    // useEffect(() => {
    // const fetchUser = async () => {
    //   try {
    // const newUser = await currentUser();

    // console.log('newUser:', newUser);
    //     if (newUser) {
    //       setIslogged(true);
    //       setUser_name(newUser.user.name);
    //     } else {
    //       setIslogged(false);
    //       setUser_name("");
    //     }
    //   } catch (error) {
    //     console.error('Error fetching current user:', error);
    //     setIslogged(false);
    //     setUser_name("");
    //   } };
    // fetchUser();

    // }, []);
    
    // const getUser = async () => {
    //   try {
    //     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get_current_user`, {
    //       method: 'GET',
    //       credentials: 'include',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'Accept': 'application/json',
    //         'Cache-Control': 'no-cache',  // Prevent caching
    //         'Pragma': 'no-cache'
    //       }
    //     });

    //     console.log('Auth status:', res.status);
        
    //     if (!res.ok) {
    //       throw new Error('Not authenticated');
    //     }
        
    //     const data = await res.json();
    //     console.log('User data:', data);
    //     setIslogged(true);
    //     setUser_name(data.user.name);
    //   } catch (error) {
    //     console.error('Error fetching user:', error);
    //     setIslogged(false);
    //     setUser_name("");
    //   }
    // }
    // useEffect(() => {
    //   getUser();
    // }, [pathname]);
 

    // const handleLogout = async () => {
    //     try {
    //       const res = await logoutUser();
    //       if (res.success) {
    //         setIslogged(false);
    //         setUser_name("");
    //         router.push("/");
    //       } else {
    //         console.error("Logout failed:", res.errors);
    //       }
    //     } catch (err) {
    //       console.error("Error logging out:", err);
    //     }
    //   };

  return (
    <div className="flex items-center justify-between m-2 p-2">
        <Link href={"/"}>
        <h2 className="text-2xl font-bold mb-4 flex items-center justify-center bg-gradient-to-r from-black via-blue-500 to-green-500 text-orange-500 p-2 rounded-md"> Ugga</h2>
        </Link>
        
      <h3 className="text-lg font-medium mb-2 ">
                {session ? (
                    <>
                    Welcome, <span className="text-orange-400">{session?.user?.name}</span>
                    </>
                ) : ( "Welcome to Ugga")}

      </h3>
<div className="flex items-center justify-center gap-4">
    {session ? (
        <>
          <button onClick={() => signOut()}>Logout</button>
        </>
      ) : (
        <Link href={"/auth/login"} >
          <Button className='hover:underline'>Login</Button> 
          </Link>
        
      )}
    
      </div>
      
    </div>
  )
}

export default Nav
