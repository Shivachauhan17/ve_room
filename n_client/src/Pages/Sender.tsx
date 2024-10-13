import { useEffect, useState } from "react";

function Sender() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [pc, setPC] = useState<RTCPeerConnection | null>(null);
    const [remoteVideoStream, setRemoteVideoStream] = useState<MediaStream | null>(null);
    const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:5000");
        setSocket(socket);
        socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'sender' }));
        };
    }, []);

    const initiateCon = async () => {
        if (!socket) {
            alert("Socket not found");
            return;
        }

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'createAnswer') {
                await pc?.setRemoteDescription(message.sdp);
            } else if (message.type === 'iceCandidate') {
                pc?.addIceCandidate(message.candidate);
            }
        };

        const pc = new RTCPeerConnection();
        startVideoReceiving(pc);
        setPC(pc);
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.send(JSON.stringify({ type: "iceCandidate", candidate: event.candidate }));
            }
        };

        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket?.send(JSON.stringify({
                type: 'createOffer',
                sdp: pc.localDescription
            }));
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

    return (
        <div className="container">
            <h1 className="heading">Video Sender</h1>
            <button 
                onClick={initiateCon} 
                className="btn"
            >
                Start Video Stream
            </button>
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
                                <video 
                                    autoPlay 
                                    playsInline 
                                    className="video"
                                    ref={(videoElement) => {
                                        if (videoElement) {
                                            videoElement.srcObject = remoteVideoStream;
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sender;
