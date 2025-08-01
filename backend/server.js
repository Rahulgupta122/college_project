// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("./models/User");
// const Attendance = require("./models/Attendance");

// const app = express();
// app.use(cors());
// app.use(express.json());

// mongoose.connect("mongodb://localhost:27017/mern-auth", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// // Signup Route
// app.post("/signup", async (req, res) => {
//   const { name, email, employeeId, password } = req.body;
//   const userExist = await User.findOne({ email });
//   const empIdExist = await User.findOne({ employeeId });

//   if (userExist) return res.status(400).json({ error: "Email already registered" });
//   if (empIdExist) return res.status(400).json({ error: "Employee ID already registered" });

//   const hashed = await bcrypt.hash(password, 10);
//   const user = new User({ name, email, employeeId, password: hashed });
//   await user.save();
//   res.json({ message: "User created", employeeId: user.employeeId, name: user.name });
// });

// // Login Route
// app.post("/login", async (req, res) => {
//   const { employeeId, email, password } = req.body;
//   const user = await User.findOne({ email, employeeId });
//   if (!user) return res.status(400).json({ error: "Invalid email or employee ID" });

//   const validPass = await bcrypt.compare(password, user.password);
//   if (!validPass) return res.status(400).json({ error: "Invalid password" });

//   const token = jwt.sign({ id: user._id }, "secret123");
//   res.json({ token, employeeId: user.employeeId, name: user.name });
// });

// // Save attendance
// app.post("/attendance", async (req, res) => {
//   const { employeeId, name, status, time, date, day } = req.body;
//   await Attendance.create({ employeeId, name, status, time, date, day });
//   res.json({ message: "Attendance recorded" });
// });

// // Get all attendance for employee
// app.get("/attendance/:employeeId", async (req, res) => {
//   const { employeeId } = req.params;
//   const records = await Attendance.find({ employeeId });
//   res.json(records);
// });

// app.listen(5000, () => console.log("Server running on http://localhost:5000"));




const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Attendance = require("./models/Attendance");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/mern-auth", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Signup Route
app.post("/signup", async (req, res) => {
  const { name, email, employeeId, password } = req.body;
  const userExist = await User.findOne({ email });
  const empIdExist = await User.findOne({ employeeId });

  if (userExist) return res.status(400).json({ error: "Email already registered" });
  if (empIdExist) return res.status(400).json({ error: "Employee ID already registered" });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, employeeId, password: hashed });
  await user.save();
  res.json({ message: "User created", employeeId: user.employeeId, name: user.name });
});

// Login Route
app.post("/login", async (req, res) => {
  const { employeeId, email, password } = req.body;
  const user = await User.findOne({ email, employeeId });
  if (!user) return res.status(400).json({ error: "Invalid email or employee ID" });

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign({ id: user._id }, "secret123");
  res.json({ token, employeeId: user.employeeId, name: user.name });
});

// Save attendance
app.post("/attendance", async (req, res) => {
  const { employeeId, name, status, time, date, day } = req.body;
  await Attendance.create({ employeeId, name, status, time, date, day });
  res.json({ message: "Attendance recorded" });
});

// Get all attendance for employee
app.get("/attendance/:employeeId", async (req, res) => {
  const { employeeId } = req.params;
  const records = await Attendance.find({ employeeId });
  res.json(records);
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));