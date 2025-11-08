// import axios from 'axios';

// // ✅ In Vite, you do NOT need to import 'dotenv/config' —
// // Vite automatically loads variables from `.env` files at build time.

// const baseURL = "http://localhost:5000/api"

// const api = axios.create({
//   baseURL, // use the variable name correctly
// });

// // ✅ Attach token to every request if present
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers = config.headers ?? {};
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default api;


import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  console.error('❌ VITE_API_URL is not defined in .env');
}

const api = axios.create({ baseURL });

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('scfmp_token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;



