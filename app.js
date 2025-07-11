const BASE_URL ="https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";

const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("form button");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");

for (let select of dropdowns) {
  for (currCode in countryList) {
    let newOption = document.createElement("option");
    newOption.innerText = currCode;
    newOption.value = currCode;
    if (select.name === "from" && currCode === "USD") {
      newOption.selected = "selected";
    } else if (select.name === "to" && currCode === "INR") {
      newOption.selected = "selected";
    }
    select.append(newOption);
  }

  select.addEventListener("change", (evt) => {
    updateFlag(evt.target);
  });
}

const updateExchangeRate = async () => {
  let amount = document.querySelector(".amount input");
  let amtVal = amount.value;
  if (amtVal === "" || amtVal < 1) {
    amtVal = 1;
    amount.value = "1";
  }
  const URL = `${BASE_URL}/${fromCurr.value.toLowerCase()}.min.json`;///${toCurr.value.toLowerCase()}.json`;
  let response = await fetch(URL);
  let data = await response.json();
  console.log(data);
  let from = fromCurr.value.toLowerCase();
  console.log(from);
  let to = toCurr.value.toLowerCase();
  console.log(to);

  let rate = data[from][to];


  let finalAmount = amtVal * rate;
  msg.innerText = `${amtVal} ${fromCurr.value} = ${finalAmount} ${toCurr.value}`;
  // Animate result
  msg.classList.remove('fade-in');
  void msg.offsetWidth; // trigger reflow
  msg.classList.add('fade-in');
};

const updateFlag = (element) => {
  let currCode = element.value;
  let countryCode = countryList[currCode];
  let newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;
  let img = element.parentElement.querySelector("img");
  img.src = newSrc;
};

btn.addEventListener("click",(evt) => {
  evt.preventDefault();

  updateExchangeRate();
});

window.addEventListener("load",() => {
  updateExchangeRate();
  updateTrendChart();
});

// --- Chart.js Trend Chart Feature ---
const trendChartCtx = document.getElementById('trendChart').getContext('2d');
let trendChartInstance = null;

async function updateTrendChart() {
  const from = fromCurr.value.toLowerCase();
  const to = toCurr.value.toLowerCase();
  const today = new Date();
  const dates = [];
  const rates = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    dates.push(dateStr);
    // Fetch historical rate for this date
    const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${dateStr}/v1/currencies/${from}.min.json`;
    try {
      const resp = await fetch(url);
      const data = await resp.json();
      rates.push(data[from][to]);
    } catch (e) {
      rates.push(null); // If error, push null
    }
  }

  // Remove previous chart if exists
  if (trendChartInstance) {
    trendChartInstance.destroy();
  }

  // Animate chart container
  const chartSection = document.querySelector('.chart-section');
  if (chartSection) {
    chartSection.classList.remove('fade-in');
    void chartSection.offsetWidth;
    chartSection.classList.add('fade-in');
  }

  trendChartInstance = new Chart(trendChartCtx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: `Exchange Rate (${from.toUpperCase()} to ${to.toUpperCase()})`,
        data: rates,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.2,
        spanGaps: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        title: { display: false }
      },
      scales: {
        x: { display: false },
        y: { beginAtZero: false }
      }
    }
  });
}

fromCurr.addEventListener('change', updateTrendChart);
toCurr.addEventListener('change', updateTrendChart);

// --- Dark Mode Toggle ---
const darkModeBtn = document.querySelector('.dark-mode-toggle');
const darkModeIcon = document.querySelector('.dark-mode-icon');

function setDarkModeIcon(isDark) {
  if (isDark) {
    // Sun icon
    darkModeIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="5" fill="#FFD600"/><g stroke="#FFD600" stroke-width="2"><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></g></svg>`;
  } else {
    // Moon icon
    darkModeIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79A9 9 0 0112.21 3c-.13 0-.19.16-.09.24A7 7 0 1012 21a9 9 0 009-8.21z" fill="#FFD600"/></svg>`;
  }
}

function updateThemeIcon() {
  setDarkModeIcon(document.body.classList.contains('dark-mode'));
}

darkModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  // Save preference
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
  updateThemeIcon();
});
// On load, apply saved theme
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
}
updateThemeIcon();