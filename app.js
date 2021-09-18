const express = require('express')
const cors = require('cors')
const { getVideoDurationInSeconds } = require('get-video-duration')
const randomFile = require('select-random-file')
const app = express();

app.use(cors())

const fs = require('fs')
const exec = require('child_process').exec

let basePath = './media/'

let schedule = []

let startTime = Date.now()
let video = './media/dbz.mp4'
let contentLength = 0


function initSchedule() {
  const mediaFolder = 'test-media/'
  for (let i = 0; i < 1; i++) {
    let startTime = Date.now()
    if (schedule.length > 0) {
      const lastVid = schschedule[schedule.length]
      startTime = lastVid.startTime + lastVid.duration
    }

    let mediaPath = basePath + mediaFolder
    let video = 'test'

    

    randomFile(mediaPath, (err, file) => {
      video = file

      // const vidDetails = fs.statSync(mediaPath + video)
      // console.log(vidDetails)

      exec('wmic datafile where name="E:\\\\Projects\\\\tv-station-server\\\\media\\\\test-media\\\\vid1.mp4" get Size', (err, stdout, stderr) => {
        console.log(stdout)
        console.log(err)
        console.log(stderr)
      })

      getVideoDurationInSeconds(mediaPath + video)
      .then(duration => {
        const newScheduleItem = {
          startTime,
          video,
          mediaFolder,
          duration
        }
  
        // console.log(newScheduleItem)
    
        // schedule.push(newScheduleItem)
      })
    })



  }

  console.log(schedule)
}

initSchedule()

app.get("/", (req, res) => {
  setNewVideo(0)
  res.status(200).send('hiiii')
})

app.get("/schedule", (req, res) => {
  res.json({
    currentVideoStartTime: startTime
  })
})

app.get("/video", (req, res) => {
  const range = req.headers.range;

  if (!range) {
    res.status(400).sendStatus("Requires Range header")
  }

  const mediaFolder = req.query.mediafolder || "";
  const mediaSeason = req.query.mediaseason || "";

  const videoPath = basePath + req.params.mediaFolder + "/" + req.params.video;
  const videoSize = fs.statSync(videoPath).size;

  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  console.log("Content Length ", contentLength)
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
})

app.listen(8000, () => {
  console.log("Listening on port 8000")
})