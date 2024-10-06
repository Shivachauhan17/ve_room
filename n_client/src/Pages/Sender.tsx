import { useEffect,useState } from "react"

function Sender() {
    const [socket,setSocket]=useState<WebSocket|null>();
    const [pc, setPC] = useState<RTCPeerConnection | null>(null);
    
    useEffect(()=>{
        const socket=new WebSocket("ws://localhost:5000")
        setSocket(socket);
        socket.onopen=()=>{
            socket.send(JSON.stringify({type:'sender'}))
        }
    },[])

    const initiateCon=async()=>{
        if(!socket){
            alert("socket not found");
            return;
        }

        socket.onmessage=async(event)=>{
            const message=JSON.parse(event.data);
            if(message.type==='createAnswer'){
                await pc?.setRemoteDescription(message.sdp);
            }
            else if (message.type === 'iceCandidate') {
                pc?.addIceCandidate(message.candidate);
            }
        }

        const pc=new RTCPeerConnection()
        startVideoReceiving(pc)
        setPC(pc);
        pc.onicecandidate=(event)=>{
            if(event.candidate){
                socket?.send(JSON.stringify({type:"iceCandidate",candidate:event.candidate}))

            }
        };

        pc.onnegotiationneeded=async()=>{
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket?.send(JSON.stringify({
                type: 'createOffer',
                sdp: pc.localDescription
            }));
        }
        getCameraStreamAndSend(pc)
    }

    const getCameraStreamAndSend = (pc: RTCPeerConnection) => {
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            console.log("stream:",stream)
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            // this is wrong, should propogate via a component
            document.body.appendChild(video);
            stream.getTracks().forEach((track) => {
                pc?.addTrack(track);
            });
        });
    }

    const startVideoReceiving=(pc:RTCPeerConnection)=>{
        const video2 = document.createElement('video');
        document.body.appendChild(video2);
        pc.ontrack = (event) => {
            video2.srcObject = new MediaStream([event.track]);
            video2.play();
            console.log("onTrack event:",event)
        }
    }

  return (
    <div>
        <button onClick={initiateCon}> Send data </button>
    </div>
  )
}

export default Sender