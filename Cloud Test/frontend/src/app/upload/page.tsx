"use client"
import React, { useState } from 'react'

const UploadPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState<string>(''); 
     
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
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          if (response.ok) {
            setMessage('File uploaded successfully!');
            setFile(null);
          } else {
            setMessage('File upload failed. Please try again.');
          }
        } catch (error) {
          setMessage('An error occurred. Please try again.');
        }
      };



  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Upload a Document</h2>
      <form onSubmit={handleUpload} className="flex flex-col gap-4">
        <input
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
  )
}

export default UploadPage
