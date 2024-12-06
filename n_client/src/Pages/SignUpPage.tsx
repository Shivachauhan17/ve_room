import React, { useState, useRef, useEffect } from "react"; 
import api from "../axios/instance";
import '../Css/Home.css'
import '../Css/LoginPage.css'
import { CiMail, CiUser, CiLock } from "react-icons/ci";
import { MdOutlineLocalPhone } from "react-icons/md";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
    const navigate=useNavigate()
    // const image=useSelector((state:IrootState)=>state.one2one.imageBase64)
    // const audio=useSelector((state:IrootState)=>state.one2one.audioBase64)
    const [page, setPage] = useState(1);
    const [credentials, setCredentials] = useState({ name: "", email: "", mobileNumber: "", password: "" });
    const [isEmailRight, setISEmailRight] = useState(true);
    const [isMobileRight, setISMobileRight] = useState(true);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [images, setImages] = useState<string[]>([]);
    // const Navigate = useNavigate();
    const [onUpload, setonUpload] = useState(false);
    const [uploaded, setUploaded] = useState(false);

    
    

    useEffect(() => {
        const getCameraStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                console.log(stream);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error(err);
            }
        };
        
        if (page === 2) {
            getCameraStream();
        }
    
        // Clean up the stream on component unmount
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                const tracks = stream.getTracks();
                tracks.forEach((track: MediaStreamTrack) => track.stop());
            }
        };
    }, [page]);


    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        try{

            setonUpload(true);
            api.post<{email:string, name:string}>('/register', {...credentials,image:images[0]}, { withCredentials: true })
                .then((response)=>{
                    if (response.status === 200) {
                        for(let i=1;i<5;i++){
                            try{
                                api.post('/uploadImagesTo', {email:response.data.email,imgNo:(i+1).toString(),image:images[i]}, { withCredentials: true })
                            }
                            catch(e){
                                continue
                            }
                        }
                        localStorage.setItem('email', response.data.email);
                        localStorage.setItem('name', response.data.name);
                        setonUpload(false);
                        setUploaded(true);
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: 'Your operation has been completed successfully.',
                        });
                        setTimeout(()=>{
                            navigate('/')
                        },1000)
                    }
                })
                .catch((response)=>{
                    if (response.status === 400) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Warning!',
                            text: 'Please send the correct inputs.',
                            confirmButtonText: 'OK',
                        });
                    } else if (response.status === 401) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Warning!',
                            text: 'The account you are trying to create already exists.',
                            confirmButtonText: 'OK',
                        });
                    } else if (response.status === 500) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: 'Some error occurred on the server side.',
                            confirmButtonText: 'OK',
                        });
                    }
                })
            }
            catch(e){
                console.log(e)
            }
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, [event.target.name]: event.target.value });
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(e.target.value)) {
            setISEmailRight(true);
            setCredentials({ ...credentials, email: e.target.value });
        } else {
            setISEmailRight(false);
            setCredentials({ ...credentials, email: e.target.value });
        }
    };

    const handleMobileNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (/^\d{10}$/.test(e.target.value)) {
            setISMobileRight(true);
            setCredentials({ ...credentials, mobileNumber: e.target.value });
        } else {
            setISMobileRight(false);
            setCredentials({ ...credentials, mobileNumber: e.target.value });
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, password: e.target.value });
    };


    useEffect(() => {
        const getCameraStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error(err);
            }
        };

        getCameraStream();

       
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                const tracks = stream.getTracks();
                tracks.forEach((track: MediaStreamTrack) => track.stop());
            }
        };

    }, []);

    const captureImage = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        if (canvas && video) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const imageUrl = canvas.toDataURL('image/jpeg');
                setImages((prevImages) => [...prevImages, imageUrl]);
            }
        }
    };

    const removeImage = (index:number) => {
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    if (page === 1) {
        return (
            <div className="w-full flex flex-row justify-center items-start mt-20 sm:mt-40">
                <div className="border-[1px] border-gray-300 p-8 rounded-lg sm:p-16">
                    <div className="flex flex-col gap-4 justify-start items-center sm:gap-8">
                        <div className="font-bold text-violet-800">
                            <h2>SignUp</h2>
                        </div>
                        <div className="flex justify-start items-center gap-2">
                            <div className="text-2xl sm:text-3xl"><CiUser /></div>
                            <input
                                className="p-1 h-[40px] sm:h-[45px] rounded-md bg-gray-100 border-[1px] border-gray-300 outline-none"
                                type="text"
                                name="name"
                                value={credentials.name}
                                onChange={handleNameChange}
                                id="name"
                                placeholder="Your Name"
                            />
                        </div>
                        <div>
                            <div className="flex justify-start items-center gap-2">
                                <div className="text-2xl sm:text-3xl"><CiMail /></div>
                                <input
                                    className="p-1 h-[40px] sm:h-[45px] rounded-md bg-gray-100 border-[1px] border-gray-300 outline-none"
                                    type="email"
                                    name="email"
                                    value={credentials.email}
                                    onChange={handleEmailChange}
                                    id="email"
                                    placeholder="Your Email"
                                />
                            </div>
                            {isEmailRight ? null : <p className="text-red-500 font-light text-sm">Enter Correct Email!</p>}
                        </div>
                        <div>
                            <div className="flex justify-start items-center gap-2">
                                <div className="text-2xl sm:text-3xl"><MdOutlineLocalPhone /></div>
                                <input
                                    className="p-1 h-[40px] sm:h-[45px] rounded-md bg-gray-100 border-[1px] border-gray-300 outline-none"
                                    type="number"
                                    name="mobileNumber"
                                    value={credentials.mobileNumber}
                                    onChange={handleMobileNoChange}
                                    id="number"
                                    placeholder="Mobile Number"
                                />
                            </div>
                            {isMobileRight ? null : <p className="text-red-500 font-light text-sm">Enter Correct No.!</p>}
                        </div>
                        <div className="flex justify-start items-center gap-2">
                            <div className="text-2xl sm:text-3xl"><CiLock /></div>
                            <input
                                className="p-1 h-[40px] sm:h-[45px] rounded-md bg-gray-100 border-[1px] border-gray-300 outline-none"
                                type="password"
                                name="password"
                                value={credentials.password}
                                onChange={handlePasswordChange}
                                id="password"
                                placeholder="Password"
                            />
                        </div>
                        <div>
                            {credentials.email.length > 0 && isEmailRight && credentials.name.length > 0 && credentials.mobileNumber && isMobileRight && credentials.password.length > 0
                                ? <button onClick={() => { setPage(2) }} className="text-purple-800">Next &gt;&gt;</button>
                                : <button className="text-gray-400 cursor-default">Next &gt;&gt;</button>}
                        </div>
                    </div>
                </div>
            </div>
        );
    } else if (page === 2) {
        return (
            <div className="image-capture-container">
            <h2 className="image-capture-title">Upload Store Photos</h2>
            <p className="image-capture-instructions">Click 5 images of YourSelf.</p>
            <div className="video-container">
                <div className="relative">
                    <video ref={videoRef} autoPlay className="video" />
                    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                </div>
                <div className="flex flex-col items-center p-4">
                    <ul className="image-preview">
                        {images.map((img, index) => (
                            <li key={index} className="image-item relative">
                                <img className="image" src={img} alt={`Captured ${index}`} />
                                <button
                                    onClick={() => removeImage(index)}
                                    className="remove-button absolute top-2 right-2"
                                    aria-label="Remove image"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        fill="red"
                                        className="bi bi-x-circle"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.5 11.5a.5.5 0 0 1-.707 0L8 9.707 5.207 12.5a.5.5 0 1 1-.707-.707L7.293 9.5 4.5 6.707a.5.5 0 0 1 .707-.707L8 8.293l2.793-2.793a.5.5 0 0 1 .707.707L8.707 9.5l2.793 2.793a.5.5 0 0 1 0 .707z"/>
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                    {images.length !== 5 && (
                        <div className="flex flex-col items-center">
                            <button
                                onClick={() => {
                                    if (images.length < 5) {
                                        captureImage();
                                    }
                                }}
                                className="capture-button"
                            >
                                <span className="text-2xl font-bold">+</span>
                            </button>
                            <span className="capture-button-label">Click to Capture</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-4">
                {images.length === 5 && (
                    <div className="mt-4">
                        {onUpload ? (
                            <div className="uploading-animation">Uploading...</div>
                        ) : uploaded ? (
                            <span>Uploaded</span>
                        ) : (
                            <button onClick={handleSubmit} className="submit-button">
                                Submit
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
        );
    }

    return null; // This ensures a return statement is always provided
};

export default SignUpPage;
