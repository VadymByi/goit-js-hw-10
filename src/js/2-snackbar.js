// console.log('Snackbar script loaded!');

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import '../css/2-snackbar.css';

console.log('Snackbar script loaded!');
const form = document.querySelector('.form');
console.log(form);
form.addEventListener('submit', e => {
  e.preventDefault();

  const delay = Number(form.elements.delay.value);
  const state = form.elements.state.value;
  console.log(delay);

  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (state === 'fulfilled') {
        resolve(delay);
      } else {
        reject(delay);
      }
    }, delay);
  })
    .then(delay => {
      console.log('Promise resolved', delay);
      iziToast.success({
        message: `✅ Fulfilled promise in ${delay}ms`,
        position: 'topRight',
        icon: '',
      });
    })
    .catch(delay => {
      console.log('Promise rejected', delay);

      iziToast.error({
        message: `❌ Rejected promise in ${delay}ms`,
        position: 'topRight',
        icon: '',
      });
    });
});
