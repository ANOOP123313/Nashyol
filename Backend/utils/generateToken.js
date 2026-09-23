import jwt from "jsonwebtoken";

export const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "naashyol_production_super_secret_key_2026",
    { expiresIn: process.env.JWT_EXPIRES || "30d" }
  );
};

export default generateToken;