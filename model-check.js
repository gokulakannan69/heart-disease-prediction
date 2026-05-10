
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyAJYUHl81yrbPoWrQtLXfYMdwGRkbPCmCU";
const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
    try {
        // Try the specific string that worked in the past or docs
        console.log("Attempting gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Test");
        console.log("Success:", (await result.response).text());
    } catch (error) {
        console.error("1.5-flash failed:", error.message);
        try {
            console.log("Attempting gemini-pro...");
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent("Test");
            console.log("Success:", (await result.response).text());
        } catch (e) {
            console.error("Pro failed:", e.message);
        }
    }
}

run();
