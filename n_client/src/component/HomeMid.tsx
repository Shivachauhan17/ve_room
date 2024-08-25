import '../Css/HomeMid.css'
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const HomeMid=()=>{
    const navigate=useNavigate()

    return(<>
   <div className="flex flex-col justify-start items-start p-8 gap-8 text-2xl font-semibold sm:gap-12 sm:text-3xl sm:p-16 lg:text-4xl">

        <div className="">
            <div className='font-bold'>
                <h1>Bringing People <span className="font-extrabold text-violet-900">Together, </span><br/>Anywhere.</h1>
            </div>
            <p className='  font-normal'>Experience seamless communication with ironclad security. Connect, share screens, and innovate together, <br />hassle-free.</p>
            
        </div>

        {/* {(localStorage.getItem("authToken")) ? */}
        <div className="flex flex-row justify-start gap-2">

            <Link  to={"/CreateMeet"}><button className="border-[1px] border-violet-800 text-violet-800 rounded-md p-2 py-1 hover:text-white hover:bg-violet-800 text-[20px]">Make-Room</button></Link>    

            <Link  to={"/JoinMeet"}><button className="border-[1px] border-violet-800 text-violet-800 rounded-md p-2 py-1 hover:text-white hover:bg-violet-800 text-[20px]">Join-Room</button></Link>
        </div>
        {/* : */}
        <div  className="font-semibold">
            <p>*Please  <span className='text-violet-800 underline cursor-pointer' onClick={()=>{navigate('/LoginPage')}}>Login</span> OR <span className='text-violet-800 underline cursor-pointer' onClick={()=>{navigate('/SignUpPage')}}>create new Account .</span> </p>
        </div>

        {/* } */}
    

   </div>
    </>)
}
export default HomeMid;