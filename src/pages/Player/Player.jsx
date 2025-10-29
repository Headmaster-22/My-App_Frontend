import React, { useState, useEffect } from 'react';
import "./Player.css";
import BackArrowIcon from "../../assets/icons/whitecaretdown.png";
import { useNavigate, useParams } from "react-router-dom";

const Player = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videoData, setVideoData] = useState(null);
  const [error, setError] = useState(null);

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MGEwOGMxZWNkMzM3ZDhjMDBiMWIyNTBhZWNmZDFjMCIsIm5iZiI6MTc1OTQxMDc1NC45OTUwMDAxLCJzdWIiOiI2OGRlN2E0MjI5NDc0MTAwNTE0MDVkY2UiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.n0QRdFcwHSPiU7QSj4ajBSU2FQ90SpZUqML-ylwp7iA"
    }
  };

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`, options);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setVideoData(data.results[0]);
        } else {
          setError("No video found for this movie.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch video data.");
      }
    };

    fetchVideo();
  }, [id]);

  if (error) {
    return <div className="player-error">{error}</div>;
  }

  if (!videoData) {
    return <div className="player-loading">Loading...</div>;
  }

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
        <p><strong>Published:</strong> {videoData.published_at?.slice(0, 10)}</p>
        <p><strong>Title:</strong> {videoData.name}</p>
        <p><strong>Type:</strong> {videoData.type}</p>
      </div>
    </div>
  );
};

export default Player;
