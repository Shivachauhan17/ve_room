import {Route,Routes,BrowserRouter} from "react-router-dom";
import { SocketProvider } from "./context/SocketProvider";
import Home from './Pages/Home' 
import CreateMeet from './Pages/CreateMeet'
import JoinMeet from './Pages/JoinMeet' 
import LoginPage from './Pages/LoginPage' 
import SignUpPage from './Pages/SignUpPage' 
import UserImages from './Pages/UserImages';
import RecordAudio from './Pages/RecordAudio';

function App() {
  return (
    <BrowserRouter>
     <SocketProvider>
      <Routes>
        <Route  path='/' element={<Home/>} ></Route>
        <Route  path='/JoinMeet' element={<JoinMeet/>} ></Route>
        <Route  path='/CreateMeet' element={<CreateMeet/>} ></Route>
        <Route  path='/LoginPage' element={<LoginPage/>} ></Route>
        <Route  path='/SignUpPage' element={<SignUpPage/>} ></Route>
        <Route  path='/UserImage' element={<UserImages/>} ></Route>
        <Route  path='/UserAudio' element={<RecordAudio/>} ></Route>
      </Routes>
      </SocketProvider>
    </BrowserRouter>
  )
}

export default App