import { useState } from 'react';
import '../Css/HomeMid.css'
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AiOutlineVideoCameraAdd } from "react-icons/ai";
import api from '../axios/instance';
import Swal from 'sweetalert2'
import { encrypt } from '../utils/parameterEncryptDcrypt';

const HomeMid=()=>{
    const navigate=useNavigate()
    const name=localStorage.getItem("name")
    const email=localStorage.getItem("email")
    const [showCreateRoom,setShowCreateRoom]=useState(false)
    const [showJoinRoom,setShowJoinRoom]=useState(false)
    const [newRoomName,setNewRoomName]=useState("")
    const [joinRoomName,setJoinRoomName]=useState("")

    async function getNewRoom(){
        try{
            const result=await api.get<{data:string}>('/rooms/getRoom',{withCredentials:true})
            if(result.status===200){
                setNewRoomName(result.data.data)
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Room code is generated.',
                    confirmButtonText: 'OK',
                });
            }
        }
        catch(e){
            console.log(e)
            Swal.fire({
                icon: 'warning',
                title: 'Warning!',
                text: 'Error Occured while generating new  room code.',
                confirmButtonText: 'OK',
            });
        }

    }

    async function checkRoom(){
        try{
            const result=await api.post<{msg:boolean}>('/rooms/checkRoom',{code:joinRoomName},{withCredentials:true})
            if(result.status==200){
                if(result.data.msg===true){
                    const encrypted=encrypt(joinRoomName)
                    navigate(`/sender/${encrypted}`)
                }
            }
        }
        catch(e){
            console.log(e)
            Swal.fire({
                icon: 'warning',
                title: 'Warning!',
                text: 'Error Occured while verifying room host.',
                confirmButtonText: 'OK',
            });
        }
    }


    return(<>
   <div className="flex flex-col justify-start items-start p-8 gap-8 text-2xl font-semibold sm:gap-12 sm:text-3xl sm:p-16 lg:text-4xl">

        <div className="">
            <div className='font-bold'>
                <h1>Bringing People <span className="font-extrabold text-violet-900">Together, </span><br/>Anywhere.</h1>
            </div>
            <p className='  font-normal'>Experience seamless communication with ironclad security. Connect, share screens, and innovate together, <br />hassle-free.</p>
            
        </div>

        {/* {(localStorage.getItem("authToken")) ? */}
        {name && email ?<div className="flex flex-row justify-start gap-2">

            <button onClick={()=>{setShowCreateRoom(!showCreateRoom)}} className="border-[1px] border-violet-800 text-violet-800 rounded-md p-2 py-1 hover:text-white hover:bg-violet-800 text-[20px]">Make-Room</button> 

            <button onClick={()=>{setShowJoinRoom(!showJoinRoom)}} className="border-[1px] border-violet-800 text-violet-800 rounded-md p-2 py-1 hover:text-white hover:bg-violet-800 text-[20px]">Join-Room</button>
        </div>:null}
        {showCreateRoom?
        <div className='text-[20px] font-normal flex flex-col justify-start items-start'>
            <div className='font-semibold'>Video calls and meetings for everyone</div>
            <div>Connect, collaborate, and celebrate from <br/> anywhere with Ve_room</div>
            <div>
                {newRoomName?
                <div className='flex gap-1 justify-start items-center '>
                    Room Code: <div className='text-violet-800 '>{newRoomName}</div>
                 </div>   
                :<div className='flex gap-1 justify-start items-center bg-violet-800 text-white p-1 px-2 rounded-md cursor-pointer' onClick={()=>{getNewRoom()}}>
                    <AiOutlineVideoCameraAdd />
                    <div>New room</div>
                </div>}
            </div>
        </div>
        :null}
        {
            showJoinRoom?
            <div className='text-[20px] font-normal flex flex-col justify-start items-start'>
            <div className='font-semibold'>Video calls and meetings for everyone</div>
            <div>Connect, collaborate, and celebrate from <br/> anywhere with Ve_room</div>
            <div className='flex flex-col gap-1'>
                <input className='border-[1px] border-violet-800 rounded-md p-1 outline-none' placeholder='Enter room code'/>
                <div className='flex justify-start'>
                    <div className='flex gap-1 justify-start items-center bg-violet-800 text-white p-1 px-2 rounded-md cursor-pointer' onClick={()=>{checkRoom()}}>
                        <AiOutlineVideoCameraAdd />
                        <div>Join room</div>
                    </div>
                </div>
            </div>
        </div>:null
        }
        {/* : */}
        {!name && !email?<div  className="font-semibold">
            <p>*Please  <span className='text-violet-800 underline cursor-pointer' onClick={()=>{navigate('/LoginPage')}}>Login</span> OR <span className='text-violet-800 underline cursor-pointer' onClick={()=>{navigate('/SignUpPage')}}>create new Account .</span> </p>
        </div>:null}

        {/* } */}
    

   </div>
    </>)
}
export default HomeMid;