import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080",
  // baseURL: "http://192.168.1.6:8080",
  timeout: 10000,
});

/* ───────── REQUEST INTERCEPTOR ───────── */
apiClient.interceptors.request.use(
  (config) => {
    const auth = JSON.parse(localStorage.getItem("auth"));

    // ❗ Skip token for public APIs
    const noAuthRoutes = [
      "/auth/login",
      "/vendor/register",
      "/auth/changepassword", // optional if public
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

/* ───────── RESPONSE INTERCEPTOR ───────── */
apiClient.interceptors.response.use(
  (response) => {
    // ✅ Always return only backend response body
    return response.data;
  },
  (error) => {
    // ❌ NETWORK ERROR (server down / wrong URL)
    if (!error.response) {
      return Promise.reject({
        message: "Server not reachable. Please try again later.",
        status: 0,
      });
    }

    const { status, data } = error.response;

    // ✅ ONLY logout on REAL auth failure
    if (status === 401) {
      const auth = JSON.parse(localStorage.getItem("auth"));

      // extra safety: logout only if user was logged in
      if (auth?.token) {
        localStorage.removeItem("auth");

        // ❗ avoid reload loop
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