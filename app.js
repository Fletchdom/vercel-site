const TITLE_PARTS = [
  "东京雨夜", "镰仓海岸", "京都旧书店", "札幌初雪", "横滨蓝调", "奈良黄昏",
  "银座迷踪", "浅草花火", "神户港灯", "冲绳夏日", "上野樱影", "涩谷回声",
  "箱根温泉", "名古屋列车", "长崎信笺", "富士山下", "青森白夜", "大阪霓虹",
  "轻井泽午后", "福冈月色", "伊豆海风", "琵琶湖畔", "高松慢车", "金泽雪国"
];

const SUB_PARTS = [
  "最后一班电车", "无人知晓的约定", "向日葵的告白", "深夜食堂来信",
  "昨日的胶片", "海边的钢琴", "第七个房间", "夏天结束以前",
  "消失的明信片", "白色隧道", "凌晨三点的钟", "远方的便利店"
];

const GENRE_SETS = [
  ["剧情", "新片"], ["动漫", "治愈"], ["悬疑", "犯罪"], ["爱情", "剧情"],
  ["经典", "剧情"], ["家庭", "治愈"], ["青春", "爱情"], ["科幻", "悬疑"]
];

const DIRECTORS = [
  "佐藤悠介", "森田遥", "中村真一", "高桥美纪", "小林圭吾", "山口奈绪",
  "井上拓海", "宫泽玲", "松本航", "清水优子", "藤原健", "北川绫"
];

const CASTS = [
  "三浦莲、桥本澪", "高杉航、藤井遥", "松田悠真、白石葵", "小野寺光、川口凛",
  "宫本晴、早川结衣", "长谷川凛、青木奏", "樱井拓、森七海", "相泽优、黑木诚"
];

const MOVIES = Array.from({ length: 96 }, (_, index) => {
  const title = `${TITLE_PARTS[index % TITLE_PARTS.length]}：${SUB_PARTS[Math.floor(index / 2) % SUB_PARTS.length]}`;
  const genres = GENRE_SETS[index % GENRE_SETS.length];
  const year = 2026 - (index % 9);
  const score = (9.5 - (index % 18) * 0.08).toFixed(1);
  const hot = 9900 - index * 73;
  const poster = `./assets/posters/poster-${String((index % 24) + 1).padStart(2, "0")}.png`;
  const id = `jp-${String(index + 1).padStart(3, "0")}`;
  const region = ["日本", "日本院线", "日本独立电影", "日本动画"][index % 4];
  const director = DIRECTORS[index % DIRECTORS.length];
  const cast = CASTS[index % CASTS.length];

  return {
    id,
    title,
    year,
    score,
    hot,
    poster,
    region,
    director,
    cast,
    duration: `${96 + (index % 32)}分钟`,
    language: index % 5 === 0 ? "日语 / 中文字幕" : "日语",
    genres,
    badge: index < 16 ? "新片" : genres[0],
    summary: `${title}是一部${genres.join("、")}类型的日本电影，围绕城市记忆、人物选择与细腻情感展开。影片以克制镜头、清晰节奏和高完成度视听呈现，适合喜欢最新日本电影、经典日影与高清日影推荐的观众。`
  };
});

const params = new URLSearchParams(window.location.search);
const page = document.body.dataset.page;

function movieUrl(movie) {
  return `./movie.html?id=${encodeURIComponent(movie.id)}`;
}

function card(movie) {
  return `
    <article class="movie-card">
      <a href="${movieUrl(movie)}" aria-label="查看${movie.title}">
        <div class="poster">
          <span class="badge">${movie.badge}</span>
          <span class="score">${movie.score}</span>
          <img src="${movie.poster}" alt="${movie.title}海报" loading="lazy" />
        </div>
        <div class="card-body">
          <h3>${movie.title}</h3>
          <div class="meta-row">
            <span>${movie.year}</span>
            <span>${movie.region}</span>
            <span>${movie.duration}</span>
          </div>
          <div class="tags">${movie.genres.map((genre) => `<span class="tag">${genre}</span>`).join("")}</div>
        </div>
      </a>
    </article>
  `;
}

function renderHome() {
  const featured = document.querySelector("#featuredMovies");
  const homeMovies = document.querySelector("#homeMovies");
  const rankMovies = document.querySelector("#rankMovies");
  const homeCount = document.querySelector("#homeCount");

  if (featured) {
    featured.innerHTML = MOVIES.slice(0, 5).map(card).join("");
  }

  if (homeMovies) {
    const list = MOVIES.slice(0, 36);
    homeMovies.innerHTML = list.map(card).join("");
    homeCount.textContent = `${list.length} 部内容`;
  }

  if (rankMovies) {
    rankMovies.innerHTML = [...MOVIES]
      .sort((a, b) => Number(b.score) - Number(a.score))
      .slice(0, 10)
      .map(
        (movie) => `
          <li>
            <a href="${movieUrl(movie)}">
              <strong>${movie.title}</strong>
              <span>${movie.score}</span>
            </a>
          </li>
        `
      )
      .join("");
  }
}

function renderLibrary() {
  const genreSelect = document.querySelector("#genreSelect");
  const searchInput = document.querySelector("#searchInput");
  const sortSelect = document.querySelector("#sortSelect");
  const container = document.querySelector("#libraryMovies");
  const count = document.querySelector("#libraryCount");
  const title = document.querySelector("#libraryTitle");

  if (!container || !genreSelect || !searchInput || !sortSelect) return;

  const genres = [...new Set(MOVIES.flatMap((movie) => movie.genres))].sort((a, b) =>
    a.localeCompare(b, "zh-CN")
  );
  genreSelect.insertAdjacentHTML(
    "beforeend",
    genres.map((genre) => `<option value="${genre}">${genre}</option>`).join("")
  );

  const urlGenre = params.get("genre") || "";
  const urlSort = params.get("sort") || "hot";
  genreSelect.value = urlGenre;
  sortSelect.value = ["hot", "score", "year"].includes(urlSort) ? urlSort : "hot";

  function update() {
    const keyword = searchInput.value.trim().toLowerCase();
    const genre = genreSelect.value;
    const sort = sortSelect.value;
    let list = MOVIES.filter((movie) => {
      const text = `${movie.title} ${movie.director} ${movie.cast} ${movie.genres.join(" ")}`.toLowerCase();
      return (!genre || movie.genres.includes(genre)) && (!keyword || text.includes(keyword));
    });

    list = list.sort((a, b) => {
      if (sort === "score") return Number(b.score) - Number(a.score);
      if (sort === "year") return b.year - a.year;
      return b.hot - a.hot;
    });

    container.innerHTML = list.map(card).join("");
    count.textContent = `${list.length} 部影片`;
    title.textContent = genre ? `${genre}日本电影推荐` : "80+ 部日本电影推荐";
  }

  [genreSelect, searchInput, sortSelect].forEach((element) => {
    element.addEventListener("input", update);
    element.addEventListener("change", update);
  });

  update();
}

function updateMovieMeta(movie) {
  document.title = `${movie.title}在线观看推荐 - 日本电影网`;
  const description = document.querySelector('meta[name="description"]');
  const keywords = document.querySelector('meta[name="keywords"]');
  if (description) {
    description.setAttribute(
      "content",
      `${movie.title}日本电影详情，查看剧情简介、导演演员、${movie.genres.join("、")}类型标签、高清日影推荐与相似日本电影。`
    );
  }
  if (keywords) {
    keywords.setAttribute(
      "content",
      `${movie.title},日本电影,日本电影在线观看,高清日本电影,${movie.genres.join(",")},日本电影网,日影推荐`
    );
  }
}

function renderMovieDetail() {
  const container = document.querySelector("#movieDetail");
  if (!container) return;

  const movie = MOVIES.find((item) => item.id === params.get("id")) || MOVIES[0];
  const related = MOVIES.filter(
    (item) => item.id !== movie.id && item.genres.some((genre) => movie.genres.includes(genre))
  ).slice(0, 8);

  updateMovieMeta(movie);
  container.innerHTML = `
    <section class="detail-hero">
      <div class="detail-poster">
        <img src="${movie.poster}" alt="${movie.title}海报" />
      </div>
      <div class="detail-copy">
        <p class="eyebrow">${movie.genres.join(" / ")}</p>
        <h1>${movie.title}</h1>
        <div class="meta-row">
          <span class="pill">${movie.year}</span>
          <span class="pill">${movie.score}分</span>
          <span class="pill">${movie.duration}</span>
          <span class="pill">${movie.language}</span>
        </div>
        <p class="synopsis">${movie.summary}</p>
        <div class="hero-actions">
          <a class="button primary" href="#play">高清观看</a>
          <a class="button ghost" href="./library.html?genre=${encodeURIComponent(movie.genres[0])}">同类型影片</a>
        </div>
      </div>
    </section>

    <section class="player-panel" id="play" aria-label="${movie.title}播放区">
      <div class="player-screen" style="background-image: url('${movie.poster}')">
        <span class="play-button" aria-label="播放"></span>
      </div>
    </section>

    <section class="detail-grid">
      <article class="info-box">
        <p class="eyebrow">影片信息</p>
        <h2>日本电影详情</h2>
        <p class="synopsis">
          导演：${movie.director}<br />
          主演：${movie.cast}<br />
          地区：${movie.region}<br />
          类型：${movie.genres.join("、")}
        </p>
      </article>
      <article class="info-box">
        <p class="eyebrow">剧情简介</p>
        <h2>高清日影推荐</h2>
        <p class="synopsis">${movie.summary}</p>
      </article>
    </section>

    <section class="section flush">
      <div class="section-head">
        <div>
          <p class="eyebrow">猜你喜欢</p>
          <h2>相似日本电影</h2>
        </div>
        <a class="text-link" href="./library.html">返回片库</a>
      </div>
      <div class="movie-grid">${related.map(card).join("")}</div>
    </section>
  `;
}

if (page === "home") renderHome();
if (page === "library") renderLibrary();
if (page === "movie") renderMovieDetail();
