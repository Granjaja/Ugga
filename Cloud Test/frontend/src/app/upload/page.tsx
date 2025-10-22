"use client"
import React, { useEffect, useState } from 'react'

const UploadPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState<string>(''); 
    const [files, setFiles] = useState<{name: string, url: string}[]>([]);
    const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
    const fileInputRef = React.useRef<HTMLInputElement>(null);


    const fetchFiles = async () => {
      try {
        const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/list-files`);

        if (res.ok) {
          const files = await res.json();
          setFiles(files);
        }
        
      } catch (error) {
        setMessage('An error occurred. Please try again.');
      }
    };

    useEffect(() => {
      fetchFiles();
    }, []);
     
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setMessage('');
        }
        };
    
      const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
          setMessage('Please select a file to upload.');
          return;
        }
        const formData = new FormData();
        formData.append('file', file);
        try {
          const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/upload`, {
            method: 'POST',
            body: formData,
          });
          if (response.ok) {
            setMessage('File uploaded successfully!');
            setFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            fetchFiles();
          } else {
            setMessage('File upload failed. Please try again.');
          }
        } catch (error) {
          setMessage('An error occurred. Please try again.');
        }
      };

      //Fetch uploaded files list
    


  return (
    <div className='flex flex-row gap-4 items-center'>
      <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Upload a Document</h2>
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Upload
          </button>
        </form>

        {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
      </div>
      
      {/* List of uploaded files */}
      <div className="mt-6 max-w-md mx-auto p-6 border rounded-lg shadow-lg w-full">
      <h3 className="text-xl font-semibold mb-2 text-center">Uploaded Documents</h3>
        {files.length > 0 && (
            <ul className="space-y-2">
              {files.map((f) => (
                <li key={f.name} className="text-blue-600 hover:underline text-center">
                  <a href={`${NEXT_PUBLIC_API_URL}${f.url}`} target="_blank" rel="noopener noreferrer">
                    {f.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
      </div>
    
    </div>
    
  )
}

export default UploadPage
