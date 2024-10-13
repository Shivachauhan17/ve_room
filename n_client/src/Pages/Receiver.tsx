import React, { useEffect, useState } from 'react';

function Receiver() {
    const [remoteVideoStream, setRemoteVideoStream] = useState<MediaStream | null>(null);
    const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:5000');
        socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'receiver' }));
        };
        startReceiving(socket);
    }, []);

    function startReceiving(socket: WebSocket) {
        const pc = new RTCPeerConnection();
        
        pc.ontrack = (event) => {
            const newStream = new MediaStream([event.track]);
            setRemoteVideoStream(newStream);
        };

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
        };

        getCameraStreamAndSend(pc);
    }

    const getCameraStreamAndSend = (pc: RTCPeerConnection) => {
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            setLocalVideoStream(stream);
            stream.getTracks().forEach((track) => {
                pc.addTrack(track);
            });
        });
    };

    return (
        <div className="container">
            <h1 className="heading">Video Receiver</h1>
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
                        <h3 className="font-semibold">Sender Video</h3>
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

export default Receiver;
