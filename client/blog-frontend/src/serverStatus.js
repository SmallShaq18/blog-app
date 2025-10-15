import React from "react";
import { useState, useEffect } from "react";
import API from "./api";

export default function useServerStatus() {
  const [serverUp, setServerUp] = useState(true);

  useEffect(() => {
    const checkServer = async () => {
      try {
        await API.get("/posts/ping"); // you can create a simple /ping route in backend
        setServerUp(true);
      } catch (err) {
        console.error("Server unreachable", err);
        setServerUp(false);
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 10000); // check every 10s
    return () => clearInterval(interval);
  }, []);

  return serverUp;
}