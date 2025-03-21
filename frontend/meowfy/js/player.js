import { songsDataArray } from './scripts.js'; // массив песен
import { tableElement } from './scripts.js'; // таблица песен

// lower interface
const playPauseButton = document.getElementById('play-pause-btn');
const previousBtn = document.getElementById('previous-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');

// image element for play or pause
const playPauseImageElement = document.getElementById('play-pause-img');

// play image
const playImageElement = document.createElement('img');
const playImageSrc = '../images/play.png';
playImageElement.src = playImageSrc;
playImageElement.alt = `play button`;
playImageElement.style.width = '20px';
playImageElement.style.height = '20px';

// pause image
const pauseImageElement = document.createElement('img');
const pauseImageSrc = '../images/pause.png';
pauseImageElement.src = pauseImageSrc;
pauseImageElement.alt = 'pause button';
pauseImageElement.style.width = '20px';
pauseImageElement.style.height = '20px';

// playing gif
const playingGifElement = document.createElement('img');
playingGifElement.src = '../gifs/playing.gif';
playingGifElement.alt = 'playing gif';
playingGifElement.style.width = '20px';
playingGifElement.style.height = '20px';

const audio = new Audio();
// изначальный индекс
let currentSongIndex = -1;

// флаги состояния для обработки момента включения трека из таблицы
let isClickInProcess = false;
let isMouseOver = false;

// --- FUNCTIONS ---

// функция запроса песни с сервера, возвращает url песни
async function getSongFromServer(index) {
  try {
    const id = index + 1; // запрос происходит по id в базе данных
    const response = await fetch(`http://localhost:8080/api/songs/play/${id}`);
    const audioBytes = await response.arrayBuffer();
    const audioBlob = new Blob([audioBytes], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl;
  } catch (error) {
    console.log(error);
  }
}

// функция воспроизведения новой песни
async function playNewSong(index) {
  const audioUrl = await getSongFromServer(index);
  audio.src = audioUrl;
  audio.play();
}

// функция изменения нижнего интерфейса в зависимости от состояния audio
function modifyLowerInterface(mode, imageElement) {
  mode === 1
    ? (imageElement.src = pauseImageSrc)
    : (imageElement.src = playImageSrc);
}

// функция-замыкание для регулировки песни кнопкой play/pause (lower interface)
function changeMode(mode) {
  return function () {
    mode === 1 ? audio.play() : audio.pause();
    modifyLowerInterface(mode, playPauseImageElement);
    modifyTableInterface(mode, currentSongIndex);
  };
}

// функция, возвращающая элемент указанных класса и индекса
function getElementOfSong(elementClass, index) {
  return document.querySelector(`.${elementClass}[data-id="${index + 1}"]`);
}

// функция разных режимов табличного интерфейса
function modifyTableInterface(mode, newIndex, oldIndex = null) {
  // если есть предыдущая песня, то для нее white id + white title
  if (oldIndex !== null) updateIdAndTitle(oldIndex, 'seashell', 'seashell');

  switch (mode) {
    case 0: // Pausing (green id + green title)
      updateIdAndTitle(newIndex, 'green', 'green');
      break;
    case 1: // Playing (playingGif + green title)
      updateIdAndTitle(newIndex, playingGifElement, 'green');
      break;
    case 2: // Default (white id + white title)
      updateIdAndTitle(newIndex, 'seashell', 'seashell');
      break;
    case 3: // MouseOverOnNonPlayingSong (playBtn + white title)
      updateIdAndTitle(newIndex, playImageElement, 'seashell');
      break;
    case 4: // MouseOverOnPausedSong (playBtn + green title)
      updateIdAndTitle(newIndex, playImageElement, 'green');
      break;
    case 5: // MouseOverOnPlayingSong (pauseBtn + green title)
      updateIdAndTitle(newIndex, pauseImageElement, 'green');
      break;
  }
}

// функция изменения табличного интерфейса
function updateIdAndTitle(index, content, titleColor) {
  const idElement = getElementOfSong('song-id', index);
  const titleElement = getElementOfSong('song-title', index);

  // id
  if (content === 'green' || content === 'seashell') {
    idElement.textContent = index + 1;
    idElement.style.color = content;
  } else {
    idElement.replaceChildren(content);
  }

  // title
  titleElement.style.color = titleColor;
}

// --- EVENT LISTENERS ---

// listener клика по button play/pause (lower interface)
playPauseButton.addEventListener('click', () => {
  handlePlayPauseButton(currentSongIndex);
});

// функция-обработчик
async function handlePlayPauseButton(index) {
  // если песня не выбрана, будет включена первая
  if (index === -1) {
    currentSongIndex = 0;
    await playNewSong(currentSongIndex); // f включения новой песни
    modifyLowerInterface(1, playPauseImageElement); // f изменения нижнего интерфейса
    modifyTableInterface(1, currentSongIndex); // f изменения табличного интерфейса
    return;
  }

  // регулировка играющей песни
  audio.paused ? changeMode(1)() : changeMode(0)();
}

// listener клика по табличному индексу
tableElement.addEventListener('click', async (event) => {
  // если кликнули по индексу, то вызывается handler
  if (event.target.closest('td').classList.contains('song-id')) {
    isMouseOver = true; // при включении по индексу курсор находится на строке песни
    isClickInProcess = true; // mouse out будет проигнорирован на время обработки клика
    await handleIdClick(event, currentSongIndex); // дожидаемся обработки
    isClickInProcess = false; // mouse out работает в привычном режиме
  }
});

// функция-обработчик
async function handleIdClick(event, audioIndex) {
  // приводим к числу и получаем index песни, по которой кликнули
  const eventIndex = Number(event.target.closest('td').dataset.id) - 1;

  // индекс кликнутого элемента не будет равен глобальному индексу в 2 случаях:
  // это первая включенная песня или до этого играла другая песня
  if (audioIndex !== eventIndex) {
    let previousSongIndex;
    // если текущий индекс !== -1, предыдущая песня есть, ее значение сохраняется
    audioIndex !== -1
      ? (previousSongIndex = currentSongIndex)
      : (previousSongIndex = null);

    currentSongIndex = eventIndex; // обновляем индекс текущей песни

    await playNewSong(currentSongIndex);
    modifyLowerInterface(1, playPauseImageElement);

    // если mouse over song, то отображаем паузу, иначе - playing
    isMouseOver
      ? modifyTableInterface(5, currentSongIndex, previousSongIndex)
      : modifyTableInterface(1, currentSongIndex, previousSongIndex);
  } else {
    // в audio была эта же песня
    if (audio.paused) {
      audio.play();
      modifyLowerInterface(1, playPauseImageElement);
      modifyTableInterface(5, currentSongIndex);
    } else {
      audio.pause();
      modifyLowerInterface(0, playPauseImageElement);
      modifyTableInterface(4, currentSongIndex);
    }
  }
}

// listener mouse over над песней
tableElement.addEventListener('mouseover', (event) => {
  // ближайшая к событию строка таблицы
  const row = event.target.closest('tr');

  // проверка строки на null, содержание класса 'song-row' и прихода извне
  if (
    row &&
    row.classList.contains('song-row') &&
    !row.contains(event.relatedTarget)
  )
    handleMouseOver(row, currentSongIndex);
});

// функция-обработчик
function handleMouseOver(row, audioIndex) {
  // подсвечиваем эту строку
  row.style.backgroundColor = 'rgba(239, 239, 239, 0.189)';

  // index песни, над которой курсор
  const mouseOverIndex = +row.dataset.id - 1;

  if (mouseOverIndex === audioIndex) {
    audio.paused
      ? modifyTableInterface(4, mouseOverIndex)
      : modifyTableInterface(5, mouseOverIndex);
  } else {
    // MouseOverOnNonPlayingSong (white play + white title)
    modifyTableInterface(3, mouseOverIndex);
  }
}

// listener mouse out
tableElement.addEventListener('mouseout', (event) => {
  const row = event.target.closest('tr');

  if (
    row &&
    row.classList.contains('song-row') &&
    !row.contains(event.relatedTarget)
  )
    handleMouseOut(row, currentSongIndex);
});

// функция-обработчик
function handleMouseOut(row, audioIndex) {
  // убираем посветку
  row.style.backgroundColor = '';

  // index песни, с которой ушел курсор
  const mouseOutIndex = +row.dataset.id - 1;

  // если курсор уходит с текущей песни
  if (mouseOutIndex === audioIndex) {
    // если обрабатывается клик по песне в таблице, то обработка mouse out произойдет в функции вручную
    if (isClickInProcess) {
      isMouseOver = false;
      return;
    }

    audio.paused
      ? modifyTableInterface(0, mouseOutIndex)
      : modifyTableInterface(1, mouseOutIndex);
  } else {
    // default (white id + white title)
    modifyTableInterface(2, mouseOutIndex);
  }
}

// listener previous button
previousBtn.addEventListener('click', () => {
  handlePrevious(currentSongIndex);
});

// функция-обработчик
async function handlePrevious(index) {
  // если ни одна песня еще не включена
  if (index === -1) {
    return;
  }

  // если currentTime текущего трека меньше 5 сек, переключаем
  if (audio.currentTime < 5) {
    const previousIndex = index;
    index === 0 ? (index = songsDataArray.length - 1) : --index;
    currentSongIndex = index;

    await playNewSong(index);
    modifyLowerInterface(1, playPauseImageElement);
    modifyTableInterface(1, index, previousIndex);
  } else {
    audio.currentTime = 0;
  }
}

// listener next button
nextBtn.addEventListener('click', () => {
  handleNext(currentSongIndex);
});

// функция-обработчик
async function handleNext(index) {
  // если ни одна песня еще не включена
  if (index === -1) {
    return;
  }

  const previousIndex = index;
  index === songsDataArray.length - 1 ? (index = 0) : ++index;
  currentSongIndex = index;

  await playNewSong(index);
  modifyLowerInterface(1, playPauseImageElement);
  modifyTableInterface(1, index, previousIndex);
}

// listener завершения песни
audio.addEventListener('ended', () => {
  // просто включаем следующую
  handleNext(currentSongIndex);
});

// -------------------

audio.addEventListener('timeupdate', () => {
  const { currentTime, duration } = audio;
  const progress = (currentTime / duration) * 100;
  progressBar.style.width = `${progress}%`;
});
