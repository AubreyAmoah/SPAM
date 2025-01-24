import jwt from "jsonwebtoken";
import argon from "argon2";
import {
  create,
  validateUserSignIn,
  createRefreshToken,
  compareRefreshToken,
  deleteRefreshToken,
} from "./auth.service.js";

export async function register(req, res) {
  try {
    const body = req.body;

    console.log(body.password);

    // Hash the password
    body.password = await argon.hash(body.password);

    // Call the `create` function and handle the result
    const result = await create(body);

    if (result === "User created successfully") {
      return res.status(201).json({ message: result });
    }

    if (result === "User already exists") {
      return res.status(409).json({ message: result });
    }

    // Handle unexpected result
    return res.status(500).json({ message: "An unexpected error occurred" });
  } catch (error) {
    // Log the error and return a 500 response
    console.error("Error during registration:", error);
    return res.status(500).json({
      message: "An error occurred during registration",
      error: error.message,
    });
  }
}

export async function login(req, res) {
  try {
    const body = req.body;

    // Fetch the user details from the database
    const result = await validateUserSignIn(body);

    if (!result) {
      return res.status(500).json({ message: "An error occurred" });
    }

    // Verify the password provided in the request against the stored hashed password
    const isPasswordValid = await argon.verify(result.password, body.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // If the password is valid, proceed with token generation
    result.password = undefined; // Remove the password from the result object for security

    const jsontoken = jwt.sign(
      { user: result },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "24h",
      }
    );

    const refreshToken = jwt.sign(
      { user: result },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "3d",
      }
    );

    const newRefreshToken = await createRefreshToken(result.email, refreshToken);

    if (newRefreshToken === "Refresh token created") {
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: 1,
        message: "Login successful",
        token: jsontoken,
      });
    } else {
      return res.status(500).json({ message: "Failed to create refresh token" });
    }
  } catch (error) {
    // Log the error and return a 500 response
    console.error("Error during login:", error);
    return res.status(500).json({
      message: "An error occurred during login",
      error: error.message,
    });
  }
}


export async function handleRefreshToken(req, res) {
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    const checkRefreshToken = compareRefreshToken(refreshToken);

    if (checkRefreshToken) {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
          if (err || refreshToken.email !== decoded.email)
            return res.sendStatus(401);
          const accessToken = jwt.sign(
            { email: decoded.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" }
          );
          res.json({ accessToken });
        }
      );
    }

    return res.status(404).json({ message: "Invalid Token" });
  } catch (error) {
    console.error("Error during token refresh:", error);
    return res.status(500).json({
      message: "An error occurred",
      error: error.message,
    });
  }
}

export async function handleLogout(req, res) {
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.sendStatus(401);
    console.log(cookies.jwt);
    const refreshToken = cookies.jwt;

    const checkRefreshToken = compareRefreshToken(refreshToken);

    if (checkRefreshToken === "Refresh token found") {
      const deleteToken = deleteRefreshToken(refreshToken);

      if (deleteToken === "Refresh token deleted") {
        //Delete refreshToken
        res.clearCookie("jwt", {
          httpOnly: true,
          sameSite: "None",
          secure: true,
        }); // secure: true on production
        return res.json({
          success: 1,
          message: "Logout succesful",
        });
      }
    }

    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    return res.json({
      success: 1,
      message: "Token error Logout succesful",
    });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({
      message: "An error occurred",
      error: error.message,
    });
  }
}
