import './App.css'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import UserPage from './pages/UserPage'
import { Toaster } from 'react-hot-toast'
import { useAuthContext } from './context/authContext'

import { LoadingProvider } from "./context/LoadingContext";
import LoadingScreen from "./components/LoadingScreen";
import OrderPage from './pages/OrderPage'
import BottomNavBar from "./components/BottomNavBar";

function App() {
  const { isAuth } = useAuthContext();
  return (
    // <LoginPage />
    // <SignUpPage />
    <LoadingProvider>
      <>
        <Toaster />
        <Router>
          <div className="pb-20 sm:pb-0">
            <Routes>
              <Route path="/login" element={isAuth ? <Navigate to="/" /> : <LoginPage />} />
              <Route path="/signUp" element={isAuth ? <Navigate to="/" /> : <SignUpPage />} />
              <Route path="/" element={isAuth ? <UserPage /> : <Navigate to="/login" />} />
              <Route path="/your-order" element={isAuth ? <OrderPage /> : <Navigate to="/login" />} />
            </Routes>
          </div>
          {isAuth? <BottomNavBar />: null}
        </Router>
        <LoadingScreen />
      </>
    </LoadingProvider>
    // <>
    //   <Router>
    //     <UserPage />
    //     <BottomNavBar />
    //     {/* <div className="h-screen flex justify-center items-center bg-gray-900">
    //       <Navigation />
    //     </div> */}
    //   </Router>
    // </>
  )
}

export default App
