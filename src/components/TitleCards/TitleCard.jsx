import React, { useState, useRef, useEffect } from 'react';
import "./TitleCard.css";
import { Link } from 'react-router-dom';

const TitleCard = ({ title, category }) => {
  const [apiData, setApiData] = useState([]);
  const cardsRef = useRef(null);

   const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MGEwOGMxZWNkMzM3ZDhjMDBiMWIyNTBhZWNmZDFjMCIsIm5iZiI6MTc1OTQxMDc1NC45OTUwMDAxLCJzdWIiOiI2OGRlN2E0MjI5NDc0MTAwNTE0MDVkY2UiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.n0QRdFcwHSPiU7QSj4ajBSU2FQ90SpZUqML-ylwp7iA'
    }
  };

  // Horizontal scroll on wheel
  const handleWheel = (e) => {
    e.preventDefault();
    if (cardsRef.current) {
      cardsRef.current.scrollLeft += e.deltaY;
    }
  };

  // Fetch API data
  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/movie/${category || "now_playing"}`, options)
      .then(res => res.json())
      .then(res => setApiData(res.results || []))
      .catch(err => console.error(err));
  }, [category, options]);

  return (
    <div className='titlecards'>
      <h2>{title || "More Videos"}</h2>
      <div className='card-list' ref={cardsRef} onWheel={handleWheel}>
        {Array.isArray(apiData) && apiData.map((card) => (
          <Link to={`/player/${card.id}`} className='card' key={card.id}>
            <img
              src={`https://image.tmdb.org/t/p/w500${card.backdrop_path}`}
              alt={card.original_title}
            />
            <div className='card-info'>
              <p>{card.original_language}</p>
              <p>{card.original_title}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TitleCard;
