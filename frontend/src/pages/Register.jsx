import { useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    studentId: "",
    dob: ""
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerUser(form);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input placeholder="Name"
          onChange={(e) => setForm({...form, name: e.target.value})} />

        <input placeholder="Email"
          onChange={(e) => setForm({...form, email: e.target.value})} />

        <input type="password" placeholder="Password"
          onChange={(e) => setForm({...form, password: e.target.value})} />

        <input placeholder="Student ID"
          onChange={(e) => setForm({...form, studentId: e.target.value})} />

        <input type="date"
          onChange={(e) => setForm({...form, dob: e.target.value})} />

        <button>Register</button>
      </form>

      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}