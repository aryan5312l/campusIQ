import { useEffect, useState } from "react";
import API, { syncData } from "../services/api";
import SubjectCard from "../components/SubjectCard";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 fetch saved data
  const fetchDashboard = async () => {
    try {
      const res = await API.get("/dashboard");

      const data = res.data.data;

      if (data && data.subjects && data.subjects.length > 0) {
        setSubjects(data.subjects);
        setLoading(false);
      } else {
        // 🔥 no data → auto sync
        await handleSync();
      }

    } catch (err) {
      console.log("Dashboard error:", err);
      setLoading(false);
    }
  };

  // 🔄 sync function
  const handleSync = async () => {
    try {
      setLoading(true);

      const res = await syncData();

      setSubjects(res.data.data);

    } catch (err) {
      alert("Sync failed");
    } finally {
      setLoading(false);
    }
  };

  // 🚀 run on page load
  useEffect(() => {
    fetchDashboard();
  }, []);

  // 📊 loading UI
  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Loading your data...</h2>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <h1>Dashboard</h1>

      <button onClick={handleSync}>🔄 Sync Again</button>

      <div style={{ display: "grid", gap: "20px" }}>
        {subjects.map((s, i) => (
          <SubjectCard key={i} subject={s} />
        ))}
      </div>
    </div>
  );
}