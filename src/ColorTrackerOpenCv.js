export class ColorTrackerOpenCv {
  constructor(videoElement, canvasOutput) {
    this.url = 'https://docs.opencv.org/4.8.0/opencv.js'
    this.videoElement = videoElement
    this.canvasOutput = canvasOutput

    this.colorModels = {
      red: { lower: [0, 89, 211, 255], upper: [5, 255, 255, 255] },
      green: { lower: [35, 42, 206, 255], upper: [74, 255, 255, 255] },
      blue: { lower: [104, 140, 153, 255], upper: [120, 255, 255, 255] },
      cyan: { lower: [86, 93, 207, 255], upper: [97, 255, 255, 255] },
      magenta: { lower: [143, 53, 210, 255], upper: [157, 255, 255, 255] },
      yellow: { lower: [25, 23, 218, 255], upper: [36, 255, 255, 255] },
      white: { lower: [0, 0, 237, 255], upper: [180, 4, 255, 255] },
    }
    this.minBlobAreaPercent = 0.0
    this.maxBlobAreaPercent = 0.009
    this.minBlobArea = null
    this.maxBlobArea = null
    this.blurSize = 5
    this.selectedColors = ['red', /*'green', 'blue', 'cyan', 'magenta', 'yellow',*/ 'white']

    return this
  }

  loadOpenCv(onloadCallback) {
    // Dynamically load OpenCV.js module
    const script = document.createElement('script')
    script.src = this.url
    script.async = true
    script.onload = this.opencvIsReady.bind(this)
    this.onloadCallback = onloadCallback
    document.head.appendChild(script)
  }

  async opencvIsReady() {
    this.facingMode = 'environment' //isUser ? 'user' : 'environment'

    const deviceList = await navigator.mediaDevices.enumerateDevices()
    this.cameraList = deviceList.filter((device) => device.kind === 'videoinput')
    const defaultId = this.cameraList.length > 1 ? 1 : 0
    this.deviceInfo = this.cameraList[defaultId]

    // Access the webcam and start tracking
    navigator.mediaDevices
      .getUserMedia({
        video: {
          deviceId: { exact: this.deviceInfo.deviceId, facingMode: this.facingMode },
          width: { ideal: 4096 },
          height: { ideal: 2160 },
        },
      })
      .then((stream) => {
        this.videoElement.srcObject = stream

        const stream_settings = stream.getVideoTracks()[0].getSettings()

        // actual width & height of the camera video
        this.stream_width = stream_settings.width
        this.stream_height = stream_settings.height
        this.stream_area = this.stream_width * this.stream_height

        this.onloadCallback()

        // Wait for the video to start playing
        this.videoElement.onplay = () => {
          // Start the tracking process here
          this.startTracking()
        }
      })
      .catch((error) => {
        console.error('getUserMedia error: ', error)
      })
  }

  gaussianBlur(src, size = 21) {
    // Gaussian blur objects
    const ksize = new cv.Size(size, size)
    const anchor = new cv.Point(-1, -1)
    let blur = new cv.Mat(src.rows, src.cols, cv.CV_8UC4)
    cv.blur(src, blur, ksize, anchor, cv.BORDER_DEFAULT)
    return blur
  }

  videoToHsv(src) {
    let dst = new cv.Mat(src.rows, src.cols, cv.CV_8UC3)
    // Convert the frame to HSV color space
    cv.cvtColor(src, dst, cv.COLOR_RGBA2BGR)
    cv.cvtColor(dst, dst, cv.COLOR_BGR2HSV)
    return dst
  }

  inRange(src, lower, upper) {
    const mask = new cv.Mat()
    // Upper and lower bound need to be the same size as destination mat.  They also need to be mat, even though some AI think they need to be scalar
    const lowerBound = new cv.Mat(src.rows, src.cols, src.type(), lower)
    const upperBound = new cv.Mat(src.rows, src.cols, src.type(), upper)
    cv.inRange(src, lowerBound, upperBound, mask)
    lowerBound.delete()
    upperBound.delete()
    return mask
  }

  getBlobs(mask) {
    const contours = new cv.MatVector()
    const hierarchy = new cv.Mat()
    cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    hierarchy.delete()
    const result = []
    for (let i = 0; i < contours.size(); i++) {
      let blob = contours.get(i)
      let area = cv.contourArea(blob, false)
      result.push({
        blob,
        area,
      })
    }
    contours.delete()
    return result
  }

  processBlobs() {
    let output = []
    this.cap.read(this.src)
    // Blur source to remove noise
    let blur = this.gaussianBlur(this.src, this.blurSize)
    // Convert the frame to HSV color space
    let dst = this.videoToHsv(blur)
    blur.delete()

    this.minBlobArea = Math.round((this.minBlobAreaPercent / 100) * this.stream_area)
    this.maxBlobArea = Math.round((this.maxBlobAreaPercent / 100) * this.stream_area)

    this.selectedColors.forEach((color) => {
      let model = this.colorModels[color]
      // Create a mask to isolate the color within the specified range
      let mask = this.inRange(dst, model.lower, model.upper)
      // Get blobs
      let blobs = this.getBlobs(mask)

      mask.delete()

      const avgRGB = averageHsvColorToRgb(model.lower, model.upper)
      //console.log(hsvToRgb(...model.lower), avgRGB, hsvToRgb(...model.upper))
      const rectangleColor = new cv.Scalar(...avgRGB, 255)

      blobs.forEach((blob) => {
        if (blob.area >= this.minBlobArea && blob.area <= this.maxBlobArea) {
          let rect = cv.boundingRect(blob.blob)
          // let point1 = new cv.Point(rect.x, rect.y);
          // let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
          output.push({
            color: rectangleColor,
            rect: rect,
            area: blob.area,
          })

          // cv.rectangle(src, point1, point2, rectangleColor, 2, cv.LINE_AA, 0)
        }
      })
    })

    dst.delete()

    return output
  }

  showBlobArea() {
    // Make rectangles for min and max blob area
    let offset = 10
    let minSquare = Math.sqrt(this.minBlobArea)
    let maxSquare = Math.sqrt(this.maxBlobArea)
    let delta = maxSquare - minSquare
    let minColor = new cv.Scalar(255, 0, 0, 255)
    let minPoint1 = new cv.Point(offset + delta / 2, offset + delta / 2)
    let minPoint2 = new cv.Point(minSquare + offset + delta / 2, minSquare + offset + delta / 2)
    let maxPoint1 = new cv.Point(offset, offset)
    let maxPoint2 = new cv.Point(maxSquare + offset, maxSquare + offset)
    let maxColor = minColor
    cv.rectangle(this.src, minPoint1, minPoint2, minColor, 1, cv.LINE_AA, 0)
    cv.rectangle(this.src, maxPoint1, maxPoint2, maxColor, 1, cv.LINE_AA, 0)
  }

  frameRate(timestamp) {
    if (!this.startTime) this.startTime = timestamp
    // Calculate elapsed time in milliseconds using performance.now()
    const currentTime = performance.now()
    //this.elapsedTime = currentTime - this.startTime
    if (!this.timeLast) this.timeLast = currentTime
    this.elapsedTime = currentTime - this.timeLast
    this.timeLast = currentTime
    this.fps = Number((1000 / this.elapsedTime).toFixed(2))
    //this.fps = Number(((1000 * this.frameNumber) / this.elapsedTime).toFixed(2))
    this.frameNumber++
  }

  // Function to start the color tracking process
  startTracking() {
    this.startTime = null
    this.frameNumber = 0
    this.elapsedTime = 0
    // Create a video capture object
    this.cap = new cv.VideoCapture(this.videoElement)
    // Create Mat objects to store video frames
    this.src = new cv.Mat(this.stream_height, this.stream_width, cv.CV_8UC4)
    //
    // Main video processing loop
    const processVideo = (timestamp) => {
      // Compute Frame Rate
      this.frameRate(timestamp)
      // Find blobs
      let found = this.processBlobs()
      // Draw rectangles around blobs
      found.forEach((blob) => {
        let point1 = new cv.Point(blob.rect.x, blob.rect.y)
        let point2 = new cv.Point(blob.rect.x + blob.rect.width, blob.rect.y + blob.rect.height)
        cv.rectangle(this.src, point1, point2, blob.color, 2, cv.LINE_AA, 0)
      })
      // Show min/max blob area
      this.showBlobArea()
      // Show image on canvas
      cv.imshow(this.canvasOutput, this.src)
      //
      // Request the next animation frame
      requestAnimationFrame(processVideo)
    }
    //
    // Start the video processing loop
    processVideo()
  }
}

//
// ----------------
// ----------------
// Helper functions
// ----------------
// ----------------
function hsvToRgb(h, s, v, a) {
  // Ensure h is between 0 and 360, and s and v are between 0 and 1
  h *= 2 // input hue is 0-180. Convert to 0-360
  s /= 255
  v /= 255

  h = ((h % 360) + 360) % 360
  s = Math.max(0, Math.min(1, s))
  v = Math.max(0, Math.min(1, v))

  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c

  let r, g, b

  if (h >= 0 && h < 60) {
    r = c
    g = x
    b = 0
  } else if (h >= 60 && h < 120) {
    r = x
    g = c
    b = 0
  } else if (h >= 120 && h < 180) {
    r = 0
    g = c
    b = x
  } else if (h >= 180 && h < 240) {
    r = 0
    g = x
    b = c
  } else if (h >= 240 && h < 300) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }

  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}

// Function to calculate the average HSV color between two HSV colors
function averageHsvColorToRgb(hsvColor1, hsvColor2) {
  // Convert HSV colors to RGB
  const rgbColor1 = hsvToRgb(...hsvColor1)
  const rgbColor2 = hsvToRgb(...hsvColor2)

  // Calculate the average RGB color
  const avgRgbColor = [
    Math.round((rgbColor1[0] + rgbColor2[0]) / 2),
    Math.round((rgbColor1[1] + rgbColor2[1]) / 2),
    Math.round((rgbColor1[2] + rgbColor2[2]) / 2),
  ]

  // Convert the average RGB color back to HSV if needed
  // const avgHsvColor = rgbToHsv(...avgRgbColor);

  return avgRgbColor // Return the average RGB color
}
