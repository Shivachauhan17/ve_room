import { Link, } from "react-router-dom";
import logo from '../assets/images/logo.png'

const Navbar = () => {

   
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
            <li  className=""><Link to={"/LoginPage"}  className="">
                <button className="border-[1px] border-green-600 text-green-600 rounded-md p-2 py-1 hover:text-white hover:bg-green-600">LogIn</button>
            </Link></li>
            <li  className=""><Link to={"/SignUpPage"}  className="">
                <button className="border-[1px] border-violet-800 text-violet-800 rounded-md p-2 py-1 hover:text-white hover:bg-violet-800">Signup</button>
            </Link></li>

        </ul>
        
    </div>
    </div>)
}
export default Navbar;