export const tableElement = document.getElementById('songs-table'); // таблица песен
export let songsDataArray = null;

// при старте страницы
loadSongs();
window.uploadFile = uploadFile; // функция доступна глобально

// запрос на сервер для получения всех песен
async function loadSongs() {
  tableElement.innerHTML = 'Loading tracks...';
  try {
    const response = await fetch('http://localhost:8080/api/songs/all');
    songsDataArray = await response.json();
  } catch (error) {
    console.log(error);
  }
  displaySongs(tableElement, songsDataArray);
}

// функция заполнения таблицы данными треков
function displaySongs(table, data) {
  table.innerHTML = '';

  if (data !== null) {
    table.innerHTML = `
      <tr style="text-align: left">
        <th width="30" style="color: seashell; text-align: center">#</th>
        <th width="350" style="color: seashell">Title</th>
        <th width="350" style="color: seashell; text-align: center">Duration</th>
      </tr>
    `;

    for (let i = 0; i < data.length; i++) {
      table.insertAdjacentHTML(
        'beforeend',
        `
          <tr class="song-row" data-id=${data[i].id} style="color: seashell; text-align: left;">
            <td class="song-id" data-id="${data[i].id}" style="text-align: center;">${data[i].id}</td>
            <td>
              <div style="display: flex; align-items: center;">
                <img src="data:image/jpeg;base64,${data[i].cover}" style="width: 30px; height: 30px; margin-right: 10px;"/>
                <div style="display: flex; flex-direction: column;">
                  <div class="song-title" data-id=${data[i].id} style="font-weight: bold; cursor: pointer;">${data[i].title}</div>
                  <div style="font-size: 0.9em; cursor: pointer;">${data[i].artist}</div>
                </div>
              </div>
            </td>
            <td style="text-align: center;">${data[i].duration}</td>
          </tr>
        `
      );
    }
  } else {
    table.innerHTML = 'There are not songs yet';
  }
}

// функция загрузки треков на сервер
function uploadFile() {
  const form = document.getElementById('upload-form');
  const fileInput = document.getElementById('file');
  const files = fileInput.files;

  const formData = new FormData(form);

  for (const file of files) {
    formData.append('files', file);
  }

  fetch('http://localhost:8080/api/songs/upload', {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.text()) // преобразование ответа в текст
    .then(() => {
      alert('Song uploaded successfully!');
      form.reset();
      loadSongs();
    })
    .catch((error) => console.error('Error: ', error));
}
