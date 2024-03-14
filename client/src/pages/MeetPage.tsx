import React,{useRef,useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IRootreducer } from '../store/rootReducer';
import Video from '../components/Video';
import SendMessageBox from '../components/SendMessageBox';
import ReceiveMessageBox from '../components/ReceiveMessageBox';
import * as io from 'socket.io-client';
import {setLocalStream, setRemoteStream, setIsInitiatorReady, setIsChannelReady, setIsStarted} from '../store/meeting/actions'


let sendChannel:RTCDataChannel;
let receiveChannel:RTCDataChannel;
let pc:RTCPeerConnection;
let room:string | null;

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
  const isChannelReady=useSelector((state:IRootreducer)=>state.meeting.isChannelReady)
  const isInitiator=useSelector((state:IRootreducer)=>state.meeting.isInitiator)
  const isStarted=useSelector((state:IRootreducer)=>state.meeting.isStarted)
  const localStream=useSelector((state:IRootreducer)=>state.meeting.localStream)
  console.log(localStream)
  const remoteStream=useSelector((state:IRootreducer)=>state.meeting.remoteStream)




  useEffect(()=>{
    room = prompt('Enter room name:');

    const socket= io.connect('http://localhost:8001')

    if(room!==''){
      console.log('create or join room',room)
      socket.emit('create or join',room)
    }

    function handleUserMedia(stream:MediaStream){
      dispatch(setRemoteStream(stream))
      console.log('adding local stream')
      sendMessage('got user media')
    }

    function handleUserMediaError(error:any){
      console.log('navigator.getUserMedia error: ', error);
     }

    socket.on('created',function(room){
    console.log('created room'+room)
    dispatch(setIsInitiatorReady(true))
    navigator.mediaDevices.getUserMedia(constraints)
        .then(handleUserMedia)
        .catch(handleUserMediaError)
    console.log('Getting user media with constraints', constraints);
    checkAndStart();
    })

    socket.on('full',function(room){
      console.log('Room'+room+'is full')
    })

    socket.on('join',function(room){
      console.log('Another peer made a request to join room ' + room);
      console.log('This peer is the initiator of room ' + room + '!');
  
      setIsChannelReady(true)
    })

    socket.on('joined',function(room){
      console.log('This peer has joined room ' + room);
      setIsChannelReady(true)
      navigator.mediaDevices.getUserMedia(constraints)
          .then(handleUserMedia)
          .catch(handleUserMediaError)
      console.log('Getting user media with constraints', constraints);
    })

    socket.on('message',function(message){
      console.log('Received message:', message);
      if (room!==undefined && message === 'got user media') {
          console.log("check and start run krra")
          checkAndStart();
      }
      else if (message.type!==undefined && message.type === 'offer') {
          if (!isInitiator && !isStarted) {
              checkAndStart();
          }
          pc.setRemoteDescription(new RTCSessionDescription(message));
          doAnswer();
      } 
      else if(message.type!==undefined && message.type==='answer' && isStarted){
          pc.setRemoteDescription(message)
      }
      else if(message.type!==undefined && message.type === 'candidate' && isStarted){
          var candidate= new RTCIceCandidate({sdpMLineIndex:message.label,
              candidate:message.candidate});
          pc.addIceCandidate(candidate)
      }
      else if(message==='bye' && isStarted){
          handleRemoteHangup()
      }
    })

    function sendMessage(message:string){
      console.log('Sending message',message)
      socket.emit('message',{channel:room,message:message})
    }

    function checkAndStart(){
      if(!isStarted && typeof localStream!==undefined && isChannelReady){
          createPeerConnection()
          console.log(" i am under check and start and this isInitiator valie",isInitiator)
          dispatch(setIsStarted(true))
          if(isInitiator){
              doCall()
          }
    }
    }

    function createPeerConnection(){
      try{
          pc=new RTCPeerConnection(pc_config,pc_constraints)        
          localStream?.getTracks().forEach(track => pc.addTrack(track, localStream));
          pc.onicecandidate=handleIceCandidate
          console.log('Created RTCPeerConnnection with:\n' +
          ' config: \'' + JSON.stringify(pc_config) + '\';\n' +
          ' constraints: \'' + JSON.stringify(pc_constraints) + '\'.');
      }
      catch(e){
          console.log('Failed to create PeerConnection, exception: ' + e.message);
          alert('Cannot create RTCPeerConnection object.');
          return;
      }
      pc.onaddstream = handleRemoteStreamAdded;
      pc.onremovestream = handleRemoteStreamRemoved;
  
  
      if(isInitiator){
          try{
              sendChannel = pc.createDataChannel("sendDataChannel",
              {reliable: true});
              trace('Created send data channel');
              
          }
          catch(e){
              alert('Failed to create data channel. ');
              trace('createDataChannel() failed with exception: ' + e.message);
          }
          sendChannel.onopen = handleSendChannelStateChange;
          sendChannel.onmessage = handleMessage;
          sendChannel.onclose = handleSendChannelStateChange;
      }else{
          pc.ondatachannel = gotReceiveChannel;
      }
    }
  
    
  },[])
  



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