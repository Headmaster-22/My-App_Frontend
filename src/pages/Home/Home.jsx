import React, { useEffect, useState } from 'react';
import "./Home.css";
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import playIcon from '../../assets/icons/playIcon.png';
import infoIcon from '../../assets/icons/InfoIcon.png';
import TitleCard from '../../components/TitleCards/TitleCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { subscribeToMyList, getLastWatched } from '../../firebase.js';

const TMDB_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MGEwOGMxZWNkMzM3ZDhjMDBiMWIyNTBhZWNmZDFjMCIsIm5iZiI6MTc1OTQxMDc1NC45OTUwMDAxLCJzdWIiOiI2OGRlN2E0MjI5NDc0MTAwNTE0MDVkY2UiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.n0QRdFcwHSPiU7QSj4ajBSU2FQ90SpZUqML-ylwp7iA'
  }
};

// TMDb genre ids for our extra rows
const GENRES = [
  { title: "Action", id: 28 },
  { title: "Comedy", id: 35 },
  { title: "Horror", id: 27 },
];

const Home = () => {
  const [hero, setHero] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myList, setMyList] = useState([]);
  const [myListLoading, setMyListLoading] = useState(true);
  // null = "not loaded yet or nothing watched" - TitleCard skips the fetch until this resolves
  const [lastWatchedId, setLastWatchedId] = useState(null);

  // Pull a featured movie for the hero banner instead of a static image
  useEffect(() => {
    fetch("https://api.themoviedb.org/3/movie/popular?language=en-US&page=1", TMDB_OPTIONS)
      .then((res) => res.json())
      .then((data) => {
        if (data.results && data.results.length > 0) {
          // pick from the first few so the hero varies a bit across loads
          const pick = data.results[Math.floor(Math.random() * Math.min(5, data.results.length))];
          setHero(pick);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Real-time: fires immediately with the current list, then again on every
  // change (from this tab or any other) — no manual refresh needed.
  useEffect(() => {
    if (!user) {
      setMyList([]);
      setMyListLoading(false);
      return;
    }
    setMyListLoading(true);
    const unsubscribe = subscribeToMyList(user.uid, (list) => {
      setMyList(list);
      setMyListLoading(false);
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLastWatchedId(null);
      return;
    }
    getLastWatched(user.uid).then((last) => setLastWatchedId(last?.id ?? null));
  }, [user]);

  return (
    <div className='home'>
      <Navbar />

      {/* Hero Section */}
      <section
        className='hero'
        style={hero?.backdrop_path ? {
          backgroundImage: `url(https://image.tmdb.org/t/p/original${hero.backdrop_path})`
        } : undefined}
      >
        <div className='hero-overlay'>
          <h1>{hero ? (hero.title || hero.original_title) : "Welcome to MY APP"}</h1>
          <p className='hero-description'>
            {hero
              ? (hero.overview?.length > 220 ? hero.overview.slice(0, 220) + "…" : hero.overview)
              : "This is a simple React application demonstrating components, routing, and Firebase auth alongside the TMDb API. Explore the features and enjoy your stay!"}
          </p>

          <div className='hero-btns'>
            <button
              className='btn'
              onClick={() => hero && navigate(`/player/${hero.id}`)}
              disabled={!hero}
            >
              <img src={playIcon} alt="Play" /> Play Trailer
            </button>
            <button
              className='btn dark-btn'
              onClick={() => hero && navigate(`/player/${hero.id}`)}
              disabled={!hero}
            >
              <img src={infoIcon} alt="Info" /> More Info
            </button>
          </div>
        </div>
      </section>

      {/* Rows */}
      <div className="more-cards">
        <TitleCard title="Trending Now" category="popular" />

        {user && !myListLoading && (
          <TitleCard title="My List" staticItems={myList} myListMode />
        )}

        {user && lastWatchedId && (
          <TitleCard title="Recommended For You" recommendationsFor={lastWatchedId} />
        )}

        <TitleCard title="Top Rated" category="top_rated" />
        <TitleCard title="Now Playing" category="now_playing" />
        <TitleCard title="Coming Soon" category="upcoming" />

        {GENRES.map((g) => (
          <TitleCard key={g.id} title={g.title} genreId={g.id} />
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default Home;
