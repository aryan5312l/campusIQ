const {scrapeAcademicData} = require("../services/scraper");
const AcademicData = require("../models/academicDataModel");

const syncData = async(req, res) => {
    try {
        const { studentId, dob } = req.user;

        if(!studentId || !dob) {
            return res.status(400).json({
                success: false,
                message: "studentId and dob are required"
            });
        }

        const data = await scrapeAcademicData({studentId, dob});

        if(!data || data.length === 0) {
            throw new Error("No data scraped");
        }

        await AcademicData.create({
            userId: req.user._id,
            subjects: data
        });

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Sync Error: ", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to sync data"
        });
    }
}

module.exports = {syncData};