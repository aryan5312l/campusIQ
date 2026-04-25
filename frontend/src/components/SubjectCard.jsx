export default function SubjectCard({ subject }) {
  const attendance = subject.attendanceData.summary.present || 0;
  const absent = subject.attendanceData.summary.absent || 0;
  const remaining = subject.attendanceData.summary.remaining;
  const total = attendance + absent + remaining;

  const getColor = () => {
    if (attendance >= 85) return "#4CAF50"; // green
    if (attendance >= 75) return "#FFC107"; // yellow
    return "#F44336"; // red
  };

  const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial"
  },

  syncBtn: {
    padding: "10px 20px",
    marginBottom: "20px",
    cursor: "pointer"
  },

  stats: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px"
  },

  card: {
    padding: "15px",
    background: "#f5f5f5",
    borderRadius: "10px",
    minWidth: "150px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px"
  },

  progressWrapper: {
    height: "10px",
    background: "#ddd",
    borderRadius: "5px",
    overflow: "hidden",
    margin: "10px 0"
  },

  progressBar: {
    height: "100%"
  }
};

  return (
    <div style={{ ...styles.card, borderLeft: `6px solid ${getColor()}` }}>
      <h3>{subject.name}</h3>
      <p>Course: {subject.courseId}</p>

      <div style={styles.progressWrapper}>
        <div
          style={{
            ...styles.progressBar,
            width: `${attendance}%`,
            backgroundColor: getColor()
          }}
        />
      </div>

      <p>{attendance}%</p>
    </div>
  );
}