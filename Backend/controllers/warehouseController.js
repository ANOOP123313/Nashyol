import Warehouse from "../models/Warehouse.js";

// @desc    Get all warehouses (with auto-seeding if empty)
// @route   GET /api/warehouses
export const getWarehouses = async (req, res) => {
  try {
    let warehouses = await Warehouse.find().sort({ createdAt: -1 });

    if (warehouses.length === 0) {
      const defaultWarehouses = [
        {
          name: "Central Hub - Mumbai",
          code: "WH-MUM-01",
          contactPerson: "Rajesh Sharma",
          phone: "+91 98765 43210",
          email: "mumbai.hub@nashyol.com",
          address: "Sector 18, Vashi Logistics Park",
          city: "Navi Mumbai",
          state: "Maharashtra",
          pincode: "400705",
          capacity: 50000,
          currentOccupancy: 12400,
          status: "active",
        },
        {
          name: "North Depot - Delhi NCR",
          code: "WH-DEL-02",
          contactPerson: "Amit Verma",
          phone: "+91 98111 22334",
          email: "delhi.depot@nashyol.com",
          address: "Plot 45, Udyog Vihar Phase 4",
          city: "Gurugram",
          state: "Haryana",
          pincode: "122015",
          capacity: 35000,
          currentOccupancy: 8900,
          status: "active",
        },
        {
          name: "South Logistics - Bengaluru",
          code: "WH-BLR-03",
          contactPerson: "Priya Nair",
          phone: "+91 99000 11223",
          email: "blr.logistics@nashyol.com",
          address: "Electronic City Industrial Area",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560100",
          capacity: 40000,
          currentOccupancy: 15200,
          status: "active",
        },
      ];

      try {
        warehouses = await Warehouse.insertMany(defaultWarehouses);
      } catch (seedErr) {
        console.error("Auto-seed error for warehouses:", seedErr);
        warehouses = await Warehouse.find().sort({ createdAt: -1 });
      }
    }

    res.status(200).json({ success: true, warehouses });
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get warehouse by ID
// @route   GET /api/warehouses/:id
export const getWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: "Warehouse not found" });
    }
    res.status(200).json({ success: true, warehouse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new warehouse
// @route   POST /api/warehouses
export const createWarehouse = async (req, res) => {
  try {
    const { name, code, contactPerson, phone, email, address, city, state, pincode, capacity, status } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: "Name and warehouse code are required" });
    }

    const existingCode = await Warehouse.findOne({ code: code.trim().toUpperCase() });
    if (existingCode) {
      return res.status(400).json({ success: false, message: `Warehouse code ${code} is already in use` });
    }

    const warehouse = await Warehouse.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      contactPerson: contactPerson || "",
      phone: phone || "",
      email: email || "",
      address: address || "",
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      capacity: Number(capacity) || 10000,
      status: status || "active",
    });

    res.status(201).json({ success: true, warehouse });
  } catch (error) {
    console.error("Create warehouse error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update warehouse
// @route   PUT /api/warehouses/:id
export const updateWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: "Warehouse not found" });
    }

    if (req.body.code && req.body.code.trim().toUpperCase() !== warehouse.code) {
      const existing = await Warehouse.findOne({ code: req.body.code.trim().toUpperCase(), _id: { $ne: warehouse._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: `Warehouse code ${req.body.code} is already in use` });
      }
      warehouse.code = req.body.code.trim().toUpperCase();
    }

    if (req.body.name !== undefined) warehouse.name = req.body.name;
    if (req.body.contactPerson !== undefined) warehouse.contactPerson = req.body.contactPerson;
    if (req.body.phone !== undefined) warehouse.phone = req.body.phone;
    if (req.body.email !== undefined) warehouse.email = req.body.email;
    if (req.body.address !== undefined) warehouse.address = req.body.address;
    if (req.body.city !== undefined) warehouse.city = req.body.city;
    if (req.body.state !== undefined) warehouse.state = req.body.state;
    if (req.body.pincode !== undefined) warehouse.pincode = req.body.pincode;
    if (req.body.capacity !== undefined) warehouse.capacity = Number(req.body.capacity);
    if (req.body.currentOccupancy !== undefined) warehouse.currentOccupancy = Number(req.body.currentOccupancy);
    if (req.body.status !== undefined) warehouse.status = req.body.status;

    await warehouse.save();
    res.status(200).json({ success: true, warehouse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete warehouse
// @route   DELETE /api/warehouses/:id
export const deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: "Warehouse not found" });
    }
    res.status(200).json({ success: true, message: "Warehouse deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
