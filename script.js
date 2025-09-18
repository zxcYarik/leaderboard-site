const sheetUrls = [
  'https://docs.google.com/spreadsheets/d/1xHFYwwGnkzjc9silmNPKpUDNbbYdHPQ3y0B20hvkRio/edit?usp=sharing',
  'https://docs.google.com/spreadsheets/d/16qzBLyi0hvPna5YPZxIqfBi_HYl4ezUarPLR97k6RWQ/edit?usp=sharing'
];

let currentIndex = 0;
let slides = [];

function loadAllSheets() {
  const container = document.getElementById('slider-content');
  container.innerHTML = '';
  slides = [];

  for (let i = 0; i < sheetUrls.length; i++) {
    const slide = document.createElement('div');
    slide.classList.add('slide');

    const iframe = document.createElement('iframe');
    iframe.src = sheetUrls[i] + '&t=' + Date.now();
    iframe.width = '100%';
    iframe.height = '6000px';
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    iframe.onload = () => console.log('Iframe loaded for slide ' + i);
    iframe.onerror = () => {
      console.error('Iframe failed to load for slide ' + i);

      slide.innerHTML = '<p>Не удалось загрузить файл. <a href="' + sheetUrls[i] + '" target="_blank">Открыть в новой вкладке</a></p>';
    };

    slide.appendChild(iframe);
    container.appendChild(slide);
    slides.push(slide);
  }

  if (slides.length > 0) {
    showSlide(0);
  }
}

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.remove('active');
    if (i === index) {
      slide.classList.add('active');
    }
  });
  currentIndex = index;
}

document.querySelector('.prev').addEventListener('click', () => {
  if (slides.length > 0) {
    showSlide((currentIndex - 1 + slides.length) % slides.length);
  }
});

document.querySelector('.next').addEventListener('click', () => {
  if (slides.length > 0) {
    showSlide((currentIndex + 1) % slides.length);
  }
});

// // Автопереключение
// setInterval(() => {
//   if (slides.length > 0) {
//     showSlide((currentIndex + 1) % slides.length);
//   }
// }, 10000);

loadAllSheets();