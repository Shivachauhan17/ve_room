import { Link, } from "react-router-dom";
import logo from '../assets/images/logo.png'
import api from "../axios/instance";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate=useNavigate()
    const email=localStorage.getItem("email")
    const name=localStorage.getItem("name")

    const logout=async()=>{
            await api.post('/logout')
                .then((result)=>{
                    if(result.status===200){
                        localStorage.setItem("email","")
                        localStorage.setItem("name","")
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: 'Logged Out Successfully.',
                        });
                        setTimeout(()=>{
                            navigate('/')
                        },1000)
                    }
                })
            .catch((e)=>{
                console.log(e)
                Swal.fire({
                    icon: 'warning',
                    title: 'Warning!',
                    text: 'Please send the correct inputs.',
                    confirmButtonText: 'OK',
                });
            })

    }
    
    return (
    <div className='text-black font-semibold   flex flex-row justify-start items-center  '>
    <div className="flex flex-row justify-between items-center w-[100%]">

        <div className="flex flex-row justify-start items-center gap-[2px] ">
            <div  >
                <img className="h-12 sm:h-16 rounded-full" src={logo} alt="ve_room Logo"/>
            </div>
        </div>
        
        <ul className=" flex flex-row justify-end items-center gap-4 pr-4 lg:pr-16 sm:gap-8 lg:gap-20">
            <li  className=""><Link to={"/"}  className="">Home</Link></li>
            { email && name ?<li  className="">
                <button onClick={()=>{logout()}} className="border-[1px] border-red-800 text-red-800 rounded-md p-2 py-1 hover:text-white hover:bg-violet-800">LogOut</button>
            </li>:null}
            {name ?<li><div className="text-[12px] font-normal">Logged in as  <br/>{name}</div></li>:null}
            {!email && !name ?<li  className=""><Link to={"/LoginPage"}  className="">
                <button className="border-[1px] border-green-600 text-green-600 rounded-md p-2 py-1 hover:text-white hover:bg-green-600">LogIn</button>
            </Link></li>:null}
            {!email && !name ?<li  className=""><Link to={"/SignUpPage"}  className="">
                <button className="border-[1px] border-violet-800 text-violet-800 rounded-md p-2 py-1 hover:text-white hover:bg-violet-800">Signup</button>
            </Link></li>:null}

        </ul>
        
    </div>
    </div>)
}
export default Navbar;