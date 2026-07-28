import React, { useState, useEffect } from 'react';
import "./Player.css";
import BackArrowIcon from "../../assets/icons/whitecaretdown.png";
import { useNavigate, useParams } from "react-router-dom";
import TitleCard from '../../components/TitleCards/TitleCard';
import StarRating from '../../components/StarRating/StarRating';
import { useAuth } from '../../context/AuthContext.js';
import { recordWatched } from '../../firebase.js';
import { getMediaTitle } from '../../utils/media.js';

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MGEwOGMxZWNkMzM3ZDhjMDBiMWIyNTBhZWNmZDFjMCIsIm5iZiI6MTc1OTQxMDc1NC45OTUwMDAxLCJzdWIiOiI2OGRlN2E0MjI5NDc0MTAwNTE0MDVkY2UiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.n0QRdFcwHSPiU7QSj4ajBSU2FQ90SpZUqML-ylwp7iA"
  }
};

const Player = () => {
  const { id, mediaType = "movie" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videoData, setVideoData] = useState(null);
  const [movieInfo, setMovieInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setVideoData(null);

    const fetchVideo = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/${mediaType}/${id}/videos?language=en-US`,
          options
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          // Prefer an official trailer if one exists, otherwise take the first result
          const trailer = data.results.find(
            (v) => v.type === "Trailer" && v.site === "YouTube"
          );
          setVideoData(trailer || data.results[0]);
        } else {
          setError(`No video found for this ${mediaType === "tv" ? "show" : "movie"}.`);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch video data.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, mediaType]);

  // Powers the "Recommended For You" row on Home, and gives us a proper
  // title/name for the info panel - fire-and-forget, no need to block
  // rendering or show errors to the user for this one.
  useEffect(() => {
    if (!user || !id) return;

    fetch(`https://api.themoviedb.org/3/${mediaType}/${id}?language=en-US`, options)
      .then((res) => res.json())
      .then((info) => {
        setMovieInfo(info);
        recordWatched(user.uid, info, mediaType);
      })
      .catch((err) => console.error("Couldn't record watch history:", err));
  }, [user, id, mediaType]);

  return (
    <div className="player">
      <img
        src={BackArrowIcon}
        alt="Back"
        height={30}
        width={30}
        className='back-icon'
        onClick={() => navigate(-1)}
      />

      {loading && <div className="player-skeleton" />}

      {!loading && error && <div className="player-error">{error}</div>}

      {!loading && !error && videoData && (
        <>
          <div className='video-container'>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoData.key}`}
              title={videoData.name || "Movie Trailer"}
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>

          <div className='player-info'>
            <p><strong>Title:</strong> {movieInfo ? getMediaTitle(movieInfo) : videoData.name}</p>
            <p><strong>Type:</strong> {videoData.type}</p>
            {videoData.published_at && (
              <p><strong>Published:</strong> {videoData.published_at.slice(0, 10)}</p>
            )}
            <StarRating movieId={id} mediaType={mediaType} />
          </div>
        </>
      )}

      <div className='player-similar'>
        <TitleCard
          title={mediaType === "tv" ? "More Shows Like This" : "You Might Also Like"}
          category="popular"
          mediaType={mediaType}
        />
      </div>
    </div>
  );
};

export default Player;
