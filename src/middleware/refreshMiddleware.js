import jwt from "jsonwebtoken";

export default function refreshMiddleware(req, res, next) {
  const token = req.cookies["jwt"];

  if (!token) return res.status(401).json({ message: "no token provided" });

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "invalid token" });
    req.userId = decoded.id;
    next();
  });
}
