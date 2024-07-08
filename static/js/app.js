document.getElementById("audioElement").style.display = "none";
document.getElementById("startRecording").addEventListener("click", initFunction);
let isRecording = document.getElementById("isRecording");


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
  isRecording.textContent = "Recording...";
  //
  let audioChunks = [];
  let rec;
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


  // document.getElementById("pauseRecording").addEventListener("click", (e) => {
  //   rec.pause();
  //   // isRecording.textContent = "Click play button to start listening";
  //   // document.getElementById("audioElement").style.display = "block";
  //   // document.getElementById("audioElement").style.margin="auto";
  //   if(pauseRecording){
  //     // rec.resume();
  //     isRecording.textContent = "paused";
  //   }
  //   else{
  //     rec.resume();
  //     isRecording.textContent = "continued";
  //   }


   
  // });
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

 





