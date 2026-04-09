import axios from "axios";

const apiClient = axios.create({
  // baseURL: "http://103.133.215.182:8081/procurement_java",
  baseURL: "http://localhost:8080",

  // baseURL: "http://192.168.1.6:8080",
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const auth = JSON.parse(localStorage.getItem("auth"));

    const noAuthRoutes = [
      "/auth/login",
      "/vendor/register",
      "/auth/changepassword", 
    ];

    const isNoAuthRoute = noAuthRoutes.some((url) =>
      config.url?.includes(url)
    );

    if (!isNoAuthRoute && auth?.token) {
      config.headers.Authorization = `${auth.tokenType} ${auth.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {

    if (!error.response) {
      return Promise.reject({
        message: "Server not reachable. Please try again later.",
        status: 0,
      });
    }

    const { status, data } = error.response;

    if (status === 401) {
      const auth = JSON.parse(localStorage.getItem("auth"));

      if (auth?.token) {
        localStorage.removeItem("auth");

        if (window.location.pathname !== "/") {
          window.location.replace("/");
        }
      }
    }



    return Promise.reject({
      message:
        data?.message ||
        data ||
        "Something went wrong. Please try again.",
      status,
    });
  }
);

export default apiClient;