import  { useState,useCallback,useEffect,FormEvent  } from 'react'
import { useSocket } from '../context/SocketProvider'
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { IrootState } from '../store/reducer';

export interface Idata{
    email:string,
    room:string
}


function Lobby() {
    const isInitiator=useSelector((state:IrootState)=>state.one2one.isInitiator)
    console.log(isInitiator)
    const navigate=useNavigate()
    let userEmail=""
    const [uemail,setEmail]=useState("")
    console.log(uemail)
    let email=localStorage.getItem("userEmail")
     if(email && typeof email==='string'){
      userEmail=email
     }

    console.log(userEmail)
    
    console.log(userEmail,"userEmial")

    const [room,setRoom]=useState("")
    const socket=useSocket()
    console.log(socket)
    const handleSubmitForm=useCallback((e: FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        socket.emit("room:join",{email,room})
    },[email,room,socket])

    const handleJoinRoom = useCallback(
      (data:Idata) => {
        console.log(data)
        
        const { email, room } = data;
        console.log(email)
        navigate(`/room/${room}`);
      },
      [navigate]
    );

    useEffect(()=>{
      socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
    },[socket, handleJoinRoom])

  return (
   <div>
      <h1>Lobby</h1>
      <form onSubmit={handleSubmitForm}>
      
        <label htmlFor="email">Email ID</label>
        <input
          type="email"
          id="email"
          value={userEmail}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <label htmlFor="room">Room Number</label>
        <input
          type="text"
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <br />
        <button type='submit'>Join</button>
      </form>
    </div>
  )
}

export default Lobby