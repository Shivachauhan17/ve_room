import { useEffect, useCallback, useState,useRef } from 'react'
import { useParams } from 'react-router-dom';
import peer from "../service/peer";
import { useSelector,useDispatch } from 'react-redux';
import { IrootState } from '../store/reducer';
import { useSocket } from "../context/SocketProvider";
import { setIsInitiator } from '../store/one_to_one/actions';


export interface IuserJoined{
    email:string,
    id:string
}

export interface Iverify{
  email:string,
  initiatorEmail:string,
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
    const { roomId } = useParams();
    const dispatch=useDispatch()
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
    const isInitiator=useSelector((state:IrootState)=>state.one2one.isInitiator)
    const [sendStream,setSendStream]=useState(false)
    const [myStream, setMyStream] = useState<MediaStream|undefined>();
    const [remoteStream, setRemoteStream] = useState<MediaStream|undefined>();
    const localVideo=useRef<HTMLVideoElement|null>(null)
    const remoteVideo=useRef<HTMLVideoElement|null>(null)
    const [verify,setVerify]=useState(false)
    const [imageBase64,setImageBase64]=useState<string|null>(null)
    // const [audioClip,setAudioClip]=useState(null)


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




const captureFrameAndSave = useCallback(async() => {
  if (myStream) {
      
          if(localVideo.current){
            const videoElement=localVideo.current
            let mediaStream = videoElement.srcObject as MediaStream;
            let image=null
            const track = mediaStream.getVideoTracks()[0]
            try {
              image = generateImageWithCanvas(track, videoElement);
            } catch (error) {
                console.error('Error capturing frame:', error);
            }
           if(image){
            setImageBase64(image)
            return image}
           return null
      
      }
  }
}, [myStream,generateImageWithCanvas]);


useEffect(()=>{
  if(imageBase64){
    console.log(imageBase64)
  }
},[imageBase64])

useEffect(()=>{
  if(myStream && !isInitiator && sendStream && verify){
    console.log("capturing frames")
    setTimeout(()=>{
      captureFrameAndSave()
    },1000)
    // captureFrameAndSave()
  }
},[verify,isInitiator,myStream,sendStream])

    

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
          console.log("Call Accepted!",from);
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

      const handleVerifyEvent=useCallback(async({email,initiatorEmail}:Iverify)=>{
        setVerify(true)
        console.log("email",email)
          console.log("initiatorEmail",initiatorEmail)
        // if(base64ImageList && base64ImageList.length>0){
          //endpoint hit
          // console.log("email",email)
          // console.log("initiatorEmail",initiatorEmail)
        // }
      },[])

      function startRecording() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
              let audioChunks:Blob[]=[]
              let mediaRecorder = new MediaRecorder(stream);
    
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };
    
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    
                    // Create a URL for the Blob
                    const audioUrl = URL.createObjectURL(audioBlob);
    
                    // Create a download link for the audio WAV file
                    const link = document.createElement('a');
                    link.href = audioUrl;
                    link.download = 'recorded_audio.wav';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
    
                    // Cleanup
                    URL.revokeObjectURL(audioUrl);
                };
    
                mediaRecorder.start();

                setTimeout(()=>{
                  stopRecording(mediaRecorder,audioChunks)
                },10000)
                
            })
            .catch(error => {
                console.error('Error accessing user media:', error);
            });
    }

    
    function stopRecording(mediaRecorder:MediaRecorder,audioChunks:Blob[]) {
        mediaRecorder.stop();
        console.log(audioChunks)
        audioChunks = [];
    }
    

      const handleVerifyAudioEvent=useCallback(async({email,initiatorEmail}:Iverify)=>{
        console.log("email",email)
          console.log("initiatorEmail",initiatorEmail)
        startRecording()

      },[])

    useEffect(()=>{
        socket.on('user:joined',handleUserJoined)
        socket.on('incomming:call',handleIncommingCall)
        socket.on("call:accepted", handleCallAccepted);
        socket.on("peer:nego:needed",handleNegoNeededIncoming)
        socket.on("peer:nego:final",handleNegoNeedFinal)
        socket.on("verify",handleVerifyEvent)
        socket.on("verifyAudio",handleVerifyAudioEvent)
        return()=>{
            socket.off('user:joined',handleUserJoined)
            socket.off('incomming:call',handleIncommingCall)
            socket.off("call:accepted", handleCallAccepted);
            socket.off("peer:nego:needed",handleNegoNeededIncoming)
            socket.off("peer:nego:final",handleNegoNeedFinal)
            socket.off("verify",handleVerifyEvent)
            socket.off("verifyAudio",handleVerifyAudioEvent)

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

    // let imageBase64List=[]
    //   if(remoteStream && !isInitiator && sendStream){
    //     console.log("capturing frames")
    //     imageBase64List=captureFrameAndSave()
    //     if(imageBase64List.length>0){
    //       socket.emit("verify",imageBase64List){
            
    //       }
    //     }
    //     // captureFrameAndSave()
    //   }
    //   ,isInitiator,myStream,sendStream
    const handleVerifyClick=useCallback(()=>{
      socket.emit("verify",roomId)
    },[socket])

    const handleVerifyAudioClick=useCallback(()=>{
      socket.emit("verifyAudio",roomId)
    },[socket])

  return (
    <div>
        <h1>Room Page</h1>
        <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
        {!isInitiator && myStream && <button onClick={sendStreams} >send Streams</button>}
        {isInitiator && remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
        {isInitiator && <button onClick={handleVerifyClick}>verifyVideo</button>}
        {isInitiator && <button onClick={handleVerifyAudioClick}>verifyAudio</button>}

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