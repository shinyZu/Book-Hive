import dotenv from "dotenv";
import jwt from "jsonwebtoken";

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

export { refreshToken, verifyToken };