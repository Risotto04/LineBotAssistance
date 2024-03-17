const { GoogleGenerativeAI } = require("@google/generative-ai");
const dayjs = require("dayjs");
const chalk = require("chalk");
const API_KEY = "AIzaSyBMdeVlKLL_rrup5vxHCKXgp22SEUUqSnk";
const genAI = new GoogleGenerativeAI(API_KEY);
const multimodal = async (imageBinary) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  const prompt = "ช่วยบรรยายภาพนี้ให้หน่อย";
  const mimeType = "image/png";

  const imageParts = [
    {
      inlineData: {
        data: Buffer.from(imageBinary, "binary").toString("base64"),
        mimeType,
      },
    },
  ];

  try {
    const result = await model.generateContent([prompt, ...imageParts]);
    const text = result.response.text();
    return text;
  } catch (e) {
    console.log(
      `🚨🚨🚨 ${chalk.redBright.bold(dayjs().format("DD/MM/YYYY h:mm:ss"))} ${
        e.message
      }`
    );
    return "ไม่สามารถประมวลผลรูปภาพนี้ได้";
  }
};

const chat = async (prompt) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: "สวัสดี",
      },
      {
        role: "model",
        parts: "สวัสดีครับ ผมคือ CoPilot ผู้ช่วยส่วนตัวของคุณ",
      },
      {
        role: "user",
        parts: "คุณคืออะไร",
      },
      {
        role: "model",
        parts:
          "ผม CoPilot เกิดจากการนำ Gemini มาเชื่อมต่อกับ Line Bot\nสำหรับโปรเจกต์วิชา Operating system",
      },
      {
        role: "user",
        parts: "คุณจะช่วยฉันตัดสินใจเรื่องต่าง ๆ และให้คำแนะนำได้",
      },
      {
        role: "model",
        parts:
          "แน่นอนครับ ผมสามารถช่วยคุณตัดสินใจทั้งเรื่องยาก ๆ และเรื่องง่าย ๆ และช่วยแนะนำได้ทุกเรื่องเลยครับ",
      },
    ],
  });

  try {
    const result = await chat.sendMessage(prompt);
    return result.response.text();
  } catch (e) {
    console.log(
      `🚨🚨🚨 ${chalk.redBright.bold(dayjs().format("DD/MM/YYYY h:mm:ss"))} ${
        e.message
      }`
    );
    return "ไม่สามารถประมวลผลข้อความได้";
  }
};

module.exports = { multimodal, chat };
