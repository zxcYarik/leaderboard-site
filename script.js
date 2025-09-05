const sheetUrls = [
  // 1-й слайд: таблица
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSm9UDeOeEQ61iJvCgB0jtnOcYoinpOdpN6AdL0rHLn22lpo0_JylOaDamiphnvQQbiraj9BKZEFx8d/pub?output=csv',
  // 2-й слайд: лидер дня
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSm9UDeOeEQ61iJvCgB0jtnOcYoinpOdpN6AdL0rHLn22lpo0_JylOaDamiphnvQQbiraj9BKZEFx8d/pub?gid=644491547&single=true&output=csv'
];

let currentIndex = 0;
let slides = [];

async function loadAllSheets() {
  const container = document.getElementById('slider-content');
  container.innerHTML = '';
  slides = [];

  for (let i = 0; i < sheetUrls.length; i++) {
    const data = await loadCSV(sheetUrls[i]);
    let content;

    if (i === 0) {
      // первый слайд = таблица
      content = renderTable(data);
    } else {
      // второй слайд = карточка лидера дня
      content = renderLeaderCard(data);
    }

    const slide = document.createElement('div');
    slide.classList.add('slide');
    slide.appendChild(content);

    container.appendChild(slide);
    slides.push(slide);
  }

  if (slides.length > 0) {
    showSlide(0);
  }
}

async function loadCSV(url) {
  try {
    const res = await fetch(url + '&t=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    const rows = text.trim().split(/\r?\n/);
    return rows.map(r => r.split(/,|;|\t/));
  } catch (e) {
    console.error(e);
    return [['Ошибка загрузки']];
  }
}

function renderTable(data) {
  const tbl = document.createElement('table');
  data.forEach((row, i) => {
    const tr = document.createElement('tr');
    row.forEach(cell => {
      const el = document.createElement(i === 0 ? 'th' : 'td');
      el.textContent = cell;
      tr.appendChild(el);
    });
    tbl.appendChild(tr);
  });
  return tbl;
}

function renderLeaderCard(data) {
  const headers = data[0];
  const rows = data.slice(1);

  // Берём первую (и единственную) строку — лидера дня
  const leader = rows[0];

  // Находим индексы нужных колонок
  const nameIndex = headers.indexOf("Лидер дня (ФИО)");
  const scoreIndex = headers.indexOf("Сумма чистыми");
  const dateIndex = headers.indexOf("Дата");
  const serviceIndex = headers.indexOf("Услуга");
  const commentIndex = headers.indexOf("Комментарий / Эмодзи");

  // Получаем значения
  const name = nameIndex !== -1 ? leader[nameIndex] : 'Неизвестный';
  const score = scoreIndex !== -1 ? leader[scoreIndex] : '0';
  const date = dateIndex !== -1 ? leader[dateIndex] : '';
  const service = serviceIndex !== -1 ? leader[serviceIndex] : '';
  const comment = commentIndex !== -1 ? leader[commentIndex] : '';

  // Создаём карточку
  const card = document.createElement('div');
  card.classList.add('leader-card');

  const title = document.createElement('h2');
  title.textContent = `Лидер дня (${date})`;

  const player = document.createElement('p');
  player.textContent = `Игрок: ${name}`;

  const sum = document.createElement('p');
  sum.classList.add('score');
  sum.textContent = `Сумма: ${score}`;

  const serviceEl = document.createElement('p');
  serviceEl.textContent = `Услуга: ${service}`;

  const commentEl = document.createElement('p');
  commentEl.textContent = comment;

  card.appendChild(title);
  card.appendChild(player);
  card.appendChild(sum);
  card.appendChild(serviceEl);
  card.appendChild(commentEl);

  return card;
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

setInterval(() => {
  if (slides.length > 0) {
    showSlide((currentIndex + 1) % slides.length);
  }
}, 10000);

loadAllSheets();
