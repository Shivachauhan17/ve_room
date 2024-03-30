import {Route,Routes,BrowserRouter} from "react-router-dom";
import { SocketProvider } from "./context/SocketProvider";

import Lobby from './screens/Lobby'
import RoomPage from "./screens/Room";


function App() {
  return (
    <BrowserRouter>
     <SocketProvider>
      <Routes>
        <Route path='/' element={<Lobby/>}/>
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
      </SocketProvider>
    </BrowserRouter>
  )
}

export default App