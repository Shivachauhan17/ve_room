import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import * as socketIO from 'socket.io-client';
import { Socket } from "socket.io-client";
import { Button, Grid, Typography } from "@mui/material"
import { CentralizedCard } from "./CentralizedCard";

let pc = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  });


const MeetingPage=()=>{

    const [socket, setSocket] = useState<Socket | undefined>();
    const [meetingJoined, setMeetingJoined] = useState(false);
    const [videoStream, setVideoStream] = useState<MediaStream | undefined>();
    const [remoteVideoStream, setRemoteVideoStream] = useState<MediaStream|undefined>();

    const params = useParams();
    const roomId = params.roomId;

    useEffect(() => {
      const s = socketIO.connect("http://localhost:3001");
      s.on("connect", () => {
        setSocket(s);
        s.emit("join", {
          roomId,
        });

        // window.navigator.mediaDevices
        //   .getUserMedia({
        //     video: true,
        //   })
        //   .then(async (stream) => {
        //     setVideoStream(stream);
        //   });

        // s.on("localDescription", async ({ description }) => {
        //   // Receiving video -
        //   console.log({ description });
        //   pc.setRemoteDescription(description);
        //   pc.ontrack = (e) => {
        //     setRemoteVideoStream(new MediaStream([e.track]));
        //   };

        //   s.on("iceCandidate", ({ candidate }) => {
        //     pc.addIceCandidate(candidate);
        //   });

        //   pc.onicecandidate = ({ candidate }) => {
        //     s.emit("iceCandidateReply", { candidate });
        //   };
        //   await pc.setLocalDescription(await pc.createAnswer());
        //   s.emit("remoteDescription", { description: pc.localDescription });
        // });
        //   s.on("remoteDescription", async ({ description }) => {
        //     // Receiving video -
        //     console.log({ description });
        //     pc.setRemoteDescription(description);
        //     pc.ontrack = (e) => {
        //       setRemoteVideoStream(new MediaStream([e.track]));
        //     };

        //     s.on("iceCandidate", ({ candidate }) => {
        //       pc.addIceCandidate(candidate);
        //     });

        //     pc.onicecandidate = ({ candidate }) => {
        //       s.emit("iceCandidateReply", { candidate });
        //     };

         
        //     //s.emit("remoteDescription", { description: pc.localDescription });
        //   });
      });
    }, []);



    if(!videoStream){
       return <div>
        ...loading
        </div>
    }

    if(!meetingJoined){
        return(
            <div style={{minHeight: "100vh",}}>
                <CentralizedCard>
                    <div>
                        <Typography textAlign={"center"} variant="h5">
                            hi welcome to the meeting {roomId}.
                        </Typography>
                    </div>
                    <br/>
                    <div style={{display: "flex", justifyContent: "center"}}>
                        <Button
                            // onClick={async()=>{
                            //     pc.onicecandidate=({candidate})=>{
                            //         socket?.emit("iceCandidate",{candidate})
                            //     }

                            //     pc.addTrack()
                            // }}
                        >
                            Join Meeting
                        </Button>
                    </div>
                </CentralizedCard>
            </div>
        )
    }
}

export default MeetingPage