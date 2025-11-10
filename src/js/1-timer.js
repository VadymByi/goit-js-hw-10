import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import '../css/1-timer.css';
// console.log('Timer script loaded!');
const startBtn = document.querySelector('[data-start]');
const inputUser = document.querySelector('#datetime-picker');
const timerContainer = document.querySelector('.timer');

let userSelectedDate = null;
let timerId = null;
let alarmAudio = null;
let gifElement = null;
let stopBtn = null;

// Гифка и аудио для будильника
const gifUrl = 'https://media.tenor.com/Jfvooie8DbAAAAAj/monkey-cymbals.gif';
const soundPath = '../audio/monkey_cymbals_2s.wav';

startBtn.disabled = true;

// Функция из задания, не изменялась
function convertMs(ms) {
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  const days = Math.floor(ms / day);
  const hours = Math.floor((ms % day) / hour);
  const minutes = Math.floor(((ms % day) % hour) / minute);
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);

  return { days, hours, minutes, seconds };
}

// Функция для дополнения нулями отображения времени, чтобі всегда были двузначные числа
function addLeadingZero(value) {
  return String(value).padStart(2, '0');
}

// Функция для обновения значений таймера
function updateUI(days, hours, minutes, seconds) {
  document.querySelector('[data-days]').textContent = addLeadingZero(days);
  document.querySelector('[data-hours]').textContent = addLeadingZero(hours);
  document.querySelector('[data-minutes]').textContent =
    addLeadingZero(minutes);
  document.querySelector('[data-seconds]').textContent =
    addLeadingZero(seconds);
}

// Объект настройки flatpickr - дописал изначальный onClose  и добавил метод проверки выбора
const options = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,
  // автоматическое закрывание календаря после выбора даты
  onChange(selectedDates, dateStr, instance) {
    if (selectedDates[0]) instance.close();
  },
  //проверка выбрана ли дата, если нет или в прошлом - предупреждение через изитост, если все ок - активируем кнопку Старт и фиксируем выбранное значение
  onClose(selectedDates) {
    const picked = selectedDates[0];
    if (!picked) {
      userSelectedDate = null;
      startBtn.disabled = true;
      return;
    }

    if (picked.getTime() <= Date.now()) {
      userSelectedDate = null;
      startBtn.disabled = true;
      iziToast.error({
        title: 'Error',
        message: 'Please choose a date in the future',
        position: 'topRight',
      });
      return;
    }

    userSelectedDate = picked;
    startBtn.disabled = false;
  },
};

flatpickr('#datetime-picker', options);

// обработчик клика кнопки Старт
startBtn.addEventListener('click', onStartBtn);

// Функция-коллбек для обработчика кнопки Старт
function onStartBtn() {
  if (!userSelectedDate) return;
  if (timerId) return;

  startBtn.disabled = true;
  inputUser.disabled = true;

  let ms = userSelectedDate.getTime() - Date.now();
  if (ms <= 0) {
    updateUI(0, 0, 0, 0);
    inputUser.disabled = false;
    return;
  }
  const initial = convertMs(ms);
  updateUI(initial.days, initial.hours, initial.minutes, initial.seconds);

  timerId = setInterval(() => {
    const msLeft = userSelectedDate.getTime() - Date.now();

    if (msLeft <= 0) {
      clearInterval(timerId);
      timerId = null;
      updateUI(0, 0, 0, 0);
      inputUser.disabled = false;
      iziToast.success({
        title: 'Done',
        message: 'Timer finished!',
        position: 'topRight',
      });

      // показываем гифку и запускаем звук
      showAlarmEffects();
      return;
    }

    const { days, hours, minutes, seconds } = convertMs(msLeft);
    updateUI(days, hours, minutes, seconds);
  }, 1000);
}

//Добавил вне базового задания для невероятной красоты приложения
// Функция отображения анимации и звука
function showAlarmEffects() {
  // создаём гифку
  gifElement = document.createElement('img');
  gifElement.src = gifUrl;
  gifElement.alt = 'Wake up!';
  gifElement.style.display = 'block';
  gifElement.style.margin = '20px auto';
  gifElement.style.maxWidth = '300px';
  gifElement.style.borderRadius = '10px';

  // создаём звук
  alarmAudio = new Audio(soundPath);
  alarmAudio.loop = true; //зацикливаем музычку, потому что там всего 2секунды
  alarmAudio.play().catch(err => console.error('Audio playback error:', err));

  // создаём кнопку остановки будильника
  stopBtn = document.createElement('button');
  stopBtn.textContent = 'Enough! Enough! I’m awake, honestly!';
  stopBtn.classList.add('stop-btn');

  // добавляем всё в DOM
  timerContainer.insertAdjacentElement('afterend', gifElement);
  gifElement.insertAdjacentElement('afterend', stopBtn);

  // обработчик остановки
  stopBtn.addEventListener('click', stopAlarmEffects);
}

//  Функция остановки гиф и звука
function stopAlarmEffects() {
  if (alarmAudio) {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
  }

  if (gifElement) gifElement.remove();
  if (stopBtn) stopBtn.remove();

  alarmAudio = null;
  gifElement = null;
  stopBtn = null;
}
