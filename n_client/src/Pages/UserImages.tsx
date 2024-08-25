import { useState, useEffect, useRef, useCallback} from 'react';
import Navbar from '../component/Navbar';
import '../Css/userImage.css';
import { useNavigate } from 'react-router-dom';
import { useSelector,useDispatch } from 'react-redux';
import { setImage } from '../store/one_to_one/actions';
import { IrootState } from '../store/reducer';

const UserImages = () => {
    const dispatch=useDispatch()
   const [showSubmitButton, setShowSubmitButton] = useState(false);
    const videoRef = useRef<HTMLVideoElement|null>(null);
    const canvasRef = useRef<HTMLCanvasElement|null>(null);
    const navigate = useNavigate();
    const image=useSelector((state:IrootState)=>state.one2one.imageBase64)
    console.log(image)

    useEffect(() => {
        if (!videoRef.current || !canvasRef.current) return;

        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                if(videoRef.current)
                videoRef.current.srcObject = stream;
            })
            .catch((error) => {
                console.error('Error accessing user media:', error);
            });

        return () => {
            if (videoRef.current && videoRef.current.srcObject instanceof MediaStream) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const captureImage = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const context = canvasRef.current.getContext('2d');
        context?.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

        const imageDataURL = canvasRef.current.toDataURL('image/png');
        dispatch(setImage(imageDataURL));
        setShowSubmitButton(true); 
    };

    const handleSubmitImage = useCallback(()=>{
        if(image.length>0){
            navigate('/UserAudio')
        }
    },[image])

    return (
        <div className="Home">
            <Navbar />
            <div className="userimages">
                <h2>Take a Photo</h2>
                <div className="capturimagesection">
                    {!showSubmitButton && (
                        <div className="video-container">
                            <video ref={videoRef} autoPlay playsInline />
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                        </div>
                    )}
                    {image && (
                        <div className="image-preview-container">
                            <div className="image-preview-item">
                                <img src={image} alt="Captured Image" />
                            </div>
                        </div>
                    )}
                </div>
                {showSubmitButton && (
                    <div className=" submit-button-container">
                        <button onClick={handleSubmitImage}>Submit</button>
                    </div>
                )}
                {!showSubmitButton && (
                    <div className="captureimagebutton">
                        <button onClick={captureImage}>Capture Image</button>
                        {/* <RecordAudio image={image} /> */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserImages;