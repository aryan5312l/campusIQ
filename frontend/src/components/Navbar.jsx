import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <h2>CampusIQ</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
}