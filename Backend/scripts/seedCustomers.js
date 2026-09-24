import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

// ── Real Customer Profiles for Reviews ──
const REAL_CUSTOMERS = [
  { name: "Priya Sharma", email: "priya.sharma91@gmail.com", phone: "+919876500001" },
  { name: "Aarav Mehta", email: "aarav.mehta@outlook.com", phone: "+919876500002" },
  { name: "Vikram Nair", email: "vikram.nair.tech@gmail.com", phone: "+919876500003" },
  { name: "Ananya Iyer", email: "ananya.iyer@yahoo.com", phone: "+919876500004" },
  { name: "Rohan Deshmukh", email: "rohan.deshmukh@gmail.com", phone: "+919876500005" },
  { name: "Sneha Patel", email: "sneha.patel@gmail.com", phone: "+919876500006" },
  { name: "Karthik Menon", email: "karthik.menon@hotmail.com", phone: "+919876500007" },
  { name: "Sunita Rao", email: "sunita.rao@gmail.com", phone: "+919876500008" },
  { name: "David Wilson", email: "david.wilson@gmail.com", phone: "+919876500009" },
  { name: "Emily Watson", email: "emily.watson@gmail.com", phone: "+919876500010" },
  { name: "Mohammed Al-Fassi", email: "m.alfassi@gmail.com", phone: "+919876500011" },
  { name: "Sophia Carter", email: "user@naashyol.com", phone: "+919876500012" },
];

export { REAL_CUSTOMERS };
