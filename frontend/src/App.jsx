import React from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import Home from './components/Home/Home'
import Allproduct from './components/Allproduct/Allproduct'
import Layout from './components/Layout/Layout'
import Cart from './components/Cart/Cart'
import Checkout from './components/Checkout/Checkout'
import OrderSuccess from './components/OrderSuccess/OrderSuccess'
import ProductOverviews from './components/ProductOverviews/ProductOverviews'
import Contant from './components/Contant/Contant'
import Login from './components/auth/login'
import Register from './components/auth/register'
import ForgotPassword from './components/auth/forgot-password'


const router = createBrowserRouter([
  {
    path: '/', element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/allproduct', element: <Allproduct /> },
      { path: '/cart', element: <Cart /> },
      { path: '/checkout', element: <Checkout /> },
      { path: '/order-success/:orderId', element: <OrderSuccess /> },
      { path: '/detail', element: <ProductOverviews /> },
      { path: '/contact', element: <Contant /> },
    ]
  },
  {
    path: '/login',
    element: localStorage.getItem('tokenUser') ? <Navigate to="/" /> : <Login />
  },
  {
    path: '/register',
    element: localStorage.getItem('tokenUser') ? <Navigate to="/" /> : <Register />
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  },
])

const App = () => <RouterProvider router={router} />

export default App
