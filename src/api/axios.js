// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:3000",
// });

// // attach token automatically
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// export default api;

// src/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

// attach token automatically

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token_v1"); // فقط المفتاح الجديد

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


export default api;
