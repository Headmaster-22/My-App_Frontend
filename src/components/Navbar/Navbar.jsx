import React, { useEffect, useRef } from 'react';
import "./Navbar.css";
import icon from "../../assets/icons/icon.png";
import searchIcon from "../../assets/icons/Search.png";
import whiteNotificationBell from "../../assets/icons/whitenotificationbell.png";
import profileImage from "../../assets/icons/profileImage.jpg";
import whiteCaretDown from "../../assets/icons/whitecaretdown.png";
import { logOut } from '../../firebase';

const Navbar = () => {
  const navRef = useRef();

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

  const navLinks = ["Home", "Courses", "Grammar", "Vocabulary", "Semantics", "New Videos"];

  return (
    <nav className='navbar' ref={navRef}>
      <div className='navbar-left'>
        <img src={icon} alt="Logo" className="logo" />
        <ul>
          {navLinks.map((link, index) => (
            <li key={index}>{link}</li>
          ))}
        </ul>
      </div>

      <div className='navbar-right'>
        <img src={searchIcon} alt='Search' className='icons' />
        <p>Children</p>
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
