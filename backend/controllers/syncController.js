const {scrapeAcademicData} = require("../services/scraper");

const syncData = async(req, res) => {
    try {
        const { studentId, dob } = req.body;

        if(!studentId || !dob) {
            return res.status(400).json({
                success: false,
                message: "studentId and dob are required"
            });
        }

        const data = await scrapeAcademicData({studentId, dob});

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