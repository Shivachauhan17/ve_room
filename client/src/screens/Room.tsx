import React,{ useEffect, useCallback, useState,useRef } from 'react'
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSelector,useDispatch } from 'react-redux';
import { IrootState } from '../store/reducer';
import { useSocket } from "../context/SocketProvider";
import { setIsInitiator } from '../store/one_to_one/actions';


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
    const dispatch=useDispatch()
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
    const isInitiator=useSelector((state:IrootState)=>state.one2one.isInitiator)
    const [sendStream,setSendStream]=useState(false)
    const [myStream, setMyStream] = useState<MediaStream|undefined>();
    const [remoteStream, setRemoteStream] = useState<MediaStream|undefined>();
    const localVideo=useRef<HTMLVideoElement|null>(null)
    const remoteVideo=useRef<HTMLVideoElement|null>(null)

    function base64ToBlob(base64String:string) {
      // Split the base64 string by the comma
      const parts = base64String.split(',');
  
      // Extract the data part and decode it from base64
      const data = atob(parts[1]);
  
      // Create an array to store the binary data
      const byteArray = new Uint8Array(data.length);
  
      // Populate the array with the binary data
      for (let i = 0; i < data.length; i++) {
          byteArray[i] = data.charCodeAt(i);
      }
  
      // Create a blob from the array
      return new Blob([byteArray], { type: 'image/png' });
  }
  
  function downloadBlob(blob:Blob, fileName:string) {
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName; // Set the download attribute to specify filename
    document.body.appendChild(link);

    // Trigger the click event on the link to start download
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}



  const generateImageWithCanvas = (
    track: MediaStreamTrack,
    videoElem: HTMLVideoElement
    ) => {
    const canvas = document.createElement("canvas");
  
    const { width, height } = track.getSettings();
    canvas.width = width || 100;
    canvas.height = height || 100;
    
    canvas.getContext("2d")?.drawImage(videoElem, 0, 0);
    const image = canvas.toDataURL("image/png");
  
    return image;
  };


  const downloadImage = (base64Image:string, fileName:string) => {
    // Convert the base64 string to a Blob
    const blob = base64ToBlob(base64Image);
    console.log("blob",blob)
  downloadBlob(blob, fileName);
};

  


    const captureFrameAndSave = useCallback(async() => {
        if (myStream) {
            
                if(localVideo.current){
                  const videoElement=localVideo.current
                  let mediaStream = videoElement.srcObject as MediaStream;
                  let image=null
                  const track = mediaStream.getVideoTracks()[0]
                  try {
                    image = await generateImageWithCanvas(track, videoElement);
                    downloadImage(image, 'captured_image.png');
                  } catch (error) {
                      console.error('Error capturing frame:', error);
                  }
                 
                  if(image) downloadImage(image, 'captured_image.png');
            
            }
        }
    }, [myStream,generateImageWithCanvas]);

    

    

    useEffect(()=>{
      if(remoteStream && !isInitiator && sendStream){
        console.log("capturing frames")
        setTimeout(()=>{captureFrameAndSave()},1000)
        // captureFrameAndSave()
      }

    },[isInitiator,remoteStream,sendStream])
    

    const handleUserJoined=useCallback(({email,id}:IuserJoined)=>{
        console.log(`Email ${email} joined room`)
        dispatch(setIsInitiator(true))
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
        if(myStream){
          setSendStream(true)
          for(const track of myStream.getTracks()){
              peer.peer.addTrack(track,myStream)
              }
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

    useEffect(()=>{
      if (myStream && localVideo.current) {
        localVideo.current.srcObject = myStream;
      }
    },[myStream])

    useEffect(()=>{
      if (remoteStream && remoteVideo.current) {
        remoteVideo.current.srcObject = remoteStream;
      }
    },[remoteStream])

  return (
    <div>
        <h1>Room Page</h1>
        <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
        {!isInitiator && myStream && <button onClick={sendStreams} >send Streams</button>}
        {isInitiator && remoteSocketId && <button onClick={handleCallUser}>CALL</button>}

        {myStream && (
        <>
          <h1>My Stream</h1>
          <video ref={localVideo}  autoPlay playsInline muted controls style={{ width: '200px', height: '100px' }}/>
        </>
      )}

      {remoteStream && (
        <>
          <h1>remote Stream</h1>
          <video ref={remoteVideo}  autoPlay playsInline muted controls style={{ width: '200px', height: '100px' }}/>
        </>
      )}
 
          
    </div>
  )
}

export default Room