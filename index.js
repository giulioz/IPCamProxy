const net = require("net");
const express = require("express");
require("dotenv").config();

const ip = process.env.CAMERA_IP;

function commandString(ip, command) {
  return `SET_PARAMETER rtsp://${ip}/onvif1 RTSP/1.0\nCSeq: 50\nContent-length: strlen(Content-type)\nContent-type: ptzCmd:${command}\n`;
}

async function sendCommand(command) {
  return new Promise(resolve => {
    const client = new net.Socket();
    client.connect(554, ip, () => {
      client.write(commandString(ip, command));
    });

    client.on("data", data => {
      console.log(data.toString());
      resolve();
      client.destroy();
    });
  });
}

const app = express();
app.use(express.static("./web/"));

app.get("/left", async (req, res) => {
  await sendCommand("LEFT");
  res.sendStatus(200);
});
app.get("/right", async (req, res) => {
  await sendCommand("RIGHT");
  res.sendStatus(200);
});
app.get("/up", async (req, res) => {
  await sendCommand("UP");
  res.sendStatus(200);
});
app.get("/down", async (req, res) => {
  await sendCommand("DWON");
  res.sendStatus(200);
});

app.listen(8080);
