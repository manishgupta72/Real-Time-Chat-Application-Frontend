import React from 'react'
import { Routes,Route } from 'react-router'
import App from '../App'
import ChatPage from '../pages/ChatPage'

const AppRoutes = () => {
  return (
   
    <Routes>
        <Route path="/" element={<App/>} />
        <Route path="/chat" element={<ChatPage/> } />
    </Routes>
  )
}

export default AppRoutes