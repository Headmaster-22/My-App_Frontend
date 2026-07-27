import React, { useEffect, useState } from 'react';
import "./StarRating.css";
import { useAuth } from '../../context/AuthContext.js';
import { submitRating, getUserRating } from '../../firebase.js';

const StarRating = ({ movieId }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !movieId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getUserRating(user.uid, movieId)
      .then(setRating)
      .finally(() => setLoading(false));
  }, [user, movieId]);

  if (!user) return null; // only signed-in users can rate
  if (loading) return <div className="star-rating star-rating-loading" />;

  const handleRate = (value) => {
    setRating(value); // optimistic update
    submitRating(user.uid, movieId, value).catch(() => {
      // revert on failure
      getUserRating(user.uid, movieId).then(setRating);
    });
  };

  return (
    <div className="star-rating">
      <span className="star-rating-label">
        {rating ? "Your rating:" : "Rate this:"}
      </span>
      {[1, 2, 3, 4, 5].map((value) => (
        <span
          key={value}
          className={`star ${value <= (hovered || rating) ? "filled" : ""}`}
          onMouseEnter={() => setHovered(value)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => handleRate(value)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
