import React from 'react'
import {Route,Routes,BrowserRouter} from "react-router-dom";
import MeetPage from './pages/MeetPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/meet/:roomId' element={<MeetPage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App