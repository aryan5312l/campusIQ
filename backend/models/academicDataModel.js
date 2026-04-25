const mongoose = require("mongoose");

const AcademicDataSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    subjects: [
        {
            name: {
                type: String,
                required: true
            },
            courseId: String,
            attendance: {
                type: Number,
                min: 0,
                max: 100
            },
            marks: {
                type: String,
                min: 0
            }
        }
    ],
    syncedAt: {
        type: Date,
        default: Date.now()
    }
}, {timestamps: true});

AcademicDataSchema.index({ userId: 1, syncedAt: -1 });

module.exports = mongoose.model("AcademicData", AcademicDataSchema);