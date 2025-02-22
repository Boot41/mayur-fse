import axios from "axios";

let refresh = false;

axios.interceptors.response.use(
  (resp) => resp, // Pass through the response if no error
  async (error) => {
    if (error.response.status === 401 && !refresh) {
      refresh = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        console.error('No refresh token found');
        refresh=false;
        return Promise.reject(error);
      }
      
      try {
        // Request a new access token using the refresh token
        const response = await axios.post(
          'http://localhost:8000/token/refresh/',
          { refresh: refreshToken },
          { 
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true // Ensure credentials (cookies) are included if needed
          }
        );
        
        if (response.status === 200) {
          const newAccessToken = response.data.access;
          localStorage.setItem("access_token", newAccessToken);
          
          // Update the default axios headers
          axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
          
          // Retry the failed request with the new token
          error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
          
          return axios(error.config);
        }
      } catch (err) {
        console.error('Refresh token request failed:', err);
        return Promise.reject(error);
      } finally {
        refresh = false; // Reset the flag after the refresh is done
      }
    }

    // If the error wasn't a 401 or refresh failed, return the error
    refresh = false;
    return Promise.reject(error);
  }
);
