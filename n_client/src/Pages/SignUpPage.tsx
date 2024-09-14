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

    const captureImage=()=>{
        const canvas=canvasRef.current;
        const video=videoRef.current;

        if(canvas && video){
            const ctx=canvas.getContext("2d")
            if(ctx){
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;  
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Convert the canvas to a base64-encoded image
                const imageUrl = canvas.toDataURL('image/jpeg');
                setImages([...images, imageUrl]);
            }
        }
    }

    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        

        
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
            <div className="w-[100vw] flex flex-col justify-center items-center mt-4">
                <div className="w-[80%] flex justify-start text-[15px] font-gray-500">
                    <div>Click altleast 5 image of person for whom account being created</div>
                </div>
                <div className="w-[70vw] flex flex-col justify-between  items-start mt-4 sm:mt-40 gap-4">
                    <div className="overflow-hidden rounded-xl">
                        <video ref={videoRef} autoPlay />
                    </div>
                    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                    <div className="flex justify-start items-center flex-wrap  ">
                        <ul className="flex justify-start items-start flex-wrap">
                            {images.map((img, index) => (
                                <li key={index} className="m-2 ">
                                    <img className="w-[45px] h-[45px] rounded-md hover:w-[100px] hover:h-[100px]" src={img} alt={`Captured ${index}`} />
                                </li>
                            ))}
                        </ul>
                        <div className="flex flex-col justify-start items-start cursor-pointer ">
                            <div onClick={()=>{
                                if(images.length<5){
                                    captureImage();
                                }
                                }} className="flex justify-center items-center gap-1">
                                <div className="h-[45px] w-[45px] text-3xl font-bold text-gray-400 border-[1px] border-gray-300 text-center rounded-md bg-gray-100">
                                    +
                                </div>
                                <div className="text-[12px] font-bold text-gray-400">
                                Click
                            </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
                {images.length===5?<div className="mt-4">
                    <button onClick={handleSubmit} className="border-[1px] border-violet-800 text-violet-800 rounded-md p-2 py-1 hover:text-white hover:bg-violet-800">Submit</button>
                </div>:null}
            </div>
        );
    }

    return null; // This ensures a return statement is always provided
};

export default SignUpPage;
