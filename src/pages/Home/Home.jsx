import React from 'react';
import "./Home.css";
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import BackgroundImage from '../../assets/icons/BackgroundImage.png';
import playIcon from '../../assets/icons/playIcon.png';
import infoIcon from '../../assets/icons/InfoIcon.png';
import TitleCard from '../../components/TitleCards/TitleCard';

const heroTitles = [
  { title: "Grammar" },
  { title: "Semantics" },
  { title: "Upcoming..." },
  { title: "Topics for You" }
];

const HeroButtons = () => (
  <div className='hero-btns'>
    <button className='btn'>
      <img src={playIcon} alt="Play" /> Play Video
    </button>
    <button className='btn dark-btn'>
      <img src={infoIcon} alt="Info" /> More Videos
    </button>
  </div>
);

const Home = () => {
  return (
    <div className='home'>
      <Navbar />

      {/* Hero Section */}
      <section className='hero'>
        <div className='hero-overlay'>
          <h1>Welcome to MY APP</h1>
          <p className='hero-description'>
            This is a simple React application that demonstrates the use of components, routing, and styling.
            <br />
            Explore the features and enjoy your stay!
          </p>

          <HeroButtons />

          {/* Featured Title Card */}
          <TitleCard />
        </div>
      </section>

      {/* Additional Cards */}
      <div className="more-cards">
        {heroTitles.map(({ title }) => (
          <TitleCard key={title} title={title} />
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default Home;
