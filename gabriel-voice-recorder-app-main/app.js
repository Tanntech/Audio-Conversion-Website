// initFunction function is called when this button is pressed.
document.getElementById("audioElement").style.display = "none";
document.getElementById("startRecording").addEventListener("click", initFunction);
let isRecording = document.getElementById("isRecording");

// Global variable to track recording state
let isPaused = false;

// function getUserMedia makes use of the MediaDevices and that uses legacy api
function initFunction() {
  // Display recording
  async function getUserMedia(constraints) {
    if (window.navigator.mediaDevices) { 
      return window.navigator.mediaDevices.getUserMedia(constraints);
    }
    let legacyApi =
      navigator.getUserMedia ||  
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;
    if (legacyApi) {
      return new Promise(function (resolve, reject) {
        legacyApi.bind(window.navigator)(constraints, resolve, reject);
      });
    } else {
      alert("user api not supported");
    }
  }

  // ISRECORDING notification
  isRecording.textContent = "Recording...";

  //MediaRecorder object :- rec
  let audioChunks = [];  //reaceives recorded audio
  let rec;

  //function introduced handlerfunc rec->inactive recording stops send Blob obj for recorded to audo element ID
  function handlerFunction(stream) {
    rec = new MediaRecorder(stream);
    rec.start();
    rec.ondataavailable = (e) => {
      audioChunks.push(e.data);
      if (rec.state == "inactive") {
        let blob = new Blob(audioChunks, { type: "audio/mp3" });
        console.log(blob);
        document.getElementById("audioElement").src = URL.createObjectURL(blob);
      }
    };
  }

  // permission access for using microphone automatically
  function startUsingBrowserMicrophone(boolean) {
    getUserMedia({ audio: boolean }).then((stream) => {
      handlerFunction(stream);
    });
  }
  startUsingBrowserMicrophone(true);
 
  // Pausing handler
  document.getElementById("pauseRecording").addEventListener("click", pauseRec);

  function pauseRec() {
    if (!isPaused) {
      rec.pause();
      isPaused = true;
      isRecording.textContent = "Paused";
      document.getElementById("pauseRecording").textContent = "Resume";
    } else {
      rec.resume();
      isPaused = false;
      isRecording.textContent = "Recording...";
      document.getElementById("pauseRecording").textContent = "Pause";
    }
  }

  // Stoping handler
  document.getElementById("stopRecording").addEventListener("click", stopRec);

  function stopRec() {
    rec.stop();
    isRecording.textContent = "Click start button to record";
    document.getElementById("audioElement").style.display = "block";
    document.getElementById("audioElement").style.margin = "auto";
  }
}
