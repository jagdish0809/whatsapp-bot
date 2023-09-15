import Home from "./pages/Home";
import React from "react";
import Admin from "./pages/Admin";
// import Admin2 from "./pages/Admin2";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
let host = process.env.REACT_APP_HOST;

function App() {
  const [status, setStatus] = React.useState(false);
  useEffect(() => {
    const getserver = async () => {
      const response = await axios.get(`${host}/`);
      console.log(response, "response");
      if (response.status === 200) {
        setStatus(true);
      }
    }
    getserver();
  }, []);

  if(status){
    return (
      <Router>
        <Routes>
          <Route path="/" exact element={<Home />}></Route>
          <Route path="/akshay" exact element={<Admin />}></Route>
        </Routes>
      </Router>
    );
  } else{
    return (
        <span class="loader"></span>
    );
  }
}

export default App;
