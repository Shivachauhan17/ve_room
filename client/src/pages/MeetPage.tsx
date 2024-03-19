import React,{useRef,useEffect} from 'react'
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
  setRoom
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

  const room=useSelector((state:IRootreducer)=>state.meeting.room)


  useEffect(()=>{
    window.onbeforeunload = function() {
      hangup(); // Call the hangup() function when the page is about to be unloaded
    };
    const socket= io.connect('http://localhost:8001')
    if(room!==''){
      console.log('create or join room: ',room)
      socket.emit('create or join',room)
    }

    function handleUserMedia(stream:MediaStream){
      dispatch(setLocalStream(stream))
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
          pc?.setRemoteDescription(new RTCSessionDescription(message));
          doAnswer();
      } 
      else if(message.type!==undefined && message.type==='answer' && isStarted){
          pc?.setRemoteDescription(message)
      }
      else if(message.type!==undefined && message.type === 'candidate' && isStarted){
          var candidate= new RTCIceCandidate({sdpMLineIndex:message.label,
              candidate:message.candidate});
          pc?.addIceCandidate(candidate)
      }
      else if(message==='bye' && isStarted){
          handleRemoteHangup()
      }
    })

    function sendMessage(message:string | object){
      console.log('Sending message',message)
      socket.emit('message',{channel:room,message:message})
    }
    function setLocalAndSendMessage(sessionDescription:RTCSessionDescriptionInit){
      pc?.setLocalDescription(sessionDescription)
      sendMessage(sessionDescription)
    }
    function onSignalingError(error:any){
      console.log('Failed to create signaling message : ' + error);
    }

    function doCall(){
      console.log('Creating Offer...')
      pc?.createOffer(sdpConstraints).then(setLocalAndSendMessage).catch(onSignalingError)
    }

    function handleIceCandidate(event:RTCPeerConnectionIceEvent){
      console.log('handleIceCandidate event: ', event);
      if(event.candidate){
          sendMessage({
              type:'candidate',
              label:event.candidate.sdpMLineIndex,
              id:event.candidate.sdpMid,
              candidate:event.candidate.candidate
          })
      }
      else{
          console.log('End of candidates')
      }
    }

    function handleRemoteStreamAdded(event:RTCTrackEvent){
      console.log('Remote stream added.');
      console.log('Remote stream attached!!.');
      dispatch(setRemoteStream(event.streams[0]))
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
          pc=new RTCPeerConnection(pc_config)   
          // pc.setConfiguration( {'DtlsSrtpKeyAgreement': true});     
          localStream?.getTracks().forEach(track => pc?.addTrack(track, localStream));
          pc.onicecandidate=handleIceCandidate
          console.log('Created RTCPeerConnnection with:\n' +
          ' config: \'' + JSON.stringify(pc_config) + '\';\n' +
          ' constraints: \'' + JSON.stringify(pc_constraints) + '\'.');
      }
      catch(e){
          console.log('Failed to create PeerConnection, exception: ' + e);
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
              // {reliable: true});
              
          }
          catch(e){
              alert('Failed to create data channel. ');
              console.log('createDataChannel() failed with exception: ' + e);
          }
          sendChannel.onopen = handleSendChannelStateChange;
          sendChannel.onmessage = handleMessage;
          sendChannel.onclose = handleSendChannelStateChange;
      }else{
          pc.ondatachannel = gotReceiveChannel;
      }
    }

    // function sendData(){
    //   if(sendTextArea && sendTextArea.current){
    //     var data=sendTextArea.current.value
    //     if(isInitiator)sendChannel.send(data)
    //     else receiveChannel.send(data)
    //   }else{
    //     console.log("sendText Area  is null")
    //   }
    // }

    function gotReceiveChannel(event:RTCDataChannelEvent){
      receiveChannel=event.channel
      receiveChannel.onmessage=handleMessage
      receiveChannel.onopen=handleReceiveChannelStateChange
      receiveChannel.onclose=handleReceiveChannelStateChange
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
      console.log('Sending answer to peer.');
      pc?.createAnswer(sdpConstraints).then(setLocalAndSendMessage).catch(onSignalingError)
    }

    

    
    // function handleRemoteStreamRemoved() {
    //   console.log('Remote stream removed. Event: ');
    // }

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