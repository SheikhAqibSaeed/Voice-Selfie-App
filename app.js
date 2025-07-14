// Elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const selfiePreview = document.getElementById('selfiePreview');
const takeSelfieBtn = document.getElementById('takeSelfie');
const startRecordingBtn = document.getElementById('startRecording');
const stopRecordingBtn = document.getElementById('stopRecording');
const audioPreview = document.getElementById('audioPreview');
const downloadBtn = document.getElementById('downloadBtn');
// const uploadBtn = document.getElementById('uploadBtn');

let videoStream = null;
let audioStream = null;
let mediaRecorder = null;
let audioChunks = [];
let selfieBlob = null;
let audioBlob = null;

// Start camera
async function startCamera() {
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = videoStream;
  } catch (err) {
    alert('Could not access camera: ' + err.message);
  }
}

// Take selfie
function takeSelfie() {
  if (!videoStream) return;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.toBlob(blob => {
    selfieBlob = blob;
    selfiePreview.src = URL.createObjectURL(blob);
    selfiePreview.style.display = 'block';
    downloadBtn.disabled = !(selfieBlob && audioBlob);
    // uploadBtn.disabled = !(selfieBlob && audioBlob);
  }, 'image/png');
}

takeSelfieBtn.addEventListener('click', takeSelfie);

// Start audio recording
async function startRecording() {
  try {
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(audioStream);
    audioChunks = [];
    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
      audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      audioPreview.src = URL.createObjectURL(audioBlob);
      audioPreview.style.display = 'block';
      downloadBtn.disabled = !(selfieBlob && audioBlob);
      // uploadBtn.disabled = !(selfieBlob && audioBlob);
    };
    mediaRecorder.start();
    startRecordingBtn.disabled = true;
    stopRecordingBtn.disabled = false;
  } catch (err) {
    alert('Could not access microphone: ' + err.message);
  }
}

// Stop audio recording
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    audioStream.getTracks().forEach(track => track.stop());
    startRecordingBtn.disabled = false;
    stopRecordingBtn.disabled = true;
  }
}

startRecordingBtn.addEventListener('click', startRecording);
stopRecordingBtn.addEventListener('click', stopRecording);

// Download selfie and audio
function downloadFiles() {
  if (selfieBlob) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(selfieBlob);
    a.download = 'selfie.png';
    a.click();
  }
  if (audioBlob) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(audioBlob);
    a.download = 'voice.webm';
    a.click();
  }
}

downloadBtn.addEventListener('click', downloadFiles);

// Optionally, implement upload logic here
// uploadBtn.addEventListener('click', async () => {
//   if (!(selfieBlob && audioBlob)) return;
//   const formData = new FormData();
//   formData.append('selfie', selfieBlob, 'selfie.png');
//   formData.append('audio', audioBlob, 'voice.webm');
//   await fetch('/upload', { method: 'POST', body: formData });
// });

// Initialize
startCamera(); 