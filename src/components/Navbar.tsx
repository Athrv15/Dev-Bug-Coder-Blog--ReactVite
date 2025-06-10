import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiSearch, FiMenu, FiX } from "react-icons/fi";
import Logo from "../assets/logo.png";

import { api, fetchNotifications } from "../api";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [user, setUser] = useState<{
    name: string;
    avatarUrl?: string;
    email?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  const isAdmin = user && user.email === adminEmail;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Search state
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Notification count state
  const [notificationCount, setNotificationCount] = useState(0);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkToken = async () => {
      setLoading(true); // <-- start loading
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        await api.get("/auth/validate");
        // If valid, set user from localStorage
        const userData = localStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          setUser(null);
        }
      } catch (err) {
        // If invalid, clear user and token
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
      setLoading(false); // <-- done loading
    };
    checkToken();
  }, [location]);

  // Fetch unread notification count
  useEffect(() => {
    if (user) {
      fetchNotifications().then((data) => {
        setNotificationCount(
          Array.isArray(data) ? data.filter((n) => !n.isRead).length : 0
        );
      });
    }
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Posts", path: "/posts" },
    ...(user ? [{ name: "Create Post", path: "/create-post" }] : []),
  ];

  useEffect(() => {
    setSearch("");
  }, [location]);

  // --- Search submit handler ---
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/posts?search=${encodeURIComponent(search.trim())}`);
      setIsMenuOpen(false);
      setSearch(""); // Clear the search bar after submit
    }
  };

  useEffect(() => {
    setDropdownOpen(false);
  }, [user]);

  if (loading) {
    return null; // or a spinner if you want
  }

  return (
    <>
      <nav className="bg-slate-200 shadow-xl fixed top-0 left-0 w-full z-50 px-4">
        <div className="container mx-auto flex items-center justify-between md:flex-row">
          {/* Logo */}
          <div className="flex items-start">
            <Link to="/" className="flex items-center">
              <img
                src={Logo}
                alt="Logo"
                className="h-24 w-auto hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>

          {/* Search Bar (functional) */}
          <div className="flex items-start">
            <form
              onSubmit={handleSearchSubmit}
              className="relative w-full max-w-lg"
              style={{ minWidth: 200 }}
            >
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts or tags..."
                className="search-input pl-10 pr-4 py-2 border-b-2 border-gray-300 focus:outline-none focus:border-blue-400 transition-colors w-full"
              />
              <button
                type="submit"
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                aria-label="Search"
                tabIndex={-1}
                style={{ background: "none", border: "none" }}
              >
                <FiSearch />
              </button>
            </form>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center justify-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-slate-700 font-courier text-pretty font-bold text-xl hover:text-blue-500 hover:scale-110 transition-transform duration-300"
              >
                {link.name}
              </Link>
            ))}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="text-slate-700 font-courier text-pretty font-bold text-xl hover:text-blue-500 hover:scale-110 transition-transform duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-slate-700 font-courier text-pretty font-bold text-xl hover:text-blue-500 hover:scale-110 transition-transform duration-300"
                >
                  Register
                </Link>
              </>
            )}
            {user && (
              <div className="relative ml-4" ref={dropdownRef}>
                <button
                  className="flex items-center gap-2 focus:outline-none"
                  onClick={() => setDropdownOpen((open) => !open)}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-400 bg-gray-200 flex items-center justify-center">
                    <img
                      src={
                        user.avatarUrl ||
                        `https://robohash.org/${user.name}.png?size=80x80`
                      }
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-slate-700 font-courier text-pretty font-bold text-xl hover:text-blue-500">
                    Welcome, {user.name.split(" ")[0]}
                  </span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-50 bg-slate-100 rounded shadow-lg z-50">
                    <Link
                      to="/notifications"
                      className="block w-full p-4 text-slate-700 font-courier text-pretty font-bold text-xl hover:bg-white hover:text-blue-500 relative"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Notifications
                      {notificationCount > 0 && (
                        <span className="absolute right-4 top-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                          {notificationCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/saved-posts"
                      className="block w-full p-4 text-slate-700 font-courier text-pretty font-bold text-xl hover:bg-white hover:text-blue-500"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Saved Posts
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/reports"
                        className="block w-full p-4 text-slate-700 font-courier text-pretty font-bold text-xl hover:bg-white hover:text-blue-500"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Admin Reports
                      </Link>
                    )}
                    <Link
                      to="/edit-profile"
                      className="block w-full p-4 text-slate-700 font-courier text-pretty font-bold text-xl hover:bg-white hover:text-blue-500"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Edit Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full p-4 text-slate-700 font-courier text-pretty font-bold text-xl hover:bg-white hover:text-blue-500"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Burger Menu for Small Screens */}
          <div className="flex items-center justify-end md:hidden ">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-500 focus:outline-none hover:scale-105 transition-transform duration-300"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Full-Screen Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-40 flex flex-col items-center justify-center text-white">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-5 right-5 text-white text-2xl"
          >
            <FiX />
          </button>
          {/* Mobile Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mb-8 w-3/4 flex"
            style={{ maxWidth: 400 }}
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts or tags..."
              className="px-3 py-2 rounded-l-lg border border-gray-300 text-black w-full"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 flex items-center"
              aria-label="Search"
            >
              <FiSearch />
            </button>
          </form>
          <div className="flex flex-col items-center space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-lg uppercase font-medium hover:text-blue-500 hover:scale-105 transition-transform duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="text-lg uppercase font-medium hover:text-blue-500 hover:scale-105 transition-transform duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-lg uppercase font-medium hover:text-blue-500 hover:scale-105 transition-transform duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
            {user && (
              <div className="flex flex-col items-center space-y-2 mt-4">
                <Link
                  to="/edit-profile"
                  className="block px-4 py-2 hover:bg-gray-100 text-black rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Edit Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-black rounded"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
