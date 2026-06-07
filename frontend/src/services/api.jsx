import axios from "axios";

const API = axios.create({
  baseURL: "https://dadu-expense.onrender.com/"
});

export default API;