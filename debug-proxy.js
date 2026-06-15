const fetch = require('node-fetch');
const url = 'https://tonejs.github.io/audio/drum-samples/CR78/kick.mp3';
fetch(url).then(res => {
    console.log('Status:', res.status);
    console.log('Headers:', res.headers.raw());
    return res.arrayBuffer();
}).then(buf => console.log('Buffer length:', buf.byteLength)).catch(err => console.error(err));
