import axios from "axios";

var axiosInstance =   axios.create({
  baseURL: "http://localhost:5004",

  headers:{ 
        'Access-Control-Allow-Origin' : '*'
      }
});


export default axiosInstance;