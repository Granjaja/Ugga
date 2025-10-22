import { getServerSession } from 'next-auth'
import Link from 'next/link'
import React from 'react'
import { authOptions } from '../auth';
import { useSession } from 'next-auth/react';


const Sidebar = () => {

  const session = useSession();
  if (session.data?.user.role !== 'Admin') {
    return null;
  }
  return (
    <div>
      <div>
        <h1 className='text-xl font-semibold mb-2 text-foreground'>Upload Files</h1>
      </div>
      <div>
        <form>
          <Link href="/admin/dashboard">
          <button className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700' type="submit">Upload</button>
          </Link>
          
        </form>
      </div>
    </div>
  )
}

export default Sidebar
