import React  from "react";
import { useState } from "react";
import '../Css/LoginPage.css'

// import { Lock } from 'lucide-react';
import { CiLock } from "react-icons/ci";
// import { Mail } from 'lucide-react';
import { CiMail } from "react-icons/ci";
import { useNavigate } from "react-router-dom";


const LoginPage=()=>{
    const [credentials,setcredentials]=useState({email:"" ,password:""});
    const [showPopup, setShowPopup] = useState(false);
    const [signInButton,setsignInButton]=useState(true);
    const Navigate=useNavigate();
    const handleSubmit=async(event:React.MouseEvent<HTMLButtonElement>)=>{
        setsignInButton(false)
        setShowPopup(true)
    

        event.preventDefault();
        const response=await fetch("http://localhost:8000/LogIn",{        
            method:"POST",
            headers:{
                'Content-Type':'application/json'     
            },
            body:JSON.stringify({email:credentials.email,password:credentials.password})

        })
        
        const json=await response.json();
        console.log(json);

        if(!json.success){
            setShowPopup(false)
            setsignInButton(true)
            alert("wrong information you are providing")
        }
        if(json.success){
            setShowPopup(false)
            setsignInButton(true)
            localStorage.setItem("authToken",json.authToken)
            localStorage.setItem("userEmail",credentials.email)
            localStorage.setItem("userId",json.userId)
            // console.log(userId)
            alert("login successfully")
            Navigate("/")
        }
    }
    const HandleNamechange=(event:React.ChangeEvent<HTMLInputElement>)=>{
        setcredentials({...credentials,[event.target.name]:event.target.value})
    }

    return<>
    <div className="w-full  flex flkex-row justify-center items-start mt-20 sm:mt-40">
        
        <div className="border-[1px] border-gray-300 p-8 rounded-lg sm:p-16">
            <div className="">

            <div className="flex flex-col gap-4 justify-start items-center sm:gap-8">

                <div className="font-bold text-violet-800">
                    <h2>LOG-IN</h2>
                </div>

                <div className=" flex justify-start items-center gap-2 sm:gap-4">
                    <div className="text-2xl sm:text-3xl"><CiMail/></div>
                    <input
                    className="p-1 h-[40px] sm:h-[45px] rounded-md bg-gray-100 border-[1px] border-gray-300 outline-none "
                    type="email" name="email" value={credentials.email} onChange={HandleNamechange}  id="emailInput" placeholder="Your Email"/>
                </div>

                <div className=" flex justify-start items-center gap-2"> 
                <div className="text-2xl sm:text-3xl"><CiLock/></div>    
                        <input 
                        className="p-1 h-[40px] sm:h-[45px] rounded-md bg-gray-100 border-[1px] border-gray-300 outline-none"
                        type="password" name="password" value={credentials.password} onChange={HandleNamechange} placeholder="Password"/>     
                </div> 
                {showPopup &&
                    <div className="">
                    <h2>Please Wait !</h2>
                    <div className=""></div>
                </div>
                }
                {signInButton &&
                    <div className="">
                    <button 
                    className="border-[1px] border-violet-800 text-violet-800 rounded-md p-2 sm:px-4 py-1 hover:text-white hover:bg-violet-800 font-semibold"
                    onClick={handleSubmit}>Submit</button>
                    </div>
                }
                

            </div>

            </div>

        </div>
    </div>
    </>
}

export default LoginPage;