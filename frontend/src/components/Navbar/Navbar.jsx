import React, { useState, useEffect } from "react";
import { IoHeartSharp } from "react-icons/io5";
import { RiShoppingBag4Fill } from "react-icons/ri";
import { IoSearchSharp } from "react-icons/io5";
import { TbMenu2 } from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";
import { MdAccountCircle } from "react-icons/md";
import { NavLink } from "react-router-dom";
const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const authenticated = !!localStorage.getItem('tokenUser');
    setIsAuth(authenticated);

    if (authenticated) {
      fetchProfile();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || '/api';
      const headers = { 'Content-Type': 'application/json' };
      // Backend uses cookie (httpOnly) for auth, so we send credentials: 'include'
      const res = await fetch(`${API_BASE}/user/profile`, { headers, credentials: 'include' });
      if (!res.ok) return;
      const json = await res.json();
      if (json && json.user && json.user.fullName) setUserName(json.user.fullName);
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleLogout = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || '/api';
      await fetch(`${API_BASE}/user/logout`, { method: 'GET', credentials: 'include' });
    } catch (err) {
      console.error('Logout failed', err);
    }
    // Clear client-side token and UI state
    localStorage.removeItem('tokenUser');
    setIsAuth(false);
    setUserName(null);
    navigate('/');
  };
  return (
    <header className="bg-white fixed top-0 right-0 left-0 ">
      <nav className="max-w-[1400px] mx-auto px-10 md:h-[14vh] h-[12vh] flex justify-between items-center ">
        <a href="/" className="text-3xl font-bold">
          {" "}
          Lo<span className="text-orange-500 uppercase">g</span>o{" "}
        </a>
        {/* danhmuc desktop*/}
        <ul className="md:flex items-center gap-x-16 hidden">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "font-semibold tracking-wider text-orange-500"
                  : "font-semibold tracking-wider text-zinc-800 hover:text-orange-500"
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/allproduct"
              className={({ isActive }) =>
                isActive
                  ? "font-semibold tracking-wider text-orange-500"
                  : "font-semibold tracking-wider text-zinc-800 hover:text-orange-500"
              }
            >
              Product
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive
                  ? "font-semibold tracking-wider text-orange-500"
                  : "font-semibold tracking-wider text-zinc-800 hover:text-orange-500"
              }
            >
              Contact Us
            </NavLink>
          </li>
        </ul>

        <div className="flex gap-x-5">
          <div className="md:flex p-1 border-2 border-orange-500 rounded-full hidden">
            <input
              type="text"
              name="text"
              id="text"
              placeholder="search.."
              autoComplete="off"
              className=" flex-1 h-[5vh] px-3 focus:outline-none"
            />

            <button className="flex items-center justify-center bg-linear-to-b from-red-400 to-orange-500 text-white w-10 h-10 rounded-full text-xl mt-[3px] mr-0.5">
              <IoSearchSharp />
            </button>
          </div>
          <a
            href=""
            className="flex items-center justify-center text-2xl text-zinc-800 "
          >
            <IoHeartSharp />
          </a>
          <Link
            to="/cart"
            className="flex items-center justify-center text-2xl text-zinc-800"
          >
            <RiShoppingBag4Fill />
          </Link>

          {/* Account Dropdown */}
          <div className="relative group">
            <button className="flex items-center justify-center text-2xl text-zinc-800 hover:text-orange-500">
              <MdAccountCircle />
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              {isAuth ? (
                <>
                  <div className="px-4 py-3 border-b">
                    {userName && <p className="text-sm text-gray-700">Xin chào <strong>{userName}</strong></p>}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 border-b block"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 block"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* danhmucmobile */}
          <a
            href=""
            className="text-zinc-800 text-3xl md:hidden "
            onClick={toggleMenu}
          >
            <TbMenu2 />
          </a>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
