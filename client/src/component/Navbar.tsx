import '../Css/Navbar.css';
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
    const Navigate= useNavigate();

    // console.log(localStorage.getItem("authToken"))

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        // console.log("heyy");
        // Navigate to "/"
        Navigate("/LoginPage");
    }
    return (<div className='navbar-container'>
    <div>
        <header>

            <div className="logo">
            <div className="LogoImg"></div><div className="LogoTitle">UnityRoom</div>
            </div>
        
        <ul className="navbar">
            <Link to={"/"}  className="Link"><li  className="active">Home</li></Link>
            <Link to={"/"} className="Link"><li>About</li></Link>
            {/* <Link className="Link"><li>News</li></Link> */}
           
        </ul>
        {(localStorage.getItem("authToken")) ?
         <div className="authButton">
            
         <Link to={""}><button onClick={handleLogout} className="loginbutton signupbutton">Log Out</button></Link>

      </div>
      :
      <div className="authButton">
            
         <Link to={"/LoginPage"}><button className="loginbutton">LogIn</button></Link>
         <Link to={"/UserImage"}><button className="signupbutton">SignUp</button></Link>

      </div>

            }

{/* {(localStorage.getItem("authToken")) ? 
    <div className="midHomeButton yoo">

    <Link to={"/CreateMeet"}><button>Make-Room</button></Link>       
    <Link  to={"/JoinMeet"}><button className="midHomeButton2nd">Watch-Party</button></Link>
    </div>
    :
    <div  className="LoginRequestOnHomeMid yoo">
        <p>*Please  <span>Login</span> OR create a <span>new Account .</span> </p>
    </div>

    } */}
        

        </header>
    </div>
    </div>)
}
export default Navbar;