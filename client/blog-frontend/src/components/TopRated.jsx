import React, { useEffect, useState,  } from "react";
import { Card,  } from "react-bootstrap";
import { Link } from "react-router-dom";
import API from "../api";

export const TopRated = ({ userId, username }) => {
  const [topRated, setTopRated] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const fetchTopRated = async () => {
      try {
        const res = await API.get(`/users/${userId}/top-rated`);
        setTopRated(res.data);
      } catch (err) {
        console.error("Failed to fetch top rated:", err);
      }
    };
    fetchTopRated();
  }, [userId]);


  if (!userId) return null;

  if (topRated.length === 0) {
    return (
      <div className="d-flex">
        <div className="top-rated my-4">
          <h3 className="mb-3 text-capitalize">⭐ Top Rated by {username || "this user"}</h3>
          <h5>{username} has not rated anything yet</h5>
        </div>
      </div>
    )
  }

  return (
    <div className="d-flex">
    <div className="top-rated my-4">
      <h3 className="mb-3 text-capitalize">⭐ Top Rated by {username || "this user"}</h3>
      
      {/* Scrollable section for mobile */}
    <div
      className="d-lg-none"
      style={{
        width: "100vw",
        marginLeft: "calc(-40vw + 50%)", // Break out of container padding
        overflowX: "auto",
        overflowY: "hidden",
        //WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "1rem",
          paddingBottom: "0.5rem",
          paddingLeft: "1rem",
          paddingRight: "1rem",
        }}
      >
        {topRated.map((post) => (
          <Card 
            key={post._id} 
            className="shadow-sm border-0"
            style={{
              width: "85vw",
              flexShrink: 0,
            }}
          >
            <Card.Body>
              <Card.Title className="text-capitalize">{post.title}</Card.Title>
              <p>Rated {post.userRating}⭐</p>
              <Link
                className="text-decoration-none text-accent"
                to={`/posts/${post._id}`}
              >
                Enter The Story 🎭
              </Link>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>

      
      {/*Large Screens*/}
      <div className="d-none d-lg-block">
        {topRated.map((post) => (
          <div className="mb-5 " key={post._id}>
            <Card>
              <Card.Body>
                <Card.Title className="text-capitalize">{post.title}</Card.Title>
                <p>Rated {post.userRating}⭐</p>
                <Link className=" text-decoration-none text-accent" to={`/posts/${post._id}`}>Enter The Story 🎭</Link>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      

    </div>
    </div>
  );
};