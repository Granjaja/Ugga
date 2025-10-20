'use client';

import Image from "next/image";


export default function Home() {
      

  
  return (
      <div className="flex items-center  flex-col max-w-4xl w-full m-auto min-h-screen p-3 border border-gray-300 rounded-md">
        <p className="mx-2 text-lg">Intelligent assistant for our company knowledge.</p>
       <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500 via-pink-500 to-purple-500">
              <Image src="/uggaimage.png" alt="Ugga image" width={500} height={500} />

      </div>

      <div className="text-xl font-semibold m-4">
        Ready to start using Ugga?

      </div>
      <div className="text-gray-600 mb-4">
       
       <ul className="mt-4 flex flex-col md:flex-row justify-center gap-4 text-center">
          <li className="bg-white p-3 rounded-lg shadow-md flex-1">Accurate answers about our company</li>
          <li className="bg-white p-3 rounded-lg shadow-md flex-1">Vital up-to-date data</li>
          <li className="bg-white p-3 rounded-lg shadow-md flex-1">Source documents that support the information</li>
        </ul>
        

      </div>
      <div className="flex justify-center items-center gap-4">
        <a href="/auth/signup" className="bg-blue-500 text-white p-2 rounded-md hover:bg-green-600">Create Account</a>
        <a href="/chat" className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600">Start Chatting</a>
      </div>

      
      </div>

  );
}
