import React from 'react'
import { useState,useEffect } from 'react'
import axios from 'axios'
export default function com() {
    const [text,nameselect]=useState("")
    const [ptext,passelect]=useState("")

   const handle=()=>{
   const data={text,ptext}
    useEffect(()=>{
      axios.post('http://localhost:5000/student',data)
      .then(Response=>{
        console.log("ok")
        text("")
        ptext("")
      })
      .catch(error=>{
        console.log("error")
      })
    },[data])
   }
    
  return (
    <>
    <div>
       <label htmlFor="text">Enter Name</label>
       <br/>
       <input htmltype='text' value={text} onChange={(e)=>{ select(e.type.value)}} placeholder='Enter the text'/>
       <br/>
       <label htmlFor="text">Enter Name</label>
       <br/>
       <input htmltype='password' value={ptext} onChange={(e)=>{ passelect(e.type.value)}} placeholder='Enter the password'/>
       <br/>
       <button htmltype='submit' onClick={handle}>sumbit</button>
    </div>
    </>
  )
}
