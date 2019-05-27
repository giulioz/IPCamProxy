const { Socket } = require("net");
const { spawn } = require("child_process");
const express = require("express");
require("dotenv").config();

const vlcProcess = spawn("vlc", [
  "-Idummy",
  `rtsp://${process.env.CAMERA_IP}/onvif1`,
  "--sout",
  `#transcode{vcodec=theo,vb=1024,scale=1,channels=1,ab=128,samplerate=44100}:http{mux=ogg,dst=:${
    process.env.VIDEO_PORT
  }/}`
]);
vlcProcess.stdout.on("data", data => {
  console.log(data.toString());
});
vlcProcess.stderr.on("data", data => {
  console.error(data.toString());
});

function commandString(ip, command) {
  return `SET_PARAMETER rtsp://${ip}/onvif1 RTSP/1.0\nCSeq: 50\nContent-length: strlen(Content-type)\nContent-type: ptzCmd:${command}\n`;
}

async function sendCommand(command) {
  return new Promise(resolve => {
    const client = new Socket();
    client.connect(554, process.env.CAMERA_IP, () => {
      client.write(commandString(process.env.CAMERA_IP, command));
    });

    client.on("data", data => {
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

app.listen(process.env.API_PORT);
// vlcProcess.kill("SIGTERM");
