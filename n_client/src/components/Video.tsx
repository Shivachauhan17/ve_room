import React, { useEffect, useRef ,memo} from "react";

interface IVideoProps{
    person:string,
    stream:MediaStream | undefined |null
}

const Video=({person,stream}:IVideoProps)=>{
    const videoRef=useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
        }
      }, [videoRef, stream]);

    return(
        <div>
            <div>
                <h4>{person}</h4>
            </div>
            <div>
                <video
                ref={videoRef}
                autoPlay

                />
            </div>
        </div>
    )
}

export default memo(Video)