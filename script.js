const sheetUrls = [
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vT8Wbncz4v1KVonBklHjC1iIqkyz6sRzIqGbtP_Yh9xin-agP4Gx6HCSq-tq1deLCkmPTs63VKaF9rW/pub?output=csv'
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
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    // Стабильный CSV парсер: поддержка кавычек, запятых внутри ячеек
    // Используем регулярку для разбора строк
    const rows = text.trim().split(/\r?\n/).map(line => {
      const result = [];
      let cell = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i+1] === '"') {
            cell += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(cell.trim());
          cell = '';
        } else {
          cell += char;
        }
      }
      result.push(cell.trim());
      return result;
    });
    return rows;
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
  // Отладочная карточка
  const debugCard = document.createElement('div');
  debugCard.classList.add('leader-card');

  if (!data || data.length < 2) {
    debugCard.innerHTML = `<b>Нет данных для лидера</b><br>data: ${JSON.stringify(data)}`;
    return debugCard;
  }

  const headers = data[0].map(h => h.trim());
  const rows = data.slice(1).filter(r => r.some(cell => cell.trim() !== ''));

  // debug: показать заголовки и количество строк
  const info = document.createElement('div');
  info.style.fontSize = '0.9em';
  info.style.color = '#ccc';
  info.innerHTML = `Заголовки: ${headers.join(', ')}<br>Строк данных: ${rows.length}`;
  debugCard.appendChild(info);

  // ищем колонку с очками
  const scoreIndex = headers.findIndex(h => /очк|score|points/i.test(h));
  if (scoreIndex === -1) {
    debugCard.innerHTML += `<br><b>Не найдена колонка с очками</b>`;
    return debugCard;
  }

  // ищем колонку с именем
  const nameIndex = headers.findIndex(h => /имя|name|player/i.test(h));

  if (rows.length === 0) {
    debugCard.innerHTML += `<br><b>Нет строк с данными</b>`;
    return debugCard;
  }

  // находим лидера
  let leader = rows[0];
  let maxScore = parseFloat(rows[0][scoreIndex]) || 0;

  for (let r of rows) {
    const score = parseFloat(r[scoreIndex]) || 0;
    if (score > maxScore) {
      maxScore = score;
      leader = r;
    }
  }

  // создаём карточку
  const title = document.createElement('h2');
  title.textContent = 'Лидер дня';

  const playerName = nameIndex !== -1 ? leader[nameIndex] : 'Неизвестный';
  const player = document.createElement('p');
  player.textContent = `Игрок: ${playerName}`;

  const score = document.createElement('p');
  score.classList.add('score');
  score.textContent = `Очки: ${maxScore}`;

  debugCard.appendChild(title);
  debugCard.appendChild(player);
  debugCard.appendChild(score);

  return debugCard;
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
