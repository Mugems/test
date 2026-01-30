import axios from "axios";
import { getToken } from "./jwt-token-access/accessToken";

// Don't get token here - it's too early!
// const token = getToken(); ❌ REMOVE THIS

const API_URL = "https://microfin-backend-dot-thinktank-tms-dev-env.as.r.appspot.com/";

const axiosApi = axios.create({
  baseURL: API_URL,
});

const axiosMediaApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  }
});

const axiosMediajson = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  }
});

// ✅ Add request interceptor to ALL axios instances
// This will fetch the token fresh before EVERY request
axiosApi.interceptors.request.use(
  (config) => {
    const token = getToken(); // Get fresh token for each request
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosMediaApi.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosMediajson.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptors remain the same
axiosApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error.response)
);

axiosMediaApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error.response)
);

axiosMediajson.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error.response)
);

// Rest of your code remains the same
export async function GET(url, config = {}) {
  return await axiosApi
    .get(url, { ...config })
    .then((response) => response)
    .catch((error) => error);
}

export async function POST(url, data, config = {}) {
  return axiosApi
    .post(url, { ...data }, { ...config })
    .then((response) => response)
    .catch((error) => error);
}

export async function PUT(url, data, config = {}) {
  return axiosApi
    .put(url, { ...data }, { ...config })
    .then((response) => response)
    .catch((error) => error);
}

export async function DELETE(url, config = {}) {
  return await axiosApi
    .delete(url, { ...config })
    .then((response) => response)
    .catch((error) => error);
}

export async function UPLOAD(url, data, config = {}) {
  return await axiosMediaApi
    .post(url, data)
    .then((response) => response)
    .catch((error) => error);
}

export async function UPLOAD_CERTIFCATE(url, data, config = {}) {
  return await axiosMediaApi
    .post(url, data)
    .then((response) => response)
    .catch((error) => error);
}

export async function CREATE_BRANCH(url, data, config = {}) {
  return await axiosMediajson
    .post(url, data)
    .then((response) => response)
    .catch((error) => error);
}

export async function GET_BRANCHES(url, config = {}) {
  return await axiosMediajson
    .get(url)
    .then((response) => response)
    .catch((error) => error);
}

export async function UPDATE_UPLOAD(url, data, config = {}) {
  return await axiosMediaApi
    .put(url, data)
    .then((response) => response)
    .catch((error) => error);
}