import React,{useRef,useEffect,useState} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IRootreducer } from '../store/rootReducer';
import Video from '../components/Video';
import SendMessageBox from '../components/SendMessageBox';
import ReceiveMessageBox from '../components/ReceiveMessageBox';
import * as io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import {
  setLocalStream, 
  setRemoteStream, 
  setIsInitiatorReady, 
  setIsChannelReady, 
  setIsStarted,
  setRoom,
  setGotUserMedia,
  setOffer
} from '../store/meeting/actions'


let sendChannel:RTCDataChannel;
let receiveChannel:RTCDataChannel;
let pc:RTCPeerConnection | null;
// let meetRoom:string | null;

const pc_config={iceServers: [
  {
    urls: "stun:stun.l.google.com:19302",
  },
]}

const pc_constraints = {
  optional: [
  {DtlsSrtpKeyAgreement: true}
  ]};
  
const sdpConstraints = {};

const constraints={video:true,audio:true}


function MeetPage() {
  const dispatch=useDispatch()
  const { roomId } = useParams();
  if(roomId){
    dispatch(setRoom(roomId))
  }
  const isChannelReady=useSelector((state:IRootreducer)=>state.meeting.isChannelReady)
  const isInitiator=useSelector((state:IRootreducer)=>state.meeting.isInitiator)
  const isStarted=useSelector((state:IRootreducer)=>state.meeting.isStarted)
  const localStream=useSelector((state:IRootreducer)=>state.meeting.localStream)
  const remoteStream=useSelector((state:IRootreducer)=>state.meeting.remoteStream)
  console.log(remoteStream)
  const room=useSelector((state:IRootreducer)=>state.meeting.room)
  const [isOffer,setOffer]=useState(false)
  const [isGotUserMedia,setGotUserMedia]=useState(false)
  const [webSocket, setSocket] = useState<io.Socket | null>(null);
  const [description,setDescription]=useState<RTCSessionDescriptionInit|null>(null);
  function handleUserMedia(stream:MediaStream){
    dispatch(setLocalStream(stream))
    console.log('adding local stream')
    sendMessage('got user media')
  }

  function handleUserMediaError(error:any){
    console.log('navigator.getUserMedia error: ', error);
  }

  function sendMessage(message:string | object){
    webSocket?.emit('message',{channel:room,message:message})
    console.log((performance.now() / 1000).toFixed(3),'sent message',message)

  }
  useEffect(()=>{
    webSocket?.emit('message',{channel:room,message:'got user media'})
  },[localStream,webSocket])
  function setLocalAndSendMessage(sessionDescription:RTCSessionDescriptionInit){
    pc?.setLocalDescription(sessionDescription)
    sendMessage(sessionDescription)
    console.log((performance.now() / 1000).toFixed(3),"set local description and sent session description")
  }
  function onSignalingError(error:any){
    console.log('Failed to create signaling message : ' + error);
  }

  function doCall(){
    
    pc?.createOffer(sdpConstraints).then(setLocalAndSendMessage).catch(onSignalingError)
    console.log((performance.now() / 1000).toFixed(3),'Created and sent offer')
  }

  function handleIceCandidate(event:RTCPeerConnectionIceEvent){
    
    if(event.candidate){
        sendMessage({
            type:'candidate',
            label:event.candidate.sdpMLineIndex,
            id:event.candidate.sdpMid,
            candidate:event.candidate.candidate
        })
        console.log((performance.now() / 1000).toFixed(3),'handler sent the ice candidates')
    }
    else{
        console.log('End of candidates')
    }
  }

  function handleRemoteStreamAdded(event:RTCTrackEvent){
    dispatch(setRemoteStream(event.streams[0]))
    console.log((performance.now() / 1000).toFixed(3),'remote stream added')
  }



  function createPeerConnection(){
    try{
        pc=new RTCPeerConnection(pc_config)   
        // pc.setConfiguration( {'DtlsSrtpKeyAgreement': true});     
        localStream?.getTracks().forEach(track => pc?.addTrack(track, localStream));
        pc.onicecandidate=handleIceCandidate
        console.log((performance.now() / 1000).toFixed(3),'Created RTCPeerConnnection with:\n' +
        ' config: \'' + JSON.stringify(pc_config) + '\';\n' +
        ' constraints: \'' + JSON.stringify(pc_constraints) + '\'.');
    }
    catch(e){
        console.log((performance.now() / 1000).toFixed(3),'Failed to create PeerConnection, exception: ' + e);
        alert('Cannot create RTCPeerConnection object.');
        return;
    }
    if(pc){
      pc.ontrack = handleRemoteStreamAdded;
      // pc.onremovetrack = handleRemoteStreamRemoved;
    }

    if(isInitiator){
        try{
            sendChannel = pc.createDataChannel("sendDataChannel");
            console.log((performance.now() / 1000).toFixed(3),"created data channel")
            // {reliable: true});
            
        }
        catch(e){
            alert('Failed to create data channel. ');
            console.log((performance.now() / 1000).toFixed(3),'createDataChannel() failed with exception: ' + e);
        }
        sendChannel.onopen = handleSendChannelStateChange;
        sendChannel.onmessage = handleMessage;
        sendChannel.onclose = handleSendChannelStateChange;
    }else{
        pc.ondatachannel = gotReceiveChannel;
    }
  }

  function gotReceiveChannel(event:RTCDataChannelEvent){
    receiveChannel=event.channel
    receiveChannel.onmessage=handleMessage
    receiveChannel.onopen=handleReceiveChannelStateChange
    receiveChannel.onclose=handleReceiveChannelStateChange
    console.log((performance.now() / 1000).toFixed(3),'received data channel')
  }
  
  function handleMessage(event:MessageEvent){
    if(receiveTextArea && receiveTextArea.current){
      receiveTextArea.current.value += event.data + '\n';
    }else{
      console.log("error in hnadleMessage at receive channel")
    }
  }

  function handleSendChannelStateChange(){
    var readyState=sendChannel.readyState
    if(sendTextArea && sendButton && sendButton.current && sendTextArea.current){
      if(readyState=='open'){
          sendTextArea.current.focus()
          sendTextArea.current.disabled=false
          sendTextArea.current.placeholder=""
          sendButton.current.disabled = false;
      }
      else{
          sendTextArea.current.disabled=true
          sendButton.current.disabled=true
      }
    }else{
      console.log("sendTextArea or sendButton is null ")
    }
  }
  
  function handleReceiveChannelStateChange() {
    var readyState = receiveChannel.readyState;
    if(sendTextArea && sendButton && sendButton.current && sendTextArea.current){

      if(readyState=='open'){
          sendTextArea.current.focus()
          sendTextArea.current.disabled=false
          sendTextArea.current.placeholder=""
          sendButton.current.disabled = false;
      }
      else{
          sendTextArea.current.disabled=true
          sendButton.current.disabled=true
      }
    }else{
      console.log("sendTextArea or sendButton is null ")
    }

  } 

  

  

  function doAnswer(){
    pc?.createAnswer(sdpConstraints).then(setLocalAndSendMessage).catch(onSignalingError)
    console.log((performance.now() / 1000).toFixed(3),'Sent description answer to peer.',pc);
  }

  function hangup(){
    console.log('Hanging up')
    stop()
    sendMessage('bye')
  }
  
  function handleRemoteHangup(){
    console.log('Session terminated')
    stop()
    dispatch(setIsInitiatorReady(true))
  }

  function stop(){
    dispatch(setIsStarted(false))
    if(sendChannel) sendChannel.close()
    if(receiveChannel) receiveChannel.close()
    if(pc) pc.close()
    pc=null
    if(sendButton && sendButton.current)
      sendButton.current.disabled=true
  }



  useEffect(()=>{
    window.onbeforeunload = function() {
      hangup(); // Call the hangup() function when the page is about to be unloaded
    };
    const socket= io.connect('http://localhost:8001')
    if(socket){
      setSocket(socket)
    }
    if(room!==''){
      console.log('create or join room: ',room)
      socket.emit('create or join',room)
    }

    

    socket.on('created',function(room){
      console.log('created room'+room)
      dispatch(setIsInitiatorReady(true))
      navigator.mediaDevices.getUserMedia(constraints)
          .then(handleUserMedia)
          .catch(handleUserMediaError)
          console.log((performance.now() / 1000).toFixed(3),'getting user media');
      // checkAndStart();
    })

    socket.on('full',function(room){
      console.log('Room'+room+'is full')
    })

    socket.on('join', function(room){
      console.log((performance.now() / 1000).toFixed(3),'this is initiator and  another  peer made request to join.');
  
       dispatch(setIsChannelReady(true))
    })

    socket.on('joined', function(room){
      
       dispatch(setIsChannelReady(true))
      navigator.mediaDevices.getUserMedia(constraints)
          .then(handleUserMedia)
          .catch(handleUserMediaError)
          console.log((performance.now() / 1000).toFixed(3),'getting user media');
    })

    socket.on('message',function(message){
      console.log('Received message:', message);
      if (room!==undefined && message === 'got user media') {
          setGotUserMedia(true)
          console.log((performance.now() / 1000).toFixed(3),"set isGot user media true")
      }
      else if (message.type!==undefined && message.type === 'offer') {
          if (!isInitiator && !isStarted) {
            setOffer(true)
            console.log((performance.now() / 1000).toFixed(3),"after receiving oofer set isOffer true")
            if(typeof message=== 'RTCSessionDescriptionInit')
            setDescription(message)
          }
          
      } 
      else if(message.type!==undefined && message.type==='answer' && isStarted){
          console.log((performance.now() / 1000).toFixed(3),"setting received answer remote desc")
          pc?.setRemoteDescription(message)
      }
      else if(message.type!==undefined && message.type === 'candidate' && isStarted){
          console.log((performance.now() / 1000).toFixed(3),"adding ice candidate")
          var candidate= new RTCIceCandidate({sdpMLineIndex:message.label,
              candidate:message.candidate});
          pc?.addIceCandidate(candidate)
      }
      else if(message==='bye' && isStarted){
          handleRemoteHangup()
      }
    })
  },[])
  

  useEffect(()=>{
    console.log(isChannelReady,isInitiator,isGotUserMedia,isOffer)
    if(!isStarted && typeof localStream!==undefined && isChannelReady && isGotUserMedia ){
        console.log((performance.now() / 1000).toFixed(3) ,"calling create peer connection")
        createPeerConnection()
        console.log(" i am under check and start and this isInitiator vali",isInitiator)
        dispatch(setIsStarted(true))
        if(isInitiator){
            doCall()
        }
  
  }
  },[isChannelReady,isInitiator,isGotUserMedia])

  useEffect(()=>{
    if(description){
      if(!isStarted && typeof localStream!==undefined && isChannelReady && isOffer){
        createPeerConnection()
        console.log(" i am under check and start and this isInitiator value",isInitiator)
        dispatch(setIsStarted(true))
      }
      pc?.setRemoteDescription(new RTCSessionDescription(description));
      console.log((performance.now() / 1000).toFixed(3),"calling do answer")
      doAnswer();
    }
  },[isChannelReady,isOffer,description])



  let sendButton=useRef<HTMLButtonElement>(null)
  let sendTextArea=useRef<HTMLTextAreaElement>(null)
  let receiveTextArea=useRef<HTMLTextAreaElement>(null)

  

  return (
    <div id='mainDiv'>
      <div>
        <Video person={'sender'} stream={localStream}/>
        <SendMessageBox  textReference={sendTextArea} sendBtnReference={sendButton}/>
      </div>
      <div>
        <Video person={'receiver'} stream={remoteStream}/>
        <ReceiveMessageBox textReference={receiveTextArea} />
      </div>
    </div>
  )
}

export default MeetPage