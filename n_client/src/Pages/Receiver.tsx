import React,{useEffect} from 'react'

function Receiver() {

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:5000');
    socket.onopen = () => {
        socket.send(JSON.stringify({
            type: 'receiver'
        }));
    }
    startReceiving(socket);
  }, []);


  function startReceiving(socket: WebSocket) {
    const video = document.createElement('video');
    document.body.appendChild(video);

    const pc = new RTCPeerConnection();
    pc.ontrack = (event) => {
        video.srcObject = new MediaStream([event.track]);
        video.play();
    }

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'createOffer') {
            pc.setRemoteDescription(message.sdp).then(() => {
                pc.createAnswer().then((answer) => {
                    pc.setLocalDescription(answer);
                    socket.send(JSON.stringify({
                        type: 'createAnswer',
                        sdp: answer
                    }));
                });
            });
        } else if (message.type === 'iceCandidate') {
            pc.addIceCandidate(message.candidate);
          }
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

  return (
    <div>recceiver
      <button> Send data </button>
    </div>
  )
}

export default Receiver