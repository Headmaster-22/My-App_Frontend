import React, { useEffect, useRef, useState } from 'react';
import "./Navbar.css";
import icon from "../../assets/icons/icon.png";
import searchIcon from "../../assets/icons/Search.png";
import whiteNotificationBell from "../../assets/icons/whitenotificationbell.png";
import profileImage from "../../assets/icons/profileImage.jpg";
import whiteCaretDown from "../../assets/icons/whitecaretdown.png";
import { logOut } from '../../firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMediaTitle, getMediaYear, isPlayableMedia } from '../../utils/media.js';

const TMDB_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MGEwOGMxZWNkMzM3ZDhjMDBiMWIyNTBhZWNmZDFjMCIsIm5iZiI6MTc1OTQxMDc1NC45OTUwMDAxLCJzdWIiOiI2OGRlN2E0MjI5NDc0MTAwNTE0MDVkY2UiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.n0QRdFcwHSPiU7QSj4ajBSU2FQ90SpZUqML-ylwp7iA"
  }
};

// Each link either scrolls to a section id on Home, or (hash: null) scrolls to top
const NAV_LINKS = [
  { label: "Home", hash: null },
  { label: "Trending", hash: "trending" },
  { label: "TV Shows", hash: "tv-shows" },
  { label: "Top Rated", hash: "top-rated" },
  { label: "My List", hash: "my-list" },
];

const Navbar = () => {
  const navRef = useRef();
  const searchRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

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
        `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
        TMDB_OPTIONS
      )
        .then((res) => res.json())
        .then((data) =>
          setResults((data.results || []).filter(isPlayableMedia).slice(0, 6))
        )
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

  const handleNavClick = (link) => {
    setMobileOpen(false);

    if (location.pathname !== "/") {
      // Not on Home (e.g. on the Player page) - navigate there with the hash,
      // Home's own effect picks up the hash and scrolls once it lands.
      navigate(link.hash ? `/#${link.hash}` : "/");
      return;
    }

    if (!link.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    document.getElementById(link.hash)?.scrollIntoView({ behavior: "smooth" });
  };

  const goToResult = (item) => {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
    navigate(`/player/${item.media_type}/${item.id}`);
  };

  return (
    <nav className='navbar' ref={navRef}>
      <div className='navbar-left'>
        <img src={icon} alt="Logo" className="logo" />

        <ul className={mobileOpen ? "nav-links open" : "nav-links"}>
          {NAV_LINKS.map((link) => (
            <li key={link.label} onClick={() => handleNavClick(link)}>{link.label}</li>
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
              {!searching && results.map((item) => (
                <div
                  key={`${item.media_type}-${item.id}`}
                  className='search-result'
                  onClick={() => goToResult(item)}
                >
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                      alt={getMediaTitle(item)}
                    />
                  ) : (
                    <div className='search-result-noimg' />
                  )}
                  <div>
                    <p className='search-result-title'>
                      {getMediaTitle(item)}
                      {item.media_type === "tv" && <span className='search-result-badge'>TV</span>}
                    </p>
                    <p className='search-result-year'>{getMediaYear(item)}</p>
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
