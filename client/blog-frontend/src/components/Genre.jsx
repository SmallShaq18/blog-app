import { useState, useEffect } from "react";
import API from "../api";
import { Loader } from "lucide-react";

function Genre({ onSelect, selected }) {
  const [tags, setTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await API.get("/posts/tags/all");
        setTags(res.data);
      } catch (err) {
        console.error("Failed to fetch tags", err);
      } finally {
        setLoadingTags(false);
      }
    };
    fetchTags();
  }, []);


  return (
    <div className="mb-4">
      <h6 className="fw-bold mb-2">
        <i className="fas fa-film me-2 text-accent"></i>
        Browse by Genre
      </h6>

      {/* Scrollable pill bar */}
      {loadingTags ? (
        <div className="text-center my-3">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <p className="mt-2">Fetching tags...</p>
  </div>
) : (
      <div
        className="d-flex gap-2 pb-2"
        style={{
          overflowX: "auto",
          whiteSpace: "nowrap",
          //scrollbarWidth: "1px", // Firefox
        }}
      >
        {/* Hide scrollbar for Webkit (Chrome, Safari) 
        <style>
          {`
            div::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>*/}

        {/* Show All button */}
        <button
          onClick={() => onSelect("all")}
          className={`btn btn-sm rounded-pill ${
            selected === "all" ? "btn-primary" : "btn-outline-primary"
          }`}
        >
          🎬 Show All
        </button>

        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onSelect(tag)}
            className={`btn btn-sm rounded-pill text-capitalize ${
              selected === tag ? "btn-primary" : "btn-outline-primary"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      )
      }
    </div>
  );
}

export default Genre;


