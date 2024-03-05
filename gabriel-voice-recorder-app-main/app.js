// initFunction function is called when this button is pressed.
document.getElementById("audioElement").style.display = "none";
document.getElementById("startRecording").addEventListener("click", initFunction);
let isRecording = document.getElementById("isRecording");

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
  function startusingBrowserMicrophone(boolean) {
    getUserMedia({ audio: boolean }).then((stream) => {
      handlerFunction(stream);
    });
  }
  startusingBrowserMicrophone(true);
 
  // Pausing handler
  // document.getElementById("pauseRecording").addEventListener("click", (e) => {
  //   rec.pause();
  // });

  // if(pauseRecording === true){
  //   isRecording.textContent = "Paused";
  //   pauseRecording.textContent="Play";;
  //   }
  
  // else{
  //     rec.resume();
  //     isRecording.textContent = "Play";
  //     pauseRecording.textContent="Pause";;
  
  //   }
  //     rec.resume();
  //     isRecording.textContent = "Play";
  //     pauseRecording.textContent="Pause";


  // Stoping handler
  document.getElementById("stopRecording").addEventListener("click", (e) => {
    rec.stop();
    isRecording.textContent = "Click play button to start listening";
    document.getElementById("audioElement").style.display = "block";
    document.getElementById("audioElement").style.margin="auto";

    // document.getElementById("audioElement").style.alignItems = "center"

  });
  
  document.getElementById("pauseRecording").addEventListener("click",pauseRec)

  //pausing
  function pauseRec(){
    if (rec.start()){
      rec.pause();
      isRecording.textContent = "paused";
    }
    else{
      rec.resume();
      isRecording.textContent = "continued";
    }
  }
}

 





