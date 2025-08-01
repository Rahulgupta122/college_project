
// const mongoose = require("mongoose");

// const AttendanceSchema = new mongoose.Schema({
//   employeeId: String,
//   name: String,
//   status: String, // 'present' or 'absent'
//   time: String,
//   date: String,
//   day: String,
// });

// module.exports = mongoose.model("Attendance", AttendanceSchema);

const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  employeeId: String,
  name: String,
  status: String, // 'present' or 'absent'
  time: String,
  date: String,
  day: String,
});

module.exports = mongoose.model("Attendance", AttendanceSchema);