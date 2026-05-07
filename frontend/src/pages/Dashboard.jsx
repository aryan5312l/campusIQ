import { useEffect, useState } from "react";
import API, { syncData } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [userName, setUserName] = useState("Student");
  const navigate = useNavigate();

  // Fetch saved data
  const fetchDashboard = async () => {
    try {
      const res = await API.get("/dashboard");
      const data = res.data.data;

      if (data && data.subjects && data.subjects.length > 0) {
        setSubjects(data.subjects);
        // Get last synced date from first subject (all subjects have same syncedAt)
        if (data.syncedAt) {
          setLastSynced(data.syncedAt);
        }
        setLoading(false);
      } else {
        const synced = await handleSync();
        if (!synced) {
          setLoading(false);
        }
      }
    } catch (err) {
      console.log("Dashboard error:", err);
      setLoading(false);
    }
  };

  // Sync function
  const handleSync = async () => {
    try {
      setSyncing(true);
      await syncData();
      // Re-fetch dashboard data to get the latest synced date and updated data
      await fetchDashboard();
      return true;
    } catch (err) {
      const message = err?.response?.data?.message || "Sync failed. Please try again.";
      alert(message);
      return false;
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    // Decode user name from token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserName(payload.name || "Student");
      } catch (e) {
        setUserName("Student");
      }
    }
    fetchDashboard();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calculate attendance percentage based on present + absent (completed classes)
  const calculateAttendancePercentage = (subject) => {
    const present = subject.attendanceData?.summary?.present || 0;
    const absent = subject.attendanceData?.summary?.absent || 0;
    const totalCompleted = present + absent;
    if (totalCompleted === 0) return 0;
    return ((present / totalCompleted) * 100).toFixed(1);
  };

  // Calculate classes needed to reach target percentage
  const calculateClassesNeeded = (subject, targetPercentage) => {
    const present = subject.attendanceData?.summary?.present || 0;
    const absent = subject.attendanceData?.summary?.absent || 0;
    const remaining = subject.attendanceData?.summary?.remaining || 0;
    const totalCompleted = present + absent;
    
    // Check if already achieved target
    const currentPercentage = totalCompleted > 0 ? (present / totalCompleted) * 100 : 0;
    if (currentPercentage >= targetPercentage) {
      return 0;
    }
    
    if (totalCompleted === 0) {
      return Math.ceil((targetPercentage / 100) * remaining);
    }
    
    const needed = Math.ceil(
      (targetPercentage * totalCompleted - 100 * present) / (100 - targetPercentage)
    );
    
    return Math.max(0, needed);
  };

  // Calculate max classes you can miss to still achieve 75% attendance
  const calculateMaxMissableClasses = (subject) => {
    const present = subject.attendanceData?.summary?.present || 0;
    const absent = subject.attendanceData?.summary?.absent || 0;
    const remaining = subject.attendanceData?.summary?.remaining || 0;
    const totalCompleted = present + absent;
    const totalFuture = remaining;
    
    const totalAllClasses = totalCompleted + totalFuture;
    const requiredPresentInFuture = Math.ceil((0.75 * totalAllClasses) - present);
    const maxMissable = totalFuture - requiredPresentInFuture;
    
    return Math.max(0, maxMissable);
  };

  // Get subjects with attendance below 75%
  const getCriticalSubjects = () => {
    return subjects.filter(subject => {
      const percentage = parseFloat(calculateAttendancePercentage(subject));
      return percentage < 75;
    });
  };

  const criticalSubjects = getCriticalSubjects();

  // Get status color based on percentage
  const getStatusColor = (percentage) => {
    if (percentage >= 85) return "text-green-600";
    if (percentage >= 75) return "text-teal-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getStatusBadge = (percentage) => {
    if (percentage >= 85) return { text: "Excellent", color: "bg-green-100 text-green-700" };
    if (percentage >= 75) return { text: "Good", color: "bg-teal-100 text-teal-700" };
    if (percentage >= 60) return { text: "At Risk", color: "bg-orange-100 text-orange-700" };
    return { text: "Critical", color: "bg-red-100 text-red-700" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#004a99] border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="h-8 w-8 bg-gradient-to-br from-[#004a99] to-[#00aaff] rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#004a99] to-[#00aaff] bg-clip-text text-transparent">
                CampusIQ
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* Sync Button with Last Synced */}
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-gray-500">
                    Last synced: {formatDate(lastSynced)}
                  </span>
                </div>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="relative group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00aaff] to-[#0088cc] text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {syncing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Sync Now</span>
                    </>
                  )}
                </button>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#222222]">{userName}'s Dashboard</h1>
          <p className="text-gray-500 mt-1">Track your attendance progress and stay on top of your academics</p>
        </div>

        {/* Redesigned Critical Section - Card-based Alert */}
        {criticalSubjects.length > 0 && (
          <div className="mb-8">
            <div className="relative overflow-hidden bg-gradient-to-r from-red-600 to-red-500 rounded-2xl shadow-lg mb-4">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Critical Attendance Alert</h2>
                      <p className="text-white/90 mt-1">
                        You have {criticalSubjects.length} subject(s) with attendance below 75%. 
                        Immediate action required to avoid academic penalties!
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
                    <span className="text-white font-bold text-2xl">{criticalSubjects.length}</span>
                    <span className="text-white/80 ml-1">Subjects</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Critical Subjects Grid - Modern Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {criticalSubjects.map((subject, idx) => {
                const present = subject.attendanceData?.summary?.present || 0;
                const absent = subject.attendanceData?.summary?.absent || 0;
                const remaining = subject.attendanceData?.summary?.remaining || 0;
                const percentage = parseFloat(calculateAttendancePercentage(subject));
                const neededFor75 = calculateClassesNeeded(subject, 75);
                const maxMissable = calculateMaxMissableClasses(subject);
                
                return (
                  <div
                    key={idx}
                    className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
                    onClick={() => {
                      setSelectedSubject(subject);
                      setShowDetails(true);
                    }}
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-red-500 to-red-600"></div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-[#222222] group-hover:text-red-600 transition-colors">
                            {subject.name}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">{subject.courseId}</p>
                        </div>
                        <div className="bg-red-100 rounded-full px-3 py-1.5">
                          <span className="text-red-700 font-bold text-lg">{percentage}%</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center mb-4">
                        <div className="bg-green-50 rounded-lg p-2">
                          <p className="text-xs text-gray-500">Present</p>
                          <p className="font-bold text-green-600 text-lg">{present}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-2">
                          <p className="text-xs text-gray-500">Absent</p>
                          <p className="font-bold text-red-600 text-lg">{absent}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-2">
                          <p className="text-xs text-gray-500">Remaining</p>
                          <p className="font-bold text-blue-600 text-lg">{remaining}</p>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-3 border border-red-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-red-800">Classes needed:</span>
                          <span className="text-sm font-bold text-red-700">{neededFor75}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-red-800">Can miss only:</span>
                          <span className="text-sm font-bold text-red-700">{maxMissable}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Subjects Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#222222]">All Subjects</h2>
            <div className="md:hidden text-xs text-gray-400">
              Last synced: {formatDate(lastSynced)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, idx) => {
              const present = subject.attendanceData?.summary?.present || 0;
              const absent = subject.attendanceData?.summary?.absent || 0;
              const remaining = subject.attendanceData?.summary?.remaining || 0;
              const percentage = parseFloat(calculateAttendancePercentage(subject));
              const neededFor75 = calculateClassesNeeded(subject, 75);
              const maxMissable = calculateMaxMissableClasses(subject);
              const statusColor = getStatusColor(percentage);
              const statusBadge = getStatusBadge(percentage);
              
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer overflow-hidden group transform hover:-translate-y-0.5 duration-300"
                  onClick={() => {
                    setSelectedSubject(subject);
                    setShowDetails(true);
                  }}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-[#222222] group-hover:text-[#004a99] transition-colors">
                          {subject.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">Course ID: {subject.courseId}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}>
                        {statusBadge.text}
                      </span>
                    </div>
                    
                    {/* Current Attendance Percentage */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Current Attendance</span>
                        <span className={`font-semibold ${statusColor}`}>{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            percentage >= 75 ? 'bg-green-500' : percentage >= 60 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Classes Statistics */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 mb-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Present</p>
                        <p className="text-lg font-bold text-[#22c55e]">{present}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Absent</p>
                        <p className="text-lg font-bold text-[#f97316]">{absent}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Remaining</p>
                        <p className="text-lg font-bold text-[#004a99]">{remaining}</p>
                      </div>
                    </div>
                    
                    {/* Attendance Goals */}
                    <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                      {percentage >= 75 ? (
                        <>
                          <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Target achieved! Currently at {percentage}%
                          </p>
                          <p className="text-xs text-gray-600">
                            Can miss up to <span className="font-bold text-green-600">{maxMissable}</span> more classes
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs text-gray-700">
                            📚 Need <span className="font-bold text-orange-600">{neededFor75}</span> more present classes
                          </p>
                          <p className="text-xs text-gray-700">
                            ⚠️ Can miss only <span className="font-bold text-red-600">{maxMissable}</span> more classes
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Subject Modal - Same as before */}
      {showDetails && selectedSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetails(false)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#222222]">{selectedSubject.name}</h2>
              <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {/* Course Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Course ID</p>
                    <p className="font-semibold text-[#222222]">{selectedSubject.courseId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Completed Classes</p>
                    <p className="font-semibold text-[#222222]">
                      {(selectedSubject.attendanceData?.summary?.present || 0) + (selectedSubject.attendanceData?.summary?.absent || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Remaining Classes</p>
                    <p className="font-semibold text-[#f97316]">{selectedSubject.attendanceData?.summary?.remaining || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Current Attendance</p>
                    <p className={`font-semibold ${
                      parseFloat(calculateAttendancePercentage(selectedSubject)) >= 75 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {calculateAttendancePercentage(selectedSubject)}%
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Attendance Summary */}
              <div className="mb-6">
                <h3 className="font-semibold text-[#222222] mb-3">Attendance Summary</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <p className="text-xs text-green-600">Present</p>
                    <p className="text-2xl font-bold text-green-600">{selectedSubject.attendanceData?.summary?.present || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-xl">
                    <p className="text-xs text-orange-600">Absent</p>
                    <p className="text-2xl font-bold text-orange-600">{selectedSubject.attendanceData?.summary?.absent || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-xl">
                    <p className="text-xs text-blue-600">Remaining</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedSubject.attendanceData?.summary?.remaining || 0}</p>
                  </div>
                </div>
                
                {/* Detailed Goals Calculator */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-[#222222] mb-3">🎯 Attendance Goals & Projections</h4>
                  <div className="space-y-2 text-sm">
                    {(() => {
                      const percentage = parseFloat(calculateAttendancePercentage(selectedSubject));
                      const neededFor75 = calculateClassesNeeded(selectedSubject, 75);
                      const neededFor85 = calculateClassesNeeded(selectedSubject, 85);
                      const maxMissable = calculateMaxMissableClasses(selectedSubject);
                      const present = selectedSubject.attendanceData?.summary?.present || 0;
                      const remaining = selectedSubject.attendanceData?.summary?.remaining || 0;
                      const totalCompleted = present + (selectedSubject.attendanceData?.summary?.absent || 0);
                      const totalPossible = totalCompleted + remaining;
                      const bestPossible = totalPossible > 0 ? (((present + remaining) / totalPossible) * 100).toFixed(1) : 0;
                      
                      return (
                        <>
                          {percentage < 75 && (
                            <p className="flex justify-between">
                              <span>To reach 75% attendance:</span>
                              <span className="font-bold text-orange-600">
                                Need {neededFor75} more present classes
                              </span>
                            </p>
                          )}
                          <p className="flex justify-between">
                            <span>Can miss only:</span>
                            <span className="font-bold text-red-600">
                              {maxMissable} more classes
                            </span>
                          </p>
                          {percentage < 85 && (
                            <p className="flex justify-between">
                              <span>To reach 85% attendance:</span>
                              <span className="font-bold text-green-600">
                                Need {neededFor85} more present classes
                              </span>
                            </p>
                          )}
                          <div className="h-px bg-gray-300 my-2"></div>
                          <p className="flex justify-between">
                            <span>Best possible percentage:</span>
                            <span className="font-bold text-purple-600">
                              {bestPossible}% (if attend all remaining)
                            </span>
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
              
              {/* Recent Attendance Records */}
              {(selectedSubject.attendanceData?.presentList?.length > 0 || selectedSubject.attendanceData?.absentList?.length > 0) && (
                <div>
                  <h3 className="font-semibold text-[#222222] mb-3">Recent Attendance Records</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {[...(selectedSubject.attendanceData.presentList || []), ...(selectedSubject.attendanceData.absentList || [])]
                      .sort((a, b) => {
                        const dateA = a.date.split('-').reverse().join('-');
                        const dateB = b.date.split('-').reverse().join('-');
                        return new Date(dateB) - new Date(dateA);
                      })
                      .slice(0, 15)
                      .map((record, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-[#222222]">{record.date}</p>
                            <p className="text-xs text-gray-500">{record.time}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            record.status === 'Present' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {record.status}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}