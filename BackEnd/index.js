const express = require('express')
const cors = require('cors')
const app = express()
const axios = require('axios')
const port = 3000

// Imports the Google Cloud client libraries
const vision = require('@google-cloud/vision');
const fs = require('fs');


const fileupload = require('express-fileupload');
const { resolve } = require('path');

app.use(cors())
app.use(fileupload())

var counter = 0;
app.post('/', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  if (Array.isArray(req.files.myFile)) {
    const schemes = [];
    const promises = [];
    req.files.myFile.forEach((file) => {
      const name = `${counter++}.jpg`;
      promises.push(
        new Promise(resolve => {
          // Use the mv() method to place the file somewhere on your server
          file.mv(`./${name}`, async function (err) {
            if (err) { return res.status(500).send(err); }
            const s = await colorScheme(name)
            schemes.push(s)
            resolve()
          });
        })
      )
    })
    Promise.all(promises).then(()=>{
      res.send(schemes);
    })
  } else {
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let myFile = req.files.myFile;

    const name = `${counter++}.jpg`;

    // Use the mv() method to place the file somewhere on your server
    myFile.mv(`./${name}`, async function (err) {
      if (err) {
        return res.status(500).send(err);
      }
      const scheme = await colorScheme(name)
			const audioFile = await getAudioFileFromHexValue(scheme)

			console.log('audiofile:', audioFile);
			res.send([audioFile]);
      //res.send({'file': audioFile});
    });
  }

})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

/* Convert RGB to Hex */
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

/* Color Vision API */
async function colorScheme(filename) {
  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  const fileName = filename || './bike.png';

  // Performs property detection on the local file
  const [result] = await client.imageProperties(fileName);
  const colors = result.imagePropertiesAnnotation.dominantColors.colors;
  colors.sort((b, a) => {
    return a.score - b.score
  })

  const schemes = []
  for (var i = 0; i < colors.length; i++) {
    if (i >= 3) {
      break;
    }
    schemes.push(colors[i]);
  }

  const rgb = []
  const index = 0
  rgb[0] = rgbToHex(schemes[0].color.red, schemes[0].color.green, schemes[0].color.blue);
  /*for (var i = 0; i < schemes.length; i++) {
    rgb[i] = rgbToHex(schemes[i].color.red, schemes[i].color.green, schemes[i].color.blue);
  }*/

  console.log(rgb[0]); // prints top color in image as hexadecimal
  return rgb[0];
}
//const rgb = colorScheme();

const ip = 'http://127.0.0.1:5000'

const sound_ip = 'http://127.0.0.1:8000/'

calmingColors = ['red', 'orange', 'violet']
sadColors = ['blue', 'purple']
urbanColors = ['black', 'gray', 'brown']
upbeatColors = ['green', 'yellow']

function getAudioFileFromColor(color) {
	if (calmingColors.includes(color)) {
		return sound_ip + 'Calming.MP3'		
	}
	else if (sadColors.includes(color)) {
		return sound_ip + 'Sad.MP3'		
	}
	else if (urbanColors.includes(color)) {
		return sound_ip + 'Urban.MP3'		
	}
	return sound_ip + 'Upbeat.MP3'
	//return 'http://127.0.0.1:8000/Sad.MP3'
}


async function getAudioFileFromHexValue(hex_value) {
	return await axios.post(ip+'/convert_to_color', {'hex_value': hex_value}).then(response => {
		const color = response.data;
		return getAudioFileFromColor(color);
	});
}



/* Objects
async function asynch() {
  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  const fileName = `./forrest-1.jpg`;
  const request = {
    image: {content: fs.readFileSync(fileName)},
  };
  const [result] = await client.objectLocalization(request);
  const objects = result.localizedObjectAnnotations;
  objects.forEach(object => {
    console.log(`Name: ${object.name}`);
    console.log(`Confidence: ${object.score}`);
    const vertices = object.boundingPoly.normalizedVertices;
    vertices.forEach(v => console.log(`x: ${v.x}, y:${v.y}`));
  });
}

asynch();

Landmarks
async function landmark() {
  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  const bucketName = 'my-bucket';
  const fileName = './bike.jpeg';

  // Performs landmark detection on the gcs file
  const [result] = await client.landmarkDetection(
    `gs://${bucketName}/${fileName}`
  );
  const landmarks = result.landmarkAnnotations;
  console.log('Landmarks:');
  landmarks.forEach(landmark => console.log(landmark));
}

landmark();
*/
