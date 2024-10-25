import React from 'react'
import { useState,useEffect} from 'react'
import './Login.css'

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState("");
    const [forData1,setFormData1]=useState("")
    const [forData2,setFormData2]=useState("")
    const toggle=(e,type)=>
    {
      e.preventDefault();
       setIsLogin(type==='login');
    }
    const handleSubmit = (e) => {
      e.preventDefault();
      console.log('Form Data:', formData);
      console.log('Form Data 1:', forData1);
      console.log('Form Data 2:', forData2);
    };

  return (
    <div className='containe'>
        <div className='login'>
            <h1 className= "head" >Login Form</h1>
           <div className='tab-cont'>
            <button className={`loginb ${isLogin?'active':'isactive'}`} onClick={(e)=>{toggle(e,'login')}}>Login</button>
            <button className={`loginb ${!isLogin?'active':'isactive'}`} onClick={(e)=>{toggle(e,'signup')}}>Singup</button>
           </div>
           <div className='loginform'>
            <form className={`form ${isLogin ? 'active' : ''}`}>
              <div className='forngoup'>
                <input type="text" className='from-input' placeholder='Teacher ID'  value={formData} onChange={(e)=>{setFormData(e.target.value)}} />
              </div>
              <div className='forngoup'>
                <input type="password" className='from-input' placeholder='Password' value={forData1} onChange={(e)=>{setFormData1(e.target.value)}} />
              </div>
              <a  className="forget" href="">Forgot password</a>
              <button type='submit'className="auth-button">Login</button>
              <a href="" className="auto-link" onClick={(e)=>{toggle(e,'s')}}>Singup now</a>
            </form>
            <form className={`form ${!isLogin ? 'active' : ''}`}>
                <div className='forngoup'>
                  <input type="text"  className='from-input' onChange={(e)=>{setFormData(e.target.value)} } value={formData} placeholder='Teacher ID' />
               </div>
              <div className='forngoup'>
                <input type="password" className='from-input' placeholder='Password' value={forData1} onChange={(e)=>{setFormData1(e.target.value)} } />
              </div>
              <div className='forngoup'>
                <input type="password" className='from-input' placeholder=' Confirm Password' value={forData1} onChange={(e)=>{setFormData1(e.target.value)} } />
              </div>
              <button className="auth-button"> Singup</button>
              <p>Already have an account? <a  className="auto-link"href="#" onClick={(e)=>{toggle(e,'login')}}> Login</a></p>
              <div>

              </div>
            </form>
           </div>
        </div>
    </div>

  )
}
