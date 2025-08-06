const API_KEY = "3b4b2dc40aa3d8a7f9a07c208346efd8";
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const forecastContainer = document.getElementById("forecast");
const currentWeather = document.getElementById("currentWeather");
const errorDiv = document.getElementById("error");
const recentCitiesDropdown = document.getElementById("recentCities");

let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];

function updateRecentCities(city) {
  if (!recentCities.includes(city)) {
    recentCities.unshift(city);
    if (recentCities.length > 5) recentCities.pop();
    localStorage.setItem("recentCities", JSON.stringify(recentCities));
    renderDropdown();
  }
}

function renderDropdown() {
  if (recentCities.length === 0) {
    recentCitiesDropdown.classList.add("hidden");
    return;
  }
  recentCitiesDropdown.classList.remove("hidden");
  recentCitiesDropdown.innerHTML = recentCities
    .map((city) => `<option value="${city}">${city}</option>`)
    .join("");
}

async function fetchWeather(city) {
  try {
    errorDiv.textContent = "";
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();
    displayCurrentWeather(data);
    updateRecentCities(city);
    fetchForecast(city);
  } catch (err) {
    showError(err.message);
  }
}

async function fetchForecast(city) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
    );
    const data = await res.json();
    displayForecast(data.list);
  } catch (err) {
    showError("Failed to fetch forecast");
  }
}

function displayCurrentWeather(data) {
  currentWeather.classList.remove("hidden");
  const temp = data.main.temp;
  const condition = data.weather[0].main;

  document.body.className = condition.toLowerCase().includes("rain")
    ? "bg-blue-200"
    : "bg-blue-100";

  if (temp > 40) {
    alert("🔥 Extreme heat alert!");
  }

  currentWeather.innerHTML = `
    <h2 class="text-lg font-bold">${data.name}, ${data.sys.country}</h2>
    <p class="text-xl">🌡️ ${temp}°C - ${condition}</p>
    <p>💧 Humidity: ${data.main.humidity}%</p>
    <p>🌬️ Wind: ${data.wind.speed} m/s</p>
  `;
}

function displayForecast(list) {
  forecastContainer.innerHTML = "";
  const dailyData = list.filter((item) => item.dt_txt.includes("12:00:00"));
  dailyData.forEach((day) => {
    const date = new Date(day.dt_txt).toDateString();
    forecastContainer.innerHTML += `
      <div class="bg-white p-3 rounded shadow">
        <p class="font-semibold">${date}</p>
        <p>🌡️ ${day.main.temp}°C</p>
        <p>💧 ${day.main.humidity}%</p>
        <p>🌬️ ${day.wind.speed} m/s</p>
      </div>
    `;
  });
}

function showError(message) {
  errorDiv.textContent = message;
}

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) return showError("Please enter a city name");
  fetchWeather(city);
});

locationBtn.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      fetchWeather(data.name);
    },
    () => {
      showError("Location access denied");
    }
  );
});

recentCitiesDropdown.addEventListener("change", () => {
  const city = recentCitiesDropdown.value;
  fetchWeather(city);
});

window.onload = renderDropdown;
