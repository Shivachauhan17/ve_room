import React  from "react";
import { useState } from "react";
import { CiLock } from "react-icons/ci";
import { CiMail } from "react-icons/ci";
import api from "../axios/instance";
import Swal from 'sweetalert2'

const LoginPage=()=>{
    const [credentials,setcredentials]=useState({email:"" ,password:""});

    const handleSubmit=async(event:React.MouseEvent<HTMLButtonElement>)=>{
        event.preventDefault();
        api.post<{email:string, name:string}>('/login',credentials,{withCredentials:true})
        .then((response)=>{
            if (response.status === 200) {
                localStorage.setItem('email', response.data.email);
                localStorage.setItem('name', response.data.name);
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Your operation has been completed successfully.',
                });
            }
        })
        .catch((response)=>{
            if (response.status === 411) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Warning!',
                    text: 'Please send the correct inputs.',
                    confirmButtonText: 'OK',
                });
            } else if (response.status === 401) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Warning!',
                    text: 'No Such user exists.',
                    confirmButtonText: 'OK',
                });
            } else if (response.status === 500) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Some error occurred on the server side.',
                    confirmButtonText: 'OK',
                });
            }
        })
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
                
                {credentials.email.length!==0 && credentials.password.length!==0? 
                    <div className="">
                    <button 
                    className="border-[1px] border-violet-800 text-violet-800 rounded-md p-2 sm:px-4 py-1 hover:text-white hover:bg-violet-800 font-semibold"
                    onClick={handleSubmit}>Submit</button>
                    </div>:null
                }
                

            </div>

            </div>

        </div>
    </div>
    </>
}

export default LoginPage;