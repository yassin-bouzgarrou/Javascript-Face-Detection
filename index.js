var video = document.querySelector("#videoElement");
var overlay = document.getElementById('overlay');
var faceDetectionOptions = new faceapi.TinyFaceDetectorOptions();

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(webCamsteam);

function webCamsteam() {
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;

                video.addEventListener('play', () => {
                    const canvas = faceapi.createCanvasFromMedia(video);
                    document.body.append(canvas)
                    const displaySize = { width: video.width, height: video.height };
                    faceapi.matchDimensions(canvas, displaySize);

                    setInterval(async () => {
                        const detections = await faceapi.detectAllFaces(video, faceDetectionOptions)
                            .withFaceLandmarks()
                            .withFaceDescriptors()
                            .withFaceExpressions();

                        const resizedDetections = faceapi.resizeResults(detections, displaySize);
                        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                        faceapi.draw.drawDetections(canvas, resizedDetections);
                        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
                        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
                    }, 100);
                });
            })
            .catch(function (error) {
                console.log("Something went wrong: ", error);
            });
    } else {
        console.log("getUserMedia is not supported on your browser");
    }
}
