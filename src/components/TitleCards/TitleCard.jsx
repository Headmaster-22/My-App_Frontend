import React, { useState, useRef, useEffect } from 'react';
import "./TitleCard.css";
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { addToMyList, removeFromMyList } from '../../firebase.js';

const TMDB_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MGEwOGMxZWNkMzM3ZDhjMDBiMWIyNTBhZWNmZDFjMCIsIm5iZiI6MTc1OTQxMDc1NC45OTUwMDAxLCJzdWIiOiI2OGRlN2E0MjI5NDc0MTAwNTE0MDVkY2UiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.n0QRdFcwHSPiU7QSj4ajBSU2FQ90SpZUqML-ylwp7iA'
  }
};

// category -> TMDb "list" endpoints (popular, top_rated, now_playing, upcoming)
// genreId -> TMDb "discover" endpoint, for genre-based rows
const TitleCard = ({ title, category, genreId, recommendationsFor, staticItems, myListMode = false }) => {
  const [apiData, setApiData] = useState(staticItems || null);
  const [loading, setLoading] = useState(!staticItems);
  const cardsRef = useRef(null);
  const { user } = useAuth();

  const handleWheel = (e) => {
    if (cardsRef.current) {
      e.preventDefault();
      cardsRef.current.scrollLeft += e.deltaY;
    }
  };

  const scrollBy = (amount) => {
    cardsRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  };

  useEffect(() => {
    if (staticItems) {
      setApiData(staticItems);
      setLoading(false);
      return;
    }

    // If asked for recommendations but there's no seed movie yet (e.g. user
    // hasn't watched anything), skip the fetch instead of hitting a bad URL.
    if (recommendationsFor === null) {
      setApiData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const url = recommendationsFor
      ? `https://api.themoviedb.org/3/movie/${recommendationsFor}/recommendations?language=en-US`
      : genreId
      ? `https://api.themoviedb.org/3/discover/movie?with_genres=${genreId}&language=en-US`
      : `https://api.themoviedb.org/3/movie/${category || "now_playing"}`;

    fetch(url, TMDB_OPTIONS)
      .then(res => res.json())
      .then(res => setApiData(res.results || []))
      .catch(err => {
        console.error(err);
        setApiData([]);
      })
      .finally(() => setLoading(false));
  }, [category, genreId, recommendationsFor, staticItems]);

  const toggleMyList = (e, movie, currentlyIn) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (currentlyIn) {
      removeFromMyList(user.uid, movie);
    } else {
      addToMyList(user.uid, movie);
    }
  };

  if (!loading && (!apiData || apiData.length === 0)) {
    if (myListMode) {
      return (
        <div className='titlecards'>
          <h2>{title || "My List"}</h2>
          <p className='titlecards-empty'>Nothing here yet — hit the + on any title to save it.</p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className='titlecards'>
      <h2>{title || "More Videos"}</h2>

      <div className='card-list-wrapper'>
        <button className='scroll-btn left' onClick={() => scrollBy(-600)} aria-label="Scroll left">‹</button>

        <div className='card-list' ref={cardsRef} onWheel={handleWheel}>
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div className='card card-skeleton' key={i} />
            ))}

          {!loading && Array.isArray(apiData) && apiData.map((card) => {
            return (
              <Link to={`/player/${card.id}`} className='card' key={card.id}>
                {card.backdrop_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${card.backdrop_path}`}
                    alt={card.original_title}
                    loading="lazy"
                  />
                ) : (
                  <div className='card-noimg'>No image</div>
                )}

                {card.vote_average > 0 && (
                  <span className="card-rating">★ {card.vote_average.toFixed(1)}</span>
                )}

                {user && (
                  <button
                    className={myListMode ? "card-list-btn active" : "card-list-btn"}
                    onClick={(e) => toggleMyList(e, card, myListMode)}
                    title={myListMode ? "Remove from My List" : "Add to My List"}
                  >
                    {myListMode ? "−" : "+"}
                  </button>
                )}

                <div className='card-info'>
                  <p className='card-lang'>{card.original_language?.toUpperCase()}</p>
                  <p className='card-title'>{card.original_title || card.title}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <button className='scroll-btn right' onClick={() => scrollBy(600)} aria-label="Scroll right">›</button>
      </div>
    </div>
  );
};

export default TitleCard;
