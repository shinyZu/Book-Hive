import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import AdminPanel from "./pages/AdminPanel/AdminPanel";

// ----------- Only for Testing Purposes ------------------------
const userAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aW1lIjoiU3VuIERlYyAwMSAyMDI0IDA0OjQ2OjQ0IEdNVCswNTMwIChJbmRpYSBTdGFuZGFyZCBUaW1lKSIsInVzZXJfaWQiOjEsInVzZXJuYW1lIjoic2hpbnkxMjM0IiwiZW1haWwiOiJzaGlueTk5QGdtYWlsLmNvbSIsInBhc3N3b3JkIjoiJDJhJDEwJGFtSXoxZmJZTi5Vb2hFaGhMb1o5Zi5jZ3ZnR3dNQTJIc3FJWW0vS3FJTExtVkNVeWhwZDRDIiwidXNlcl9yb2xlIjoiYWRtaW4iLCJhY2Nlc3NUb2tlbl9leHBpcmVzX2luIjoiMjQgaG91cnMiLCJyZWZyZXNob2tlbl9leHBpcmVzX2luIjoiMjQgaG91cnMiLCJpYXQiOjE3MzMwMDg2MDQsImV4cCI6MTczMzA5NTAwNH0.hBMC2yd_LaWKTo-qlxrapWirTNoWeA47tGCH7mkJkm0"
// const userAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aW1lIjoiU3VuIERlYyAwMSAyMDI0IDA0OjQ2OjA2IEdNVCswNTMwIChJbmRpYSBTdGFuZGFyZCBUaW1lKSIsInVzZXJfaWQiOjIsInVzZXJuYW1lIjoiZGF2aWQxMTExIiwiZW1haWwiOiJkYXZpZDk5QGdtYWlsLmNvbSIsInBhc3N3b3JkIjoiJDJhJDEwJHJSTThNSy9FOWhUSnk1UGhpWlVnQnVncFBacXhsZ0hFWUlUYnFML0x3cjcuNVkyLlplNUZXIiwidXNlcl9yb2xlIjoicmVhZGVyIiwiYWNjZXNzVG9rZW5fZXhwaXJlc19pbiI6IjI0IGhvdXJzIiwicmVmcmVzaG9rZW5fZXhwaXJlc19pbiI6IjI0IGhvdXJzIiwiaWF0IjoxNzMzMDA4NTY2LCJleHAiOjE3MzMwOTQ5NjZ9.CIDHKgSJDKy_Q0z-0hozGw2hpbFopU57OMbYgrirvDo"

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
              <Route path="/admin" element={<Navigate replace to="/login" />} />
              
              <Route
                  path="/home"
                  element={
                      isReader && !isAdmin ? (
                          <Home handleLogin={handleLogin} />
                      ) : (
                          <Login onLogin={handleLogin} />
                      )
                    }
              />

              <Route
                  path="/admin/panel"
                  element={
                      isAdmin && !isReader ? (
                          <AdminPanel />
                      ) : (
                          <Navigate replace to="/home" />
                      )
                  }
              />
          </Routes>
      </Router>
  );
}

export default App;
