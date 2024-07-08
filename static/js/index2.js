document.addEventListener('DOMContentLoaded', function() {
  const recordSection = document.getElementById('recordSection');
  const uploadSection = document.getElementById('uploadSection');
  const uploadFileBtn = document.getElementById('uploadFileBtn');
  const recordAudioBtn = document.getElementById('recordAudioBtn');
  const audioElement = document.getElementById('audioElement');
  const startRecordingBtn = document.getElementById('startRecording');
  const pauseRecordingBtn = document.getElementById('pauseRecording');
  const stopRecordingBtn = document.getElementById('stopRecording');
  const uploadButton = document.getElementById('uploadButton');
  const isRecording = document.getElementById('isRecording');
  const translatedText = document.getElementById('Translate-before');

  let mediaRecorder;
  let audioChunks = [];

  // Show the upload section and hide the recording section
  uploadFileBtn.addEventListener('click', () => {
    recordSection.style.display = 'none';
    uploadSection.style.display = 'flex';
  });

  // Show the recording section and hide the upload section
  recordAudioBtn.addEventListener('click', () => {
    uploadSection.style.display = 'none';
    recordSection.style.display = 'flex';
  });


  //uploading file 
  document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var formData = new FormData(this);

    fetch('/upload_audio', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        translatedText.textContent = data.translated_text;
    })
    .catch(error => {
        translatedText.textContent = 'Error: ' + error.message;
    });
});


  // Start recording audio
  startRecordingBtn.addEventListener('click', async () => {
    try {
      // Reset states and previous recordings
      audioChunks = [];
      isRecording.style.display='block';
      isRecording.innerText = "Click start button to record";
      // translatedText.innerText = "Choose an audio file from your system and click on Generate Translation";
      audioElement.src = '';
      uploadButton.disabled = true;
      audioElement.style.display='none';

      // Get user's microphone input
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      isRecording.innerText = "Recording...";
      uploadButton.disabled = false;

      // Store audio data chunks
      mediaRecorder.addEventListener('dataavailable', event => {
        audioChunks.push(event.data);
      });

      // When recording stops, upload the audio and get translation
      mediaRecorder.addEventListener('stop', async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const file = new File([audioBlob], 'recorded_audio.wav', { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio_data', file);
        formData.append('language', document.querySelector('#recordSection select[name="language"]').value);

        try {
          const response = await fetch('/upload_audio', {
            method: 'POST',
            body: formData
          });

          if (response.ok) {
            const data = await response.json();
            // translatedText.style.borderStyle = 'solid';
            // translatedText.style.borderColor = 'white';
            translatedText.innerText = data.translated_text;
          } else {
            console.error('Error:', response.statusText);
            translatedText.innerText = "Error in translation";
          }
        } catch (error) {
          console.error('Error:', error);
          translatedText.innerText = "Error in translation";
        } finally {
          audioChunks = [];
          isRecording.style.display = "none";
          uploadButton.disabled = false;
        }
      });
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  });

  // Pause or resume recording
  pauseRecordingBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      isRecording.innerText = "Paused";
    } else if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      isRecording.innerText = "Recording...";
    }
  });

  // Stop recording
  stopRecordingBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      isRecording.style.display = "none";
    }
  });

  // Update the text to "Processing..." when the form is submitted
  document.getElementById('audioForm').addEventListener('submit', async event => {
    event.preventDefault();
    translatedText.innerText = "Processing...";
    stopRecordingBtn.click(); // Trigger stop recording and form submission
  });

  // Disable the default form submission for the recording form
  document.getElementById('audioForm').addEventListener('submit', event => {
    event.preventDefault();
    stopRecordingBtn.click();
  });
});
