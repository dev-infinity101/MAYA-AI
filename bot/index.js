import express from "express";
const app = express();
app.use(express.json());
// 4. Mount the Native Webhook Router (Stripped 'chat' dependency)
app.post("/api/bot/webhook", async (req, res) => {
    const userMessage = req.body?.message || "Ping";
    const sessionId = req.body?.session_id || "bot_session_1";
    console.log(`[Bot] Received webhook message: "${userMessage}"`);
    try {
        const response = await fetch(process.env.MAYA_API_URL || "http://localhost:8000/api/chat/agent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage, session_id: sessionId }),
        });
        if (!response.ok)
            throw new Error("Backend response not OK");
        const data = await response.json();
        console.log(`[Bot] Sent response: "${data.response?.substring(0, 50)}..."`);
        res.status(200).json({ reply: data.response });
    }
    catch (error) {
        console.error("[Bot] MAYA Backend unreachable", error);
        res.status(500).json({ reply: "⚠️ MAYA core is currently offline or unreachable." });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 MAYA-AI Multi-Platform Bot running on port ${PORT}`);
    console.log(`Webhook endpoint: http://localhost:${PORT}/api/bot/webhook`);
});
