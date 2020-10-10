const form = document.querySelector('form')

form.addEventListener('submit', (e) => {
  e.preventDefault()

  const files = document.querySelector('[type=file]').files
  const formData = new FormData()

  for (let i = 0; i < files.length; i++) {
    let file = files[i]

    formData.append('myFile', file)
  }

  console.log(formData.getAll('myFile'));

  fetch("http://127.0.0.1:3000/", {
    method: 'POST',
    body: formData,
  }).then((response) => {
		return response.json()
	}).then((res) => {
		const jsonResponse = res
		console.log('json REsponse:', jsonResponse);
    console.log('zzzz', JSON.stringify(res))

		/*
			var audio = new Audio('https://github.com/magenta/lofi-player/blob/master/samples/guitar-acoustic/A2.mp3');
			audio.play();
			src: ['https://raw.githubusercontent.com/magenta/lofi-player/master/samples/guitar-acoustic/A2.mp3'],
		*/

		var sound = new Howl({
			src: res,
			volume: 0.5,
				onend: function () {
				alert('Yeet!');
			}
		});
		sound.play()
  })
})
