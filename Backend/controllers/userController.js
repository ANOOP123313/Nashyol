import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Address from "../models/Address.js";
import Cart from "../models/Cart.js";

// @desc    Get all customers with aggregated order stats (for Customers admin page)
// @route   GET /api/users/customers
// @access  Private/Admin
export const getCustomers = asyncHandler(async (req, res) => {
  const search = req.query.search || "";
  const status = req.query.status || "";

  // Customers are users who are not admin, superadmin, or vendor
  const query = {
    role: { $nin: ["admin", "superadmin", "vendor"] },
  };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  if (status === "enabled" || status === "active") {
    query.isBlocked = false;
  } else if (status === "disabled" || status === "blocked") {
    query.isBlocked = true;
  }

  const users = await User.find(query)
    .select("-password")
    .sort({ createdAt: -1 })
    .lean();

  if (!users || users.length === 0) {
    return res.json({ users: [], total: 0 });
  }

  const userIds = users.map((u) => u._id);

  // Aggregation for order statistics grouped by user
  const orderStats = await Order.aggregate([
    { $match: { user: { $in: userIds } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$user",
        orderCount: { $sum: 1 },
        totalSpent: { $sum: "$totalAmount" },
        latestOrderDate: { $first: "$createdAt" },
        recentOrders: {
          $push: {
            id: "$_id",
            date: "$createdAt",
            amount: "$totalAmount",
            status: "$orderStatus",
          },
        },
      },
    },
    {
      $project: {
        orderCount: 1,
        totalSpent: 1,
        latestOrderDate: 1,
        recentOrders: { $slice: ["$recentOrders", 5] },
      },
    },
  ]);

  const statsMap = new Map();
  for (const stat of orderStats) {
    if (stat._id) {
      statsMap.set(stat._id.toString(), stat);
    }
  }

  // Fetch addresses to provide accurate country/location
  const addresses = await Address.find({ user: { $in: userIds } }).lean();
  const addressMap = new Map();
  for (const addr of addresses) {
    if (addr.user) {
      addressMap.set(addr.user.toString(), addr);
    }
  }

  const formattedUsers = users.map((u) => {
    const stat = statsMap.get(u._id.toString());
    const addr = addressMap.get(u._id.toString());

    let country = "India";
    if (addr?.country) {
      country = addr.country;
    } else if (u.phone && (u.phone.startsWith("+1") || u.phone.startsWith("1"))) {
      country = "United States";
    }

    const recentOrders = stat?.recentOrders
      ? stat.recentOrders.map((o) => {
          const rawStatus = (o.status || "pending").toLowerCase();
          let displayStatus = "Pending";
          if (rawStatus === "delivered") displayStatus = "Delivered";
          else if (rawStatus === "shipped") displayStatus = "In Transit";
          else if (rawStatus === "confirmed") displayStatus = "Confirmed";
          else if (rawStatus === "cancelled") displayStatus = "Cancelled";
          else displayStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

          return {
            id: `ORD-${(o.id || "").toString().slice(-8).toUpperCase()}`,
            _id: o.id,
            date: new Date(o.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            amount: Number(o.amount) || 0,
            status: displayStatus,
          };
        })
      : [];

    return {
      _id: u._id,
      name: u.name || "Customer",
      email: u.email || "",
      phone: u.phone || "",
      role: u.role || "user",
      isVerified: Boolean(u.isVerified || u.isPhoneVerified),
      isBlocked: Boolean(u.isBlocked),
      createdAt: u.createdAt,
      country,
      orders: stat ? stat.orderCount : 0,
      totalSpent: stat ? Math.round((stat.totalSpent || 0) * 100) / 100 : 0,
      lastOrder: stat?.latestOrderDate
        ? new Date(stat.latestOrderDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : null,
      recentOrders,
    };
  });

  res.json({ users: formattedUsers, total: formattedUsers.length });
});

// @desc    Get all users (with search & filtering for Admin)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 100;
  const search = req.query.search || "";
  const role = req.query.role || "";

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (role) {
    query.role = role;
  }

  const count = await User.countDocuments(query);
  const users = await User.find(query)
    .select("-password")
    .limit(limit)
    .skip(limit * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ users, page, pages: Math.ceil(count / limit), total: count });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

// @desc    Toggle block status of a user
// @route   PUT /api/users/:id/block
// @access  Private/Admin
export const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({ message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`, isBlocked: user.isBlocked });
});

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (role) user.role = role;
  await user.save();
  res.json({ message: "User role updated successfully", role: user.role });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Clean up user-specific references while preserving historical order records
  await Promise.all([
    Cart.deleteMany({ user: user._id }),
    Address.deleteMany({ user: user._id }),
  ]);

  await user.deleteOne();
  res.json({ message: "User deleted successfully" });
});

// @desc    Create new user / admin
// @route   POST /api/users
// @access  Private/Admin
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email) {
    res.status(400);
    throw new Error("Name and email are required");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error("User with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password: password || "123456",
    role: role || "admin",
    isVerified: true,
  });

  const returnedUser = await User.findById(user._id).select("-password");
  res.status(201).json(returnedUser);
});
