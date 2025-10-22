import Link from 'next/link'
import React from 'react'

// Admin Dashboard for File Upload
function page() {
  return (
    <div className='flex justify-center items-center gap-4'>
      <div>
        <h1 className='text-xl font-semibold mb-2 text-foreground'>Upload Files</h1>
      </div>
      <div>
        <form>
          <Link href="/upload">
          <button className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700' type="submit">Upload</button>
          </Link>
          
        </form>
      </div>
    </div>
  )
}

export default page
