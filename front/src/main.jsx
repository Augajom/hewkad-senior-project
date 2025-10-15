import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './components/Login.jsx'
import Dashboard from './components/admin/menu/Dashboard.jsx'
import User from './components/admin/menu/User.jsx'
import Postlist from './components/admin/menu/Postlist.jsx'
import Payment from './components/admin/menu/Payment.jsx'
import Activity from './components/admin/menu/Activity.jsx'
import LoginAdmin from './components/admin/LoginAdmin.jsx'

//User Oomsin
import UserProfile from './components/User/pages/Profilepage.jsx'
import Home from './components/User/pages/Home.jsx'
import History from './components/User/pages/History.jsx'
import Ordering from './components/User/pages/Ordering.jsx'

//Service Provider Kaew
import Main from './components/serviceprovider/page/User Main.jsx'
import ServiceProfile from './components/serviceprovider/serviceProfile.jsx'
import SP_History from './components/serviceprovider/page/SP_History.jsx'
import Chat from './components/User/pages/chat.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "Admin",
    element: <LoginAdmin />,
  },
  {
    path: "Dashboard",
    element: <Dashboard />
  },
  {
    path: "User",
    element: <User />
  },
  {
    path: "Postlist",
    element: <Postlist />
  },
  {
    path: "Payment",
    element: <Payment />
  },
  {
    path: "Activity",
    element: <Activity />
  },
  //User
  {
    path: "user/profile",
    element: <UserProfile />
  },
  {
    path: "Home",
    element: <Home />
  },
  {
    path: "History",
    element: <History />
  },
  {
    path: "Ordering",
    element: <Ordering />
  },
  {
    path: "Main",
    element: <Main />
  },
  {
    path: "Chat",
    element: <Chat />
  },
  // Service Provider
  {
    path: "provider/profile",
    element: <ServiceProfile />
  },
  {
    path: "provider/history",
    element: <SP_History />
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
