async function fetchAudio() {
  const res = await fetch('http://localhost:3000/api/generate-all-audio');
  const data = await res.json();
  console.log(data);
}
fetchAudio();