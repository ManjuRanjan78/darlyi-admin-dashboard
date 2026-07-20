import axios from "axios";
import { BaseUrl } from "../BaseUrl";

const api = axios.create({
  baseURL: BaseUrl.baseurl,
  timeout: 15000,
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use((config) => {

    console.log("================================");
    console.log("URL:", config.url);

    const raw = localStorage.getItem("LiveStreamAdminDetails");

    console.log("RAW:", raw);

    const details = raw ? JSON.parse(raw) : null;

    console.log("PARSED:", details);

    console.log("TOKEN:", details?.token);

    if(details?.token){

        config.headers = config.headers || {};

        config.headers.Authorization =
            `Bearer ${details.token}`;

        console.log("JWT ATTACHED");
    }
    else{
        console.log("NO JWT FOUND");
    }

    console.log("================================");

    return config;
});

// Response interceptor to handle 401 Unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginEndpoint =
      error.config?.url?.includes("/admin/login-staff") ||
      error.config?.url?.includes("/admin/verify-staff");

    if (error.response && error.response.status === 401) {
      console.warn(`[MONITOR] Unauthorized 401 detected:
        Request URL: ${error.config?.url}
        Response Body:`, error.response?.data);

      if (!isLoginEndpoint) {
        localStorage.removeItem("LiveStreamAdminDetails");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
