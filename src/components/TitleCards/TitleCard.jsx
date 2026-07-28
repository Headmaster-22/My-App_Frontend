import React, { useState, useRef, useEffect } from 'react';
import "./TitleCard.css";
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { addToMyList, removeFromMyList } from '../../firebase.js';
import { getMediaTitle } from '../../utils/media.js';

const TMDB_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MGEwOGMxZWNkMzM3ZDhjMDBiMWIyNTBhZWNmZDFjMCIsIm5iZiI6MTc1OTQxMDc1NC45OTUwMDAxLCJzdWIiOiI2OGRlN2E0MjI5NDc0MTAwNTE0MDVkY2UiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.n0QRdFcwHSPiU7QSj4ajBSU2FQ90SpZUqML-ylwp7iA'
  }
};

// mediaType: 'movie' (default) or 'tv' - changes which TMDb endpoints we hit
// category -> TMDb "list" endpoints (popular, top_rated, now_playing/airing_today, upcoming/on_the_air)
// genreId -> TMDb "discover" endpoint, for genre-based rows (movie and TV genre ids differ!)
const TitleCard = ({ title, category, genreId, recommendationsFor, mediaType = "movie", staticItems, myListMode = false }) => {
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
      ? `https://api.themoviedb.org/3/${mediaType}/${recommendationsFor}/recommendations?language=en-US`
      : genreId
      ? `https://api.themoviedb.org/3/discover/${mediaType}?with_genres=${genreId}&language=en-US`
      : `https://api.themoviedb.org/3/${mediaType}/${category || "popular"}?language=en-US`;

    fetch(url, TMDB_OPTIONS)
      .then(res => res.json())
      // List/discover results don't come back with media_type - tag them
      // ourselves so cards, My List, and ratings all know what they're
      // looking at without guessing later.
      .then(res => setApiData((res.results || []).map((item) => ({ ...item, media_type: mediaType }))))
      .catch(err => {
        console.error(err);
        setApiData([]);
      })
      .finally(() => setLoading(false));
  }, [category, genreId, recommendationsFor, mediaType, staticItems]);

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
            const cardType = card.media_type || mediaType;
            return (
              <Link to={`/player/${cardType}/${card.id}`} className='card' key={`${cardType}-${card.id}`}>
                {card.backdrop_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${card.backdrop_path}`}
                    alt={getMediaTitle(card)}
                    loading="lazy"
                  />
                ) : (
                  <div className='card-noimg'>No image</div>
                )}

                {card.vote_average > 0 && (
                  <span className="card-rating">★ {card.vote_average.toFixed(1)}</span>
                )}

                {cardType === "tv" && <span className="card-type-badge">TV</span>}

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
                  <p className='card-title'>{getMediaTitle(card)}</p>
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
