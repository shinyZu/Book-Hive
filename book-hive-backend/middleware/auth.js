import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import User from "../models/user.models.js"

dotenv.config();

const refreshToken = (email, refresh_token) => {
    try {
        let jwtRefreshKey = process.env.JWT_REFRESH_KEY;
        const decoded = jwt.verify(refresh_token, jwtRefreshKey);
        return decoded.email === email;
    } catch (error) {
        return false;
    }
};

// both admin and reader tokens
const verifyToken = (authHeader, res) => {
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
  
    try {
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ status: 401, message: "Invalid token format." });
            return;
      }
  
      const access_token = authHeader.split(" ")[1];
  
      if (!access_token) {
            return res
                .status(401)
                .json({ status: 401, message: "No token provided." });
      }
  
      const verified = jwt.verify(access_token, jwtSecretKey);
    //   console.log("verified---", verified)
  
      if (verified) {
            return verified;
      } else {
            return res.status(401).send(error);
      }
    } catch (error) {
        // TODO ----- Add code here to auto refresh token
        res.status(401).json({ status: 401, message: error });
    }
};

const authenticateAdminToken = async (req, res, next) => {
    const verified = verifyToken(req.headers.authorization, res);
    if (verified) {
        if (verified.user_role == "admin") {
            req.email = verified.email;
            req.user_role = verified.user_role;
            next();
        } else {
            return res.status(403).send({ status: 403, messge: "Access denied." });
        }
    }
};    

const authenticateReaderToken = async (req, res, next) => {
    const verified = verifyToken(req.headers.authorization, res);
  
    if (verified) {
        if (verified.user_role == "reader" && req.params.user_id && req.params.user_id == verified.user_id) {
            req.email = verified.email;
            req.user_role = verified.user_role;
            next();

        } else if (!req.params.user_id && verified.user_role == "reader") {
            const user = await User.findOne({user_id:verified.user_id});
            console.log(user);
            if (user.user_id == verified.user_id) {
                req.email = verified.email;
                req.user_role = verified.user_role;
                next();
            }
        } else {
            return res.status(403).send({ status: 403, messge: "Access denied." });
        }
    }
};
export { refreshToken, verifyToken, authenticateAdminToken, authenticateReaderToken };