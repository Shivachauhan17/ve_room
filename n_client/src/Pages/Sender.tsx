import { useEffect, useState, useRef } from "react";
import { FiUserCheck } from "react-icons/fi";
import Loading from "../components/Loading";
import axios from "axios";

function Sender() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [pc, setPC] = useState<RTCPeerConnection | null>(null);
  const [remoteVideoStream, setRemoteVideoStream] =
    useState<MediaStream | null>(null);
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(
    null
  );
  const [isStartVideoStreamClicked, setIsStartVideoStreamClicked] =
    useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [snapshot,setSnapshot]=useState<string>()
  const  [isSnaphotClicked,setIsSnapShotClicked]=useState(false)
  const [responseCame,setResponseCame]=useState(false)
  const [isMatched,setIsMatched]=useState(false)
  console.log("isMatched:",isMatched)
  useEffect(()=>{
    async function VerifyImage(){
      try{
        const result=await axios.post<{match:boolean}>("http://localhost:8080/compare_faces",{ email:localStorage.getItem("email"),image:snapshot?.split(",")[1]},{withCredentials:true});
        if(result.status===200){
          setResponseCame(true)
          setIsMatched(result.data.match)
        }
      }
      catch(e){
        console.log(e)
      }
    }

    if(isSnaphotClicked && snapshot!==undefined &&  snapshot.length>0){
      VerifyImage()
    } 
  },[snapshot,isSnaphotClicked])

  useEffect(()=>{
    if (videoRef.current) {
        videoRef.current.srcObject = remoteVideoStream;
      }
  },[remoteVideoStream])

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:5000");
    setSocket(socket);
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "sender" }));
    };
  }, []);

  const initiateCon = async () => {
    if (!isStartVideoStreamClicked) {
      setIsStartVideoStreamClicked(true);
    }

    if (!socket) {
      alert("Socket not found");
      return;
    }

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "createAnswer") {
        await pc?.setRemoteDescription(message.sdp);
      } else if (message.type === "iceCandidate") {
        pc?.addIceCandidate(message.candidate);
      }
    };

    const pc = new RTCPeerConnection();
    startVideoReceiving(pc);
    setPC(pc);
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.send(
          JSON.stringify({ type: "iceCandidate", candidate: event.candidate })
        );
      }
    };

    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket?.send(
        JSON.stringify({
          type: "createOffer",
          sdp: pc.localDescription,
        })
      );
    };
    getCameraStreamAndSend(pc);
  };

  const getCameraStreamAndSend = (pc: RTCPeerConnection) => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      console.log("stream:", stream);
      setLocalVideoStream(stream); // Save local stream
      stream.getTracks().forEach((track) => {
        pc?.addTrack(track);
      });
    });
  };

  const startVideoReceiving = (pc: RTCPeerConnection) => {
    pc.ontrack = (event) => {
      const newStream = new MediaStream([event.track]);
      setRemoteVideoStream(newStream);
      console.log("onTrack event:", event);
    };
  };

  const captureAndVerifyImage = () => {
    setIsSnapShotClicked(true)
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas && video) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageUrl = canvas.toDataURL("image/jpeg");
        setSnapshot(imageUrl)
    }
    }
  };

  return (
    <div className="container">
      <h1 className="heading">Video Sender</h1>
      {!isStartVideoStreamClicked ? (
        <button
          onClick={initiateCon}
          className="flex gap-1 justify-start items-center bg-violet-800 text-white p-1 px-2 rounded-md cursor-pointer"
        >
          Start Video Stream
        </button>
      ) : null}
      <div className="mt-8">
        <h2 className="subheading">Video Streams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="video-card">
            <h3 className="font-semibold">Your Camera Preview</h3>
            <div className="video-placeholder">
              {localVideoStream && (
                <video
                  autoPlay
                  playsInline
                  className="video"
                  ref={(videoElement) => {
                    if (videoElement) {
                      videoElement.srcObject = localVideoStream;
                    }
                  }}
                />
              )}
            </div>
          </div>
          <div className="video-card">
            <h3 className="font-semibold">Receiver Video</h3>
            <div className="video-placeholder">
              {remoteVideoStream && (
                <div>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="video"
                    
                  />
                  <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
                </div>
              )}
            </div>
            {!isSnaphotClicked?<div>
              <button
                onClick={captureAndVerifyImage}
                className="flex gap-1 justify-start items-center bg-violet-800 text-white p-1 px-2 rounded-md cursor-pointer">
                <FiUserCheck />
                Verify Identity
              </button>
            </div>:null}
            {!responseCame && isSnaphotClicked?<Loading/>:null}
            {isSnaphotClicked && responseCame && ( isMatched ? <div>✅ Identity matched.</div> : <div>❌ Identity is not matched</div>)}
            </div>
        </div>
      </div>
    </div>
  );
}

export default Sender;
