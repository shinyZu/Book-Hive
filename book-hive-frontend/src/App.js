import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import Home from "./pages/Home/Home";

// ----------- Only for Testing Purposes ------------------------
const userAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aW1lIjoiU3VuIERlYyAwMSAyMDI0IDA0OjQ2OjA2IEdNVCswNTMwIChJbmRpYSBTdGFuZGFyZCBUaW1lKSIsInVzZXJfaWQiOjIsInVzZXJuYW1lIjoiZGF2aWQxMTExIiwiZW1haWwiOiJkYXZpZDk5QGdtYWlsLmNvbSIsInBhc3N3b3JkIjoiJDJhJDEwJHJSTThNSy9FOWhUSnk1UGhpWlVnQnVncFBacXhsZ0hFWUlUYnFML0x3cjcuNVkyLlplNUZXIiwidXNlcl9yb2xlIjoicmVhZGVyIiwiYWNjZXNzVG9rZW5fZXhwaXJlc19pbiI6IjI0IGhvdXJzIiwicmVmcmVzaG9rZW5fZXhwaXJlc19pbiI6IjI0IGhvdXJzIiwiaWF0IjoxNzMzMDA4NTY2LCJleHAiOjE3MzMwOTQ5NjZ9.CIDHKgSJDKy_Q0z-0hozGw2hpbFopU57OMbYgrirvDo"

function App() {

  const [isAdmin, setIsAdmin] = useState(() => {
    // const token = localStorage.getItem("token");
    const token = userAccessToken;
    if (token) {
      const isAdmin = jwtDecode(token).user_role === "admin";
      return isAdmin ? true : false;
    }
  });

  const [isReader, setIsReader] = useState(() => {
    // const token = localStorage.getItem("token");
    const token = userAccessToken;
    if (token) {
      const isReader = jwtDecode(token).user_role === "reader";
      return isReader ? true : false;
    }
  });

  useEffect(() => {
    console.log("----useEffect in App js-----");

    console.log("isAdmin : " + isAdmin);
    console.log("isReader : " + isReader);

    if (isAdmin) {
      handleLogin(isAdmin, "admin");
    } else {
      handleLogin(isReader, "reader");
    }
  }, [isAdmin, isReader]);

  const handleLogin = (isSuccess, userRole) => {
      console.log("handleLogin");
      console.log("App.js : " + isSuccess);

      if (isSuccess && userRole === "admin") {
          console.log("-------is Logged in as Admin------");
          setIsAdmin(true);

      } else if (isSuccess && userRole === "reader") {
          console.log("-------is Logged in as Customer------");
          setIsReader(true);

      } else {
          console.log("-------is Logged out------");
          setIsAdmin(false);
          setIsReader(false);
      }
  };

  return (
      <Router>
          <Routes>
              <Route path="/" exact element={<Navigate replace to="/home" />} />
              <Route path="/home" element={<Home handleLogin={handleLogin} />} />
          </Routes>
      </Router>
  );
}

export default App;
