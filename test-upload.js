import fs from 'fs';

async function test() {
  const form = new FormData();
  form.append('sceneId', '1');
  const fileBlob = new Blob([fs.readFileSync('./package.json')]);
  form.append('audio', fileBlob, 'package.json');

  try {
    const res = await fetch('http://localhost:3000/api/upload-audio', {
      method: 'POST',
      body: form,
    });
    console.log(res.status);
    console.log(await res.text());
  } catch (e) {
    console.error(e);
  }
}
test();
