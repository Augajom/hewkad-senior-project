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
import ReportPage from './components/admin/menu/ReportPage.jsx'

//User Oomsin
import UserProfile from './components/User/pages/Profilepage.jsx'
import Home from './components/User/pages/Home.jsx'
import History from './components/User/pages/History.jsx'
import Ordering from './components/User/pages/Ordering.jsx'

//Service Provider Kaew
import Main from './components/serviceprovider/page/User Main.jsx'
import ServiceOrdering from './components/serviceprovider/page/orderingpage.jsx'
import ServiceHome from './components/serviceprovider/page/home.jsx'
import ServiceProfile from './components/serviceprovider/serviceProfile.jsx'
import SP_History from './components/serviceprovider/page/SP_History.jsx'
import Paymentpage from './components/serviceprovider/page/Paymentpage.jsx'
import UserChat from './components/User/pages/Chat.jsx';
import ServiceChat from './components/serviceprovider/components/Chat.jsx';

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
  {
    path: "Report",
    element: <ReportPage />
  },

  //User
  {
    path: "user/profile",
    element: <UserProfile />
  },
  {
    path: "user/home",
    element: <Home />
  },
  {
    path: "user/history",
    element: <History />
  },
  {
    path: "user/ordering",
    element: <Ordering />
  },
  {
    path: "user/chat",
    element: <UserChat />
  },
  // Service Provider
  {
    path: "service/main",
    element: <Main />
  },
  {
    path: "service/profile",
    element: <ServiceProfile />
  },
  {
    path: "service/history",
    element: <SP_History />
  },
  {
    path: "service/ordering",
    element: <ServiceOrdering />
  },
  {
    path: "service/home",
    element: <ServiceHome />
  },
  
  {
    path: "service/chat",
    element: <ServiceChat />
  },
  
  {
    path: "service/payment",
    element: <Paymentpage />
  },
])

// Validate Login, Token
import axios from "axios";
import { handleUnauthorized } from "./utils/handleUnauthorized";


axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const status = error.response.status;
      await handleUnauthorized(status);
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
