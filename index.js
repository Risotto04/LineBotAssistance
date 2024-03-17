"use strict";
const dayjs = require("dayjs");
const axios = require("axios");
const chalk = require("chalk");
const line = require("@line/bot-sdk");
const express = require("express");
const config = require("./config.json");
const gemini = require("./gemini");
const request = require("request-promise");
const LINE_HEADER = {
  "Content-Type": "application/json",
  Authorization:
    "Bearer NW4enZy5OUQN5Bvm/qsm/0fEtwvHKHEU7fc0ok2yHsFtLKh4mf2RlIjuBj5pZGdt+dAKOqsneUZ3meZ31vyCJHaOl2iqIanIuRwK6QpsPUL2mg6wS1iyy2kEjbDrcj44hconMdtoFlz8+drnpNXqgAdB04t89/1O/w1cDnyilFU=",
};
const app = express();
let nIntervId;
app.post("/webhook", line.middleware(config), (req, res) => {
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }
  stopLoadingAnimation();
  Promise.all(
    req.body.events.map((event) => {
      switch (event.type) {
        case "message":
          const message = event.message;
          console.log(
            `📩📩📩 ${chalk.whiteBright.bold(
              dayjs().format("DD/MM/YYYY h:mm:ss")
            )} ${chalk.cyanBright.underline.bold(event.message.type)} ${
              event.source.userId
            }`
          );
          switch (message.type) {
            case "text":
              return handleText(message, event.replyToken);
            case "image":
              return handleImage(message, event.replyToken);
            default:
              console.log(
                `🚧🚧🚧 ${chalk.yellowBright.bold(
                  dayjs().format("DD/MM/YYYY h:mm:ss")
                )} ${chalk.cyanBright.underline.bold(
                  event.message.type
                )} Messages received must be text or images only.`
              );
              reply(
                event.replyToken,
                "ข้อความที่ได้รับต้องเป็นข้อความหรือรูปภาพเท่านั้น"
              );
              break;
          }
          break;
        default:
          break;
      }
    })
  ).then(() => res.end());
});

async function handleText(message, replyToken) {
  const msg = await gemini.chat(String(message.text));
  await reply(replyToken, msg);
}

async function handleImage(message, replyToken) {
  const LINE_CONTENT_API = "https://api-data.line.me/v2/bot/message";
  let url = `${LINE_CONTENT_API}/${message.id}/content`;
  let buffer = await request.get({
    headers: LINE_HEADER,
    uri: url,
    encoding: null,
  });
  const msg = await gemini.multimodal(buffer);
  await reply(replyToken, msg);
}
const reply = async (token, msg) => {
  try {
    const response = await axios({
      method: "post",
      url: "https://api.line.me/v2/bot/message/reply",
      headers: LINE_HEADER,
      data: { replyToken: token, messages: [{ type: "text", text: msg }] },
    });
    if (response.status === 200) {
      console.log(
        `✅✅✅ ${chalk.greenBright.bold(
          dayjs().format("DD/MM/YYYY h:mm:ss")
        )} Message sent successfully.`
      );
    } else {
      console.log(
        `🚨🚨🚨 ${chalk.redBright.bold(
          dayjs().format("DD/MM/YYYY h:mm:ss")
        )} Unexpected response status: ${response.status}`
      );
    }
  } catch (e) {
    console.log(
      `🚨🚨🚨 ${chalk.redBright.bold(dayjs().format("DD/MM/YYYY h:mm:ss"))} ${
        e.message
      }`
    );
  }
  loadingAnimation();
};
const port = config.port;
app.listen(port, () => {
  console.clear();
  console.log(chalk.greenBright.bold(CoPilot).padStart(10));
  console.log(chalk.magentaBright.underline.bold(`listening on ${port}`));
  loadingAnimation();
});

const CoPilot = `
  __   __     ____                   _   _           _      __   __  
 / /  / /    / ___|   ___    _ __   (_) | |   ___   | |_    \\ \\  \\ \\ 
/ /  / /    | |      / _ \\  | '_ \\  | | | |  / _ \\  | __|    \\ \\  \\ \\
\\ \\  \\ \\    | |___  | (_) | | |_) | | | | | | (_) | | |_     / /  / /
 \\_\\  \\_\\    \\____|  \\___/  | .__/  |_| |_|  \\___/   \\__|   /_/  /_/ 
                            |_|                                      
`;

function loadingAnimation(
  text = "",
  chars = ["⠙", "⠘", "⠰", "⠴", "⠤", "⠦", "⠆", "⠃", "⠋", "⠉"],
  delay = 75,
  colorCodes = ["#32D93D", "#32D9AD", "#32D975", "#32CCD9", "#6BD932"]
) {
  let x = 0;
  let y = 0;
  return (nIntervId = setInterval(function () {
    process.stdout.write(
      chalk.hex(colorCodes[y++]).bold(`${"\r" + chars[x++] + " " + text}`)
    );
    x = x % chars.length;
    y = y % colorCodes.length;
  }, delay));
}
function stopLoadingAnimation() {
  clearInterval(nIntervId);
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
}
