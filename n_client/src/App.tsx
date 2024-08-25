import {Route,Routes,BrowserRouter} from "react-router-dom";
import { SocketProvider } from "./context/SocketProvider";
import Home from './Pages/Home' 
import CreateMeet from './Pages/CreateMeet'
// import JoinMeet from './Pages/JoinMeet' 
import LoginPage from './Pages/LoginPage' 
import SignUpPage from './Pages/SignUpPage' 
import UserImages from './Pages/UserImages';
import RecordAudio from './Pages/RecordAudio';
import Lobby from "./screens/Lobby";
import Room from "./screens/Room";
import Navbar from "./component/Navbar";

function App() {
  return (

    <div className="p-2 sm:p-4 w-[100vw] sm:text-[20px]  lg:text-[25px] text-[20px]">

  
    <BrowserRouter>
     <SocketProvider>
      <Navbar/>
      <Routes>
        <Route  path='/' element={<Home/>} ></Route>
        <Route  path='/JoinMeet' element={<Lobby/>} ></Route>
        <Route  path='/room/:roomID' element={<Room/>} ></Route>
        <Route  path='/CreateMeet' element={<CreateMeet/>} ></Route>
        <Route  path='/LoginPage' element={<LoginPage/>} ></Route>
        <Route  path='/SignUpPage' element={<SignUpPage/>} ></Route>
        <Route  path='/UserImage' element={<UserImages/>} ></Route>
        <Route  path='/UserAudio' element={<RecordAudio/>} ></Route>
      </Routes>
      </SocketProvider>
    </BrowserRouter>
    </div>
  )
}

export default App