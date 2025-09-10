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
import Profile from './components/User/pages/Profilepage.jsx'
import Home from './components/User/pages/Home.jsx'
import History from './components/User/pages/History.jsx'
import Ordering from './components/User/pages/Ordering.jsx'

//Service Provider Kaew
import Main from './components/User/User Main.jsx'

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
    path: "Profile",
    element: <Profile />
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
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
