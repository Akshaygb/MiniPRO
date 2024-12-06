import React from 'react';
import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import axios from 'axios'
import './info.css';

export default function Info1() {
  const [name,tname]=useState("")
  const [ID,tID]=useState("")
  const [sem,tsem]=useState("")
  const [sub,tsub]=useState("")
  const navigate=useNavigate()
  const submit=(e)=>
  {
    e.preventDefault()
    const data={name:name,
      ID:ID,
      sem:sem,
      sub:sub
    }
    try{
      axios.post("http://localhost:5000/registration",data)
      .then((res)=>{
        if(res.status==201)
        {
          window.alert(res.data.message)
          navigate('/dashboard')
          
        }
      })
      .catch((error)=>{
        const errorMessage = error.response?.data?.message || "An error occurred";
        window.alert(errorMessage);
      }
      )
    }
    catch(error)
  {
    console.error("error")
  }
  }
  


  return (
    <div>
      <h1 className="header-title">Hello teachers</h1>
      <h2 className="header-title">Enter the following details for Attedence Registration</h2>
      <div className="cont">
        
        <div className="form-group">
          <label className="form-label" htmlFor="name" >Name:</label>
          <input type="text" className="form-input" value={name}onChange={(e)=>{tname(e.target.value)}}/>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="id" >Id:</label>
          <input type="text" className="form-input" value={ID}onChange={(e)=>{tID(e.target.value)}} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="sem" >Sem:</label>
          <input type="text" className="form-input" value={sem}onChange={(e)=>{tsem(e.target.value)}} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="subject" >Subject code:</label>
          <input type="text" className="form-input" value={sub}onChange={(e)=>tsub(e.target.value)} />
        </div>

        <div className="form-group">
          <button type="submit" className="submit-button" onClick={submit}>Submit</button>
        </div>

      </div>
    </div>
  );
}
