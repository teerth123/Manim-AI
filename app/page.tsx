"use client"
import { useState } from 'react';
import { X } from "./Gemini"

export default function Home() {


  const [prompt, setPrompt] = useState<string>("")
  const [response, setResponse] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await X({ prompt })
    setPrompt("")
    setResponse(res)
  }


  return (
    <>
      <div className='h-screen w-screen bg-[#0A0A0A] text-white flex justify-center items-center'>
        {
            response!=null && <div className='w-[90vw] bg-red-500 h-full'>
              <h1 className='text-black'>{response}</h1>
            </div>
          }
        <form action="" className='fixed bottom-10 h-fit' onSubmit={handleSubmit}>
          <input type="text" value={prompt}
            placeholder='describe the scene you want to animate'
            className='w-[70vw] h-10 rounded-full border border-[#b2b2b2] focus:ring-0  focus:outline-none px-5'
            onChange={(e) => { setPrompt(e.target.value) }} />
        </form>
      </div>

    </>
  );
}
