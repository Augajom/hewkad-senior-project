// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('https://hewkad.com:8443/me', {
          withCredentials: true 
        });
        
        const userData = response.data;
        console.log("User data from /me:", userData); 

        setUser({
          id: userData.id, 
          name: userData.fullName || "User",
          picture: userData.picture || null
        });

      } catch (error) {
        console.error("Not authenticated:", error.response?.data?.message || error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
};