import React,{ useEffect, useCallback, useState } from 'react'
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

export interface IuserJoined{
    email:string,
    id:string
}

export interface IincomingCall{
    from:string,
    offer:RTCSessionDescriptionInit
}

export interface IcallAccepted{
    from:string,
    ans:RTCSessionDescriptionInit
}


function Room() {
  console.log(peer)
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
    const [myStream, setMyStream] = useState<MediaStream|undefined>();
    const [remoteStream, setRemoteStream] = useState<MediaStream|undefined>();

    const handleUserJoined=useCallback(({email,id}:IuserJoined)=>{
        console.log(`Email ${email} joined room`)
        setRemoteSocketId(id);
    },[])

   

    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        const offer = await peer.getOffer();
        console.log(offer)  
        socket.emit("user:call", { to: remoteSocketId, offer });
        setMyStream(stream);
      }, [remoteSocketId, socket]);

      const handleIncommingCall = useCallback(
        async ({ from, offer }:IincomingCall) => {
          setRemoteSocketId(from);
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
          });
          setMyStream(stream);
          console.log(`Incoming Call`, from, offer);
          const ans = await peer.getAnswer(offer);
          socket.emit("call:accepted", { to: from, ans });
        },
        [socket]
      );

      const sendStreams=()=>{
        if(myStream)
        for(const track of myStream.getTracks()){
            peer.peer.addTrack(track,myStream)
            }
      }

      const handleCallAccepted = useCallback(
        ({ from, ans }:IcallAccepted) => {
          peer.setLocalDescription(ans);
          console.log("Call Accepted!");
          sendStreams()
        },
        [sendStreams]
      );

      const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
      }, [remoteSocketId, socket]);

      useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
        return () => {
          peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
        };
      }, [handleNegoNeeded]);

      const handleNegoNeededIncoming=useCallback(async({from,offer}:IincomingCall)=>{
        const ans = await peer.getAnswer(offer)
        socket.emit("peer:nego:done",{to:from,ans})

      },[socket])

      const handleNegoNeedFinal=useCallback(async({ans}:{ans:RTCSessionDescriptionInit})=>{
        console.log(ans)
        await peer.setLocalDescription(ans)

      },[])

      useEffect(()=>{
        peer.peer.addEventListener('track',async ev=>{
          console.log("Got Tracks")
          const remoteStream=ev.streams
          setRemoteStream(remoteStream[0])
        })
      },[])

    useEffect(()=>{
        socket.on('user:joined',handleUserJoined)
        socket.on('incomming:call',handleIncommingCall)
        socket.on("call:accepted", handleCallAccepted);
        socket.on("peer:nego:needed",handleNegoNeededIncoming)
        socket.on("peer:nego:final",handleNegoNeedFinal)
        return()=>{
            socket.off('user:joined',handleUserJoined)
            socket.off('incomming:call',handleIncommingCall)
            socket.off("call:accepted", handleCallAccepted);
            socket.off("peer:nego:needed",handleNegoNeededIncoming)
            socket.off("peer:nego:final",handleNegoNeedFinal)
        }
    },[
      socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted
    ])

  return (
    <div>
        <h1>Room Page</h1>
        <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
        {myStream && <button onClick={sendStreams} >send Streams</button>}
        {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}

        {myStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            playing
            muted
            height="100px"
            width="200px"
            url={myStream}
          />
        </>
      )}

      {remoteStream && (
        <>
          <h1>remote Stream</h1>
          <ReactPlayer
            playing
            muted
            height="100px"
            width="200px"
            url={remoteStream}
          />
        </>
      )}
 
          
    </div>
  )
}

export default Room