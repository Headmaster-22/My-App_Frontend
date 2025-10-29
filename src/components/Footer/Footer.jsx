import React from 'react';
import "./Footer.css";
import facebookIcon from "../../assets/icons/faceBookIcon.png";
import xIcon from "../../assets/icons/X.png";
import instagramIcon from "../../assets/icons/instagram.png";
import youtubeIcon from "../../assets/icons/youtube.png";

const Footer = () => {
  const footerLinks = [
    "Video description", "Help Centre", "Gift Cards", "Media Centre",
    "Investor Relations", "Jobs", "Privacy", "Legal Notices",
    "Cookie Preferences", "Corporate Information", "Contact Us",
    "Speed Test", "Only on My App"
  ];

  const socialIcons = [
    { src: facebookIcon, alt: "Facebook" },
    { src: xIcon, alt: "X" },
    { src: instagramIcon, alt: "Instagram" },
    { src: youtubeIcon, alt: "YouTube" },
  ];

  return (
    <footer className='footer'>
      <div className='footer-icons'>
        {socialIcons.map((icon, index) => (
          <img key={index} src={icon.src} alt={icon.alt} />
        ))}
      </div>

      <ul className='footer-links'>
        {footerLinks.map((link, index) => (
          <li key={index}>{link}</li>
        ))}
      </ul>

      <p className='copyright-text'>
        &copy; 2025 My App <br />
        Powered by Headmaster Ltd.
      </p>
    </footer>
  );
};

export default Footer;
