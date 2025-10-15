import React from "react";
import { toast } from "react-toastify";
import { Share } from "lucide-react";

const ShareButton = ({ post }) => {
  const handleShare = async (e) => {
    e.preventDefault();
    const url = `${window.location.origin}/posts/${post._id}`;
    const shareData = {
      title: post.title,
      text: post.content?.substring(0, 100) || "",
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      } catch {
        toast.error("Failed to copy link.");
      }
    } else {
      // Fallback for very old browsers
      window.prompt("Copy this link:", url);
    }
  };

  return (
    <button
      className="btn btn-outline-secondary btn-sm"
      title="Share"
      onClick={handleShare}
      style={{ border: "none", background: "none", padding: 0 }}
    >
      <Share />
    </button>
  );
};

export default ShareButton;