const {scrapeAcademicData} = require("../services/scraper");
const AcademicData = require("../models/academicDataModel");

const syncData = async(req, res) => {
    try {
        const { studentId, dob } = req.user;

        if(!studentId || !dob) {
            console.error("Missing studentId or dob:", { studentId, dob, user: req.user });
            return res.status(400).json({
                success: false,
                message: "studentId and dob are required"
            });
        }

        // Check if user synced within last 30 minutes
        const latestData = await AcademicData.findOne({ userId: req.user._id }).sort({ syncedAt: -1 });
        if (latestData) {
            const now = new Date();
            const lastSync = new Date(latestData.syncedAt);
            const diffMinutes = (now - lastSync) / (1000 * 60);
            if (diffMinutes < 30) {
                return res.status(429).json({
                    success: false,
                    message: `Sync is allowed only once every 30 minutes. Please try again in ${Math.ceil(30 - diffMinutes)} minutes.`
                });
            }
        }

        const data = await scrapeAcademicData({studentId, dob});

        if(!data || data.length === 0) {
            throw new Error("No data scraped");
        }

        const academicRecord = await AcademicData.create({
            userId: req.user._id,
            subjects: data
        });

        return res.status(200).json({
            success: true,
            data: academicRecord
        });
    } catch (error) {
        console.error("Sync Error: ", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to sync data"
        });
    }
}

module.exports = {syncData};