import axios from "axios";

export const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || "http://localhost:8080/api"
});

export const blogApi = axios.create({
  baseURL: import.meta.env.VITE_BLOG_API_URL || "http://localhost:8080/api"
});

let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

const attachToken = (instance) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

attachToken(authApi);
attachToken(blogApi);

const attachUnauthorizedResponse = (instance) => {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return Promise.reject(error);
    }
  );
};

attachUnauthorizedResponse(authApi);
attachUnauthorizedResponse(blogApi);
