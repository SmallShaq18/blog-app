import React, { createContext, useContext, useState } from "react";


const BookmarkContext = createContext();

export function useBookmarkContext() {
  return useContext(BookmarkContext);
}

export function BookmarkProvider({ children }) {
  
  const [bookmarkedPosts, setBookmarkedPosts] = useState({});
 
  

  const setBookmark = (postId, isBookmarked) => {
    setBookmarkedPosts(prev => ({
      ...prev,
      [postId]: isBookmarked,
    }));
  };

  

  return (
    <BookmarkContext.Provider value={{ bookmarkedPosts, setBookmark/*, loadingBookmarks*/ }}>
      {children}
    </BookmarkContext.Provider>
  );
}