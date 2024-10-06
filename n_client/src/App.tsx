import {Route,Routes,BrowserRouter} from "react-router-dom";
import Home from './Pages/Home' 
import CreateMeet from './Pages/CreateMeet'
// import JoinMeet from './Pages/JoinMeet' 
import LoginPage from './Pages/LoginPage' 
import SignUpPage from './Pages/SignUpPage' 
import Navbar from "./component/Navbar";
import Sender from "./Pages/Sender";
import Receiver from "./Pages/Receiver";

function App() {
  return (

    <div className="p-2 sm:p-4 w-[100vw] sm:text-[20px]  lg:text-[25px] text-[20px]">

  
    <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route  path='/' element={<Home/>} ></Route>
        <Route path="/sender/:code" element={<Sender />} />
        <Route path="/receiver" element={<Receiver />} />
        {/* <Route  path='/JoinMeet' element={<Lobby/>} ></Route> */}
        {/* <Route  path='/room/:roomID' element={<Room/>} ></Route> */}
        {/* <Route  path='/CreateMeet' element={<CreateMeet/>} ></Route> */}
        <Route  path='/LoginPage' element={<LoginPage/>} ></Route>
        <Route  path='/SignUpPage' element={<SignUpPage/>} ></Route>
        {/* <Route  path='/UserImage' element={<UserImages/>} ></Route>
        <Route  path='/UserAudio' element={<RecordAudio/>} ></Route> */}
      </Routes>
    </BrowserRouter>
    </div>
  )
}

export default App