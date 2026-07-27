import React, { useEffect, useRef, useState } from 'react';
import "./Navbar.css";
import icon from "../../assets/icons/icon.png";
import searchIcon from "../../assets/icons/Search.png";
import whiteNotificationBell from "../../assets/icons/whitenotificationbell.png";
import profileImage from "../../assets/icons/profileImage.jpg";
import whiteCaretDown from "../../assets/icons/whitecaretdown.png";
import { logOut } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const TMDB_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MGEwOGMxZWNkMzM3ZDhjMDBiMWIyNTBhZWNmZDFjMCIsIm5iZiI6MTc1OTQxMDc1NC45OTUwMDAxLCJzdWIiOiI2OGRlN2E0MjI5NDc0MTAwNTE0MDVkY2UiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.n0QRdFcwHSPiU7QSj4ajBSU2FQ90SpZUqML-ylwp7iA"
  }
};

const navLinks = ["Home", "TV Shows", "Movies", "New & Popular", "My List"];

const Navbar = () => {
  const navRef = useRef();
  const searchRef = useRef();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 80) {
        navRef.current.classList.add("nav__dark");
      } else {
        navRef.current.classList.remove("nav__dark");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Debounced search against TMDb
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    const timeout = setTimeout(() => {
      fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
        TMDB_OPTIONS
      )
        .then((res) => res.json())
        .then((data) => setResults((data.results || []).slice(0, 6)))
        .catch((err) => console.error(err))
        .finally(() => setSearching(false));
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToMovie = (id) => {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
    navigate(`/player/${id}`);
  };

  return (
    <nav className='navbar' ref={navRef}>
      <div className='navbar-left'>
        <img src={icon} alt="Logo" className="logo" />

        <ul className={mobileOpen ? "nav-links open" : "nav-links"}>
          {navLinks.map((link, index) => (
            <li key={index} onClick={() => setMobileOpen(false)}>{link}</li>
          ))}
        </ul>

        {/* Hamburger - mobile only */}
        <button
          className={mobileOpen ? "hamburger active" : "hamburger"}
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle navigation menu"
        >
          <span></span><span></span><span></span>
        </button>
      </div>

      <div className='navbar-right'>
        <div className='search-wrapper' ref={searchRef}>
          <img
            src={searchIcon}
            alt='Search'
            className='icons'
            onClick={() => setSearchOpen((o) => !o)}
          />
          <input
            type="text"
            className={searchOpen ? "search-input open" : "search-input"}
            placeholder="Titles, people, genres..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
          />

          {searchOpen && query.trim() && (
            <div className='search-dropdown'>
              {searching && <p className='search-status'>Searching...</p>}
              {!searching && results.length === 0 && (
                <p className='search-status'>No matches found.</p>
              )}
              {!searching && results.map((movie) => (
                <div
                  key={movie.id}
                  className='search-result'
                  onClick={() => goToMovie(movie.id)}
                >
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                      alt={movie.title}
                    />
                  ) : (
                    <div className='search-result-noimg' />
                  )}
                  <div>
                    <p className='search-result-title'>{movie.title || movie.original_title}</p>
                    <p className='search-result-year'>
                      {movie.release_date ? movie.release_date.slice(0, 4) : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <img src={whiteNotificationBell} alt='Notifications' className='icons' />
        <div className='navbar-profile'>
          <img src={profileImage} alt='Profile' className='profile' />
          <img src={whiteCaretDown} alt='Dropdown' className='caret' />
          <div className='dropdown'>
            <p onClick={logOut}>Sign Out</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
