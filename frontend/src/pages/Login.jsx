import { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false); // Added loading state
  const navigate = useNavigate();

  const handleChange = (e) => {
    // Dynamically update state based on the input "name"
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      // Better error handling
      alert(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input 
          name="email" // Added name
          type="email" // Changed type for validation
          placeholder="Email"
          value={form.email} // Controlled component
          onChange={handleChange}
          required 
        />

        <input 
          name="password" // Added name
          type="password" 
          placeholder="Password"
          value={form.password} // Controlled component
          onChange={handleChange}
          required 
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
  );
}