let myKey = "6127c02df5539909f02472a55e0b07c0";
let urlBase = "https://api.themoviedb.org/3";
let imgBase = "https://image.tmdb.org/t/p/w500";

let mainDiv = document.getElementById("moviesContainer");
let form = document.getElementById("searchForm");
let input = document.getElementById("searchInput");
let tabs = document.querySelectorAll(".tab-btn");

let myModal = document.getElementById("movieModal");
let closeBtn = document.getElementById("closeModal");
let posterImg = myModal.querySelector(".modal-poster img");
let titleText = myModal.querySelector(".modal-title");
let rateText = myModal.querySelector(".modal-rating");
let yearText = myModal.querySelector(".modal-year");
let timeText = myModal.querySelector(".modal-runtime");
let genreDiv = myModal.querySelector(".modal-genres");
let descText = myModal.querySelector(".modal-desc");
let actorsText = myModal.querySelector(".modal-cast span");
let watchBtn = myModal.querySelectorAll(".btn-secondary")[0];
let starBtn = myModal.querySelector(".star-btn");

let rateDiv = document.getElementById("ratingModal");
let cnclRate = document.getElementById("cancelRatingBtn");
let svRate = document.getElementById("saveRatingBtn");
let rateInputs = document.querySelectorAll('input[name="movie-rating"]');

let allGenres = {};
let currentList = [];
let clickedMovieId = 0;
let clickedMovieObj = null;

// get genres first then load popular
async function startApp() {
  let res = await fetch("https://api.themoviedb.org/3/genre/movie/list?api_key=" + myKey);
  let data = await res.json();

  for (let i = 0; i < data.genres.length; i++) {
    allGenres[data.genres[i].id] = data.genres[i].name;
  }

  await getMovies("https://api.themoviedb.org/3/movie/popular?api_key=" + myKey);
}
startApp();

async function getMovies(url) {
  let res = await fetch(url);
  let data = await res.json();
  currentList = data.results;
  showMovies(currentList);
}

function showMovies(arr) {
  mainDiv.innerHTML = "";

  if (arr.length == 0) {
    mainDiv.innerHTML = "<h2>No movies found</h2>";
    return;
  }

  for (let i = 0; i < arr.length; i++) {
    let m = arr[i];

    if (m.poster_path == null) {
      continue;
    }

    let g1 = "UNKNOWN";
    let g2 = "";

    if (m.genre_ids && m.genre_ids.length > 0) {
      g1 = allGenres[m.genre_ids[0]];
      if (m.genre_ids[1]) {
        g2 = " • " + allGenres[m.genre_ids[1]];
      }
    } else if (m.genres && m.genres.length > 0) {
      g1 = m.genres[0].name;
      if (m.genres[1]) {
        g2 = " • " + m.genres[1].name;
      }
    }

    let yr = "N/A";
    if (m.release_date) {
      yr = m.release_date.substring(0, 4);
    }

    let rate = "NR";
    if (m.vote_average) {
      rate = m.vote_average.toFixed(1);
    }

    // fav logic
    let savedFavs = JSON.parse(localStorage.getItem("cinebrowse_favorites"));
    if (savedFavs == null) savedFavs = [];

    let isF = false;
    for (let j = 0; j < savedFavs.length; j++) {
      if (savedFavs[j].id == m.id) {
        isF = true;
      }
    }

    let hColor = "rgba(255, 255, 255, 0.5)";
    let hFill = "none";
    if (isF) {
      hColor = "#e11d48";
      hFill = "#e11d48";
    }

    let card = document.createElement("article");
    card.className = "movie-card";

    card.innerHTML = `
      <div class="card-image-wrap">
        <img src="${imgBase + m.poster_path}" alt="poster">
        <button class="fav-icon-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="${hFill}" stroke="${hColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
      <div class="card-info">
        <div class="card-header">
          <h2 class="card-title">${m.title}</h2>
          <div class="card-rating">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span>${rate}</span>
          </div>
        </div>
        <p class="card-meta">${g1}${g2} • ${yr}</p>
      </div>
    `;

    // click to view modal
    card.addEventListener("click", function () {
      openMyModal(m.id);
    });

    // click heart
    let hBtn = card.querySelector(".fav-icon-btn");
    hBtn.addEventListener("click", function (event) {
      event.stopPropagation(); // stop modal from opening

      let fv = JSON.parse(localStorage.getItem("cinebrowse_favorites"));
      if (fv == null) fv = [];

      let found = false;
      for (let k = 0; k < fv.length; k++) {
        if (fv[k].id == m.id) {
          fv.splice(k, 1);
          found = true;
        }
      }

      if (found == false) {
        fv.push(m);
        hBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="#e11d48" stroke="#e11d48" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
      } else {
        hBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.5)" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
      }

      localStorage.setItem("cinebrowse_favorites", JSON.stringify(fv));
    });

    mainDiv.appendChild(card);
  }
}

// search bar
form.addEventListener("submit", function (e) {
  e.preventDefault();
  let q = input.value;
  if (q != "") {
    getMovies("https://api.themoviedb.org/3/search/movie?api_key=" + myKey + "&query=" + q);
    for (let i = 0; i < tabs.length; i++) {
      tabs[i].classList.remove("active");
    }
  } else {
    getMovies("https://api.themoviedb.org/3/movie/popular?api_key=" + myKey);
    for (let i = 0; i < tabs.length; i++) {
      tabs[i].classList.remove("active");
    }
    tabs[0].classList.add("active");
  }
});

// tabs clicking
for (let i = 0; i < tabs.length; i++) {
  tabs[i].addEventListener("click", function () {
    for (let j = 0; j < tabs.length; j++) {
      tabs[j].classList.remove("active");
    }
    tabs[i].classList.add("active");

    let text = tabs[i].textContent;
    if (text == "POPULAR") {
      getMovies("https://api.themoviedb.org/3/movie/popular?api_key=" + myKey);
    }
    if (text == "TOP RATED") {
      getMovies("https://api.themoviedb.org/3/movie/top_rated?api_key=" + myKey);
    }
    if (text == "UPCOMING") {
      getMovies("https://api.themoviedb.org/3/movie/upcoming?api_key=" + myKey);
    }
    if (text == "WATCHLIST") {
      let wl = JSON.parse(localStorage.getItem("cinebrowse_watchlist"));
      if (wl == null) wl = [];
      showMovies(wl);
    }
  });
}

// open modal func
async function openMyModal(id) {
  let res = await fetch("https://api.themoviedb.org/3/movie/" + id + "?api_key=" + myKey + "&append_to_response=credits");
  let movie = await res.json();

  clickedMovieId = movie.id;
  clickedMovieObj = movie;

  if (movie.poster_path != null) {
    posterImg.src = imgBase + movie.poster_path;
  } else {
    posterImg.src = "https://via.placeholder.com/500x750?text=No+Poster";
  }

  titleText.textContent = movie.title;

  // show rating from localstorage if it exists
  let rtgs = JSON.parse(localStorage.getItem("cinebrowse_ratings"));
  if (rtgs == null) rtgs = {};

  let myRt = rtgs[movie.id];
  if (myRt != null) {
    rateText.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="#6366f1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Mine: ${myRt} / 5 (${movie.vote_average.toFixed(1)})`;
  } else {
    rateText.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> ${movie.vote_average.toFixed(1)}`;
  }

  if (movie.release_date != null) {
    yearText.textContent = movie.release_date.substring(0, 4);
  } else {
    yearText.textContent = "N/A";
  }

  if (movie.runtime != null) {
    timeText.textContent = movie.runtime + " min";
  } else {
    timeText.textContent = "N/A";
  }

  descText.textContent = movie.overview;

  genreDiv.innerHTML = "";
  if (movie.genres != null) {
    for (let g = 0; g < movie.genres.length; g++) {
      let s = document.createElement("span");
      s.className = "genre-tag";
      s.innerHTML = movie.genres[g].name;
      genreDiv.appendChild(s);
    }
  }

  if (movie.credits != null && movie.credits.cast != null) {
    let stars = "";
    for (let c = 0; c < 3; c++) {
      if (movie.credits.cast[c]) {
        stars = stars + movie.credits.cast[c].name + ", ";
      }
    }
    actorsText.textContent = stars.slice(0, -2);
  } else {
    actorsText.textContent = "N/A";
  }

  updateWlBtn();

  myModal.classList.add("active");
  document.body.style.overflow = "hidden";
}

// close modal
closeBtn.addEventListener("click", function () {
  myModal.classList.remove("active");
  document.body.style.overflow = "auto";
});

myModal.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal-backdrop") || e.target.classList.contains("modal")) {
    myModal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
});

// watchlist
watchBtn.addEventListener("click", function () {
  let list = JSON.parse(localStorage.getItem("cinebrowse_watchlist"));
  if (list == null) list = [];

  let found = false;
  for (let i = 0; i < list.length; i++) {
    if (list[i].id == clickedMovieId) {
      list.splice(i, 1);
      found = true;
    }
  }

  if (found == false) {
    list.push(clickedMovieObj);
  }

  localStorage.setItem("cinebrowse_watchlist", JSON.stringify(list));
  updateWlBtn();

  // refresh if looking at watchlist
  for (let i = 0; i < tabs.length; i++) {
    if (tabs[i].classList.contains("active") && tabs[i].textContent == "WATCHLIST") {
      showMovies(list);
    }
  }
});

function updateWlBtn() {
  let list = JSON.parse(localStorage.getItem("cinebrowse_watchlist"));
  if (list == null) list = [];

  let inList = false;
  for (let i = 0; i < list.length; i++) {
    if (list[i].id == clickedMovieId) {
      inList = true;
    }
  }

  if (inList == true) {
    watchBtn.style.backgroundColor = "#6366f1";
    watchBtn.style.color = "white";
    watchBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg> 
      In Watchlist
    `;
  } else {
    watchBtn.style.backgroundColor = "";
    watchBtn.style.color = "";
    watchBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> 
      Add to Watchlist
    `;
  }
}

// rating stuff
starBtn.addEventListener("click", function () {
  // uncheck all
  for (let i = 0; i < rateInputs.length; i++) {
    rateInputs[i].checked = false;
  }

  let rtgs = JSON.parse(localStorage.getItem("cinebrowse_ratings"));
  if (rtgs == null) rtgs = {};

  let cR = rtgs[clickedMovieId];
  if (cR != null) {
    for (let i = 0; i < rateInputs.length; i++) {
      if (rateInputs[i].value == cR) {
        rateInputs[i].checked = true;
      }
    }
  }

  rateDiv.classList.add("active");
});

cnclRate.addEventListener("click", function () {
  rateDiv.classList.remove("active");
});

svRate.addEventListener("click", function () {
  let selectedVal = 0;
  for (let i = 0; i < rateInputs.length; i++) {
    if (rateInputs[i].checked == true) {
      selectedVal = rateInputs[i].value;
    }
  }

  if (selectedVal != 0) {
    let rtgs = JSON.parse(localStorage.getItem("cinebrowse_ratings"));
    if (rtgs == null) rtgs = {};

    rtgs[clickedMovieId] = selectedVal;
    localStorage.setItem("cinebrowse_ratings", JSON.stringify(rtgs));

    openMyModal(clickedMovieId);
  }

  rateDiv.classList.remove("active");
});
