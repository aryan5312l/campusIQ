import { useNavigate } from "react-router-dom";

const styles = {
    container: {
        fontFamily: "Arial",
        padding: "20px"
    },

    nav: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },

    navBtn: {
        marginRight: "10px",
        padding: "8px 15px",
        cursor: "pointer"
    },

    primaryBtn: {
        padding: "10px 20px",
        background: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    },

    hero: {
        textAlign: "center",
        marginTop: "80px"
    },

    features: {
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        marginTop: "60px"
    },

    featureCard: {
        background: "#f5f5f5",
        padding: "20px",
        borderRadius: "10px",
        width: "200px"
    },

    footer: {
        marginTop: "100px",
        textAlign: "center",
        color: "#777"
    }
};

function Feature({ title, desc }) {
    return (
        <div style={styles.featureCard}>
            <h3>{title}</h3>
            <p>{desc}</p>
        </div>
    );
}

export default function Landing() {
    
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    if (token) {
        navigate("/dashboard");
    }

    return (
        <div style={styles.container}>

            {/* Navbar */}
            <div style={styles.nav}>
                <h2>CampusIQ</h2>
                <div>
                    <button onClick={() => navigate("/login")} style={styles.navBtn}>
                        Login
                    </button>
                    <button onClick={() => navigate("/register")} style={styles.primaryBtn}>
                        Get Started
                    </button>
                </div>
            </div>

            {/* Hero Section */}
            <div style={styles.hero}>
                <h1>Track Your Attendance Smarter 📊</h1>
                <p>
                    Automatically sync your college attendance, get insights, and never fall below safe limits.
                </p>

                <button onClick={() => navigate("/register")} style={styles.primaryBtn}>
                    🚀 Get Started
                </button>
            </div>

            {/* Features */}
            <div style={styles.features}>
                <Feature title="Auto Sync" desc="Fetch attendance instantly from your college portal." />
                <Feature title="Smart Insights" desc="Know risky subjects before it's too late." />
                <Feature title="Clean Dashboard" desc="All your data in one place, beautifully." />
            </div>

            {/* Footer */}
            <div style={styles.footer}>
                <p>© 2026 CampusIQ</p>
            </div>

        </div>
    );
}