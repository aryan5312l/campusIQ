const puppeteer = require("puppeteer")

const scrapeAcademicData = async () => {
    const browser = await puppeteer.launch({
        headless: false //False for debugging
    });

    const page = await browser.newPage();
    const BASE_URL = "https://parents.nie.ac.in/";

    try {
        await page.goto(`${BASE_URL}index.php`, { waitUntil: "networkidle2" });

        //Fill the details
        await page.type("#username", "4NI23IS051");
        const dob = "2003-09-11";
        const [year, month, day] = dob.split("-");

        await page.select("#dd", day.padStart(2, "0") + " ");
        await page.select("#mm", month.padStart(2, "0"));
        await page.select("#yyyy", year);

        //Click on login
        await Promise.all([
            page.click(".cn-submit1"),
            page.waitForNavigation()
        ])

        console.log("Logged In successfully...");

        //Extracing Subjects
        const subjects = await page.evaluate(() => {
            const data = [];

            document.querySelectorAll("tbody tr").forEach(row => {
                const cols = row.querySelectorAll("td");

                const courseId = cols[0]?.innerText.trim();
                const name = cols[1]?.innerText.trim();

                const attendanceLink = cols[3]?.querySelector("a")?.getAttribute("href");

                data.push({ courseId, name, attendanceLink });
            })
            return data;
        })

        subjects.forEach(subject => {
            if (subject.attendanceLink) {
                subject.attendanceLink = BASE_URL + subject.attendanceLink;
            }
        })

        //Subjects are extracted
        console.log(subjects);


        //Attendance are extracted
        // 🔥 Attendance extraction using CLICK (correct approach)

        const subjectsData = [];

        const rowsCount = await page.$$eval("tbody tr", rows => rows.length);

        for (let i = 0; i < rowsCount; i++) {

            // Re-fetch rows every iteration (VERY IMPORTANT)
            const rows = await page.$$("tbody tr");
            const row = rows[i];

            const courseId = await row.$eval("td:nth-child(1)", el => el.innerText.trim());
            const name = await row.$eval("td:nth-child(2)", el => el.innerText.trim());

            const attendanceBtn = await row.$("td:nth-child(4) a");

            // Click attendance button
            await Promise.all([
                attendanceBtn.click(),
                page.waitForNavigation({ waitUntil: "networkidle2" })
            ]);

            // Wait for attendance page
            await page.waitForSelector(".cn-legend");

            // Extract data
            await page.waitForSelector(".cn-legend span")
            const attendanceData = await page.evaluate(() => {
                const summary = { present: 0, absent: 0, remaining: 0 };

                document.querySelectorAll(".cn-legend span").forEach(el => {
                    const text = el.innerText.trim();

                    //Extract number safely
                    const rawText = el.innerText.replace(/\s+/g, ' ').trim();
                    const match = rawText.match(/\[(\d*)\]/);
                    const value = match && match[1] ? parseInt(match[1], 10) : 0;

                    //page.on('console', msg => console.log('PAGE LOG:', msg.text()));

                    if (rawText.toLowerCase().includes("present")) {
                        summary.present = value;
                    } else if (rawText.toLowerCase().includes("absent")) {
                        summary.absent = value;
                    } else if (rawText.toLowerCase().includes("still")) {
                        summary.remaining = value;
                    }
                });

                const presentList = [];
                document.querySelectorAll(".cn-attend-list1 tbody tr").forEach(row => {
                    const cols = row.querySelectorAll("td");

                    presentList.push({
                        date: cols[1]?.innerText.trim(),
                        time: cols[2]?.innerText.trim(),
                        status: cols[3]?.innerText.trim()
                    });
                });

                const absentList = [];
                document.querySelectorAll(".cn-attend-list2 tbody tr").forEach(row => {
                    const cols = row.querySelectorAll("td");

                    absentList.push({
                        date: cols[1]?.innerText.trim(),
                        time: cols[2]?.innerText.trim(),
                        status: cols[3]?.innerText.trim()
                    });
                });

                return {
                    summary,
                    presentList,
                    absentList
                };
            });

            subjectsData.push({
                courseId,
                name,
                attendanceData
            });

            console.log(`Done: ${name}`);

            // 🔥 Go back safely
            await Promise.all([
                page.goBack(),
                page.waitForSelector("tbody tr")
            ]);
        }

        console.log(JSON.stringify(subjectsData, null, 2));


    } catch (error) {
        console.error("failed to scrap: ", error);
    } finally {
        await browser.close();
    }
}


scrapeAcademicData();

module.exports = { scrapeAcademicData };