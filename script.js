async function loadCSV() {
  const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSm9UDeOeEQ61iJvCgB0jtnOcYoinpOdpN6AdL0rHLn22lpo0_JylOaDamiphnvQQbiraj9BKZEFx8d/pub?output=csv';
  try {
    const res = await fetch(url + '&t=' + Date.now()); // кеш-бастер
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    const rows = text.trim().split(/\r?\n/);
    const table = rows.map(r => r.split(/,|;|\t/));
    renderTable(table);
  } catch (e) {
    console.error(e);
    document.getElementById('board').innerHTML = '<tr><td>Ошибка загрузки данных</td></tr>';
  }
}

function renderTable(data) {
  const tbl = document.createElement('table'); // создаём временную таблицу
  data.forEach((row, i) => {
    const tr = document.createElement('tr');
    row.forEach(cell => {
      const el = document.createElement(i === 0 ? 'th' : 'td');
      el.textContent = cell;
      tr.appendChild(el);
    });
    tbl.appendChild(tr);
  });

  const board = document.getElementById('board');
  
  // плавная замена контента
  board.classList.add('fade-out');
  setTimeout(() => {
    board.innerHTML = tbl.innerHTML;
    board.classList.remove('fade-out');
    board.classList.add('fade-in');
    setTimeout(() => board.classList.remove('fade-in'), 300);
  }, 300);
}

loadCSV();
// Автообновление каждые 5 минут
setInterval(loadCSV, 300000);
