import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", employeeId: "", password: "" });
  const [page, setPage] = useState("auth");
  const [loggedEmpId, setLoggedEmpId] = useState(null);
  const [loggedName, setLoggedName] = useState("");
  const [inputEmpId, setInputEmpId] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto Mark Absent — only once
  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const date = now.toLocaleDateString();

    if (!loggedEmpId || !loggedName || page !== "attendance") return;

    const morningAbsentKey = `absent-${loggedEmpId}-${date}-morning`;
    const eveningAbsentKey = `absent-${loggedEmpId}-${date}-evening`;

    const shouldMarkMorningAbsent = hours === 21 && minutes === 55 && !localStorage.getItem(morningAbsentKey);
    const shouldMarkEveningAbsent = hours === 17 && minutes === 46 && !localStorage.getItem(eveningAbsentKey);

    if (shouldMarkMorningAbsent || shouldMarkEveningAbsent) {
      const slot = shouldMarkMorningAbsent ? "morning" : "evening";
      const key = shouldMarkMorningAbsent ? morningAbsentKey : eveningAbsentKey;
      localStorage.setItem(key, "true");

      const time = now.toLocaleTimeString();
      const day = now.toLocaleDateString(undefined, { weekday: "long" });

      const newRecord = {
        status: "absent",
        time,
        date,
        day,
      };

      axios
        .post("http://localhost:5000/attendance", {
          employeeId: loggedEmpId,
          name: loggedName,
          ...newRecord,
        })
        .then(() => {
          setAttendanceRecords((prev) => [...prev, newRecord]);
          alert(`You were marked absent for not submitting on time (${slot} slot).`);
        })
        .catch((err) => {
          console.error("Auto-absent failed:", err);
        });
    }
  }, [page, loggedEmpId, loggedName, currentTime]);

  const fetchAttendance = async (empId) => {
    try {
      const attRes = await axios.get(`http://localhost:5000/attendance/${empId}`);
      if (attRes.data) setAttendanceRecords(attRes.data);
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "login" : "signup";

    try {
      const res = await axios.post(`http://localhost:5000/${endpoint}`, form);
      alert(isLogin ? "Logged in!" : "Signed up!");
      setLoggedEmpId(res.data.employeeId);
      setLoggedName(res.data.name);
      setPage("attendance");
      await fetchAttendance(res.data.employeeId);
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    }
  };

  const handleAttendanceCheck = async () => {
    const now = new Date();
    const time = now.toLocaleTimeString();
    const date = now.toLocaleDateString();
    const day = now.toLocaleDateString(undefined, { weekday: "long" });

    let slot = null;
    const hours = now.getHours();
    const minutes = now.getMinutes();
    if (hours === 9 && minutes < 51) slot = "morning";
    else if (hours === 17 && minutes < 46) slot = "evening";
    else {
      alert("Attendance can only be marked between 9:00–9:50 AM or 5:00–5:45 PM.");
      return;
    }

    const key = `submitted-${loggedEmpId}-${date}-${slot}`;
    const alreadySubmitted = localStorage.getItem(key);
    if (alreadySubmitted) {
      alert(`You have already submitted attendance for the ${slot} slot.`);
      return;
    }

    let status = "absent";
    if (inputEmpId.trim().toLowerCase() === loggedEmpId.trim().toLowerCase()) {
      status = "present";
      alert("Attendance marked: Present");
    } else {
      alert("Invalid Employee ID. Marked as Absent.");
    }

    const newRecord = { status, time, date, day };
    try {
      await axios.post("http://localhost:5000/attendance", {
        employeeId: loggedEmpId,
        name: loggedName,
        ...newRecord,
      });

      setAttendanceRecords((prev) => [...prev, newRecord]);
      localStorage.setItem(key, "true");
    } catch (error) {
      alert("Error submitting attendance.");
    }
  };

  // Render attendance dashboard
  if (page === "attendance") {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const formattedTime = currentTime.toLocaleTimeString();
    const date = currentTime.toLocaleDateString();

    let currentSlot = null;
    if (hours === 9 && minutes < 51) currentSlot = "morning";
    else if (hours === 17 && minutes < 46) currentSlot = "evening";

    const localKey = `submitted-${loggedEmpId}-${date}-${currentSlot}`;
    const hasSubmitted = currentSlot && localStorage.getItem(localKey);
    const isSubmitTime = currentSlot !== null && !hasSubmitted;

    return (
      <div className="container">
        <div className="status-box">
          <h2>Status</h2>
          {attendanceRecords.map((rec, idx) => (
            <div key={idx} className={`status-entry ${rec.status}`}>
              <div><strong>Status:</strong> {rec.status.toUpperCase()}</div>
              <div><strong>Date:</strong> {rec.date}</div>
              <div><strong>Day:</strong> {rec.day}</div>
              <div><strong>Time:</strong> {rec.time}</div>
            </div>
          ))}
        </div>

        <h1>Welcome to Attendance Dashboard</h1>
        <h2>Current Time: {formattedTime}</h2>

        <div style={{ textAlign: "center" }}>
          <input
            type="text"
            placeholder="Enter your Employee ID"
            value={inputEmpId}
            onChange={(e) => setInputEmpId(e.target.value)}
            disabled={!isSubmitTime}
          />
          <br /><br />
          <button onClick={handleAttendanceCheck} disabled={!isSubmitTime}>
            Submit Attendance
          </button>
          {!isSubmitTime && (
            <p className="warning">
              {hasSubmitted
                ? `You've already submitted attendance for ${currentSlot} slot.`
                : "Attendance window is 9:00–9:50 AM or 5:00–5:45 PM."}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Render login/signup
  return (
    <div className="container">
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        )}
        <input
          type="text"
          placeholder="Employee ID"
          value={form.employeeId}
          onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
      </form>

      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Create Account" : "Already have an account?"}
      </button>
    </div>
  );
}

export default App;
