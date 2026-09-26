import "./homepage.css";
type Journey = "tenant" | "owner";
const stories = {
  tenant: {
    label: "HÀNH TRÌNH NGƯỜI THUÊ",
    title: "Một nơi ở.\nMột chương mới.",
    text: "Bắt đầu từ một căn phòng, rồi là những điều nhỏ làm nên cuộc sống: ngày nhận chìa khóa, khoản tiền thuê đầu tiên, một sự cố cần được lắng nghe.",
    note: "Cùng TrọƠi khám phá câu chuyện sau khi bạn tìm được nơi ở.",
  },
  owner: {
    label: "HÀNH TRÌNH NGƯỜI VẬN HÀNH",
    title: "Mỗi căn phòng,\nmột câu chuyện.",
    text: "Sau mỗi cánh cửa là một người đang sống, một khoản thu cần nhớ, một việc cần chăm lo. Hành trình vận hành bắt đầu từ việc hiểu rõ từng căn phòng.",
    note: "Cùng TrọƠi ghi nhận và theo dõi cuộc sống của khu trọ.",
  },
};
export function mountHomepage(pan: (x: number, z: number) => void): void {
  const root = document.createElement("main");
  root.id = "homepage";
  root.innerHTML = `
    <div class="home-wash" aria-hidden="true"></div>
    <header class="home-top"><a class="home-brand" href="#" aria-label="TrọƠi — về màn hình mở đầu">trọơi<span>✦</span></a><span class="home-caption">MỘT KHU PHỐ · NHIỀU CÂU CHUYỆN</span></header>
    <section class="home-menu" aria-labelledby="home-title">
      <p class="home-eyebrow"><span></span> CHÀO MỪNG BẠN ĐẾN VỚI <span></span></p>
      <h1 id="home-title" class="home-title">TrọƠi<span class="title-star" aria-hidden="true">✦</span></h1>
      <p class="home-slogan">Nơi câu chuyện thuê trọ bắt đầu</p>
      <div class="journey-menu" aria-label="Chọn hành trình">
        <button class="journey-choice tenant" data-journey="tenant"><span class="choice-icon" aria-hidden="true">⌂</span><span><small>MỘT CHỐN ĐỂ GỌI LÀ NHÀ</small><strong>Hành trình tìm nơi ở</strong></span><span class="choice-arrow" aria-hidden="true">↗</span></button>
        <button class="journey-choice owner" data-journey="owner"><span class="choice-icon" aria-hidden="true">▦</span><span><small>CHĂM CHÚT TỪNG CĂN PHÒNG</small><strong>Hành trình vận hành phòng trọ</strong></span><span class="choice-arrow" aria-hidden="true">↗</span></button>
      </div>
      <p class="home-invite">Chọn một hành trình. Câu chuyện bắt đầu từ bạn.</p>
    </section>
    <section class="story-panel" hidden aria-labelledby="story-title"><p class="story-label"></p><h2 id="story-title" tabindex="-1"></h2><p class="story-text"></p><p class="story-note"></p><button class="story-back">← Chọn hành trình khác</button></section>
    <footer class="home-bottom"><span class="world-status"><i></i> KHU PHỐ ĐANG THỨC</span><span class="drag-hint">↔ Kéo để dạo quanh khu phố</span><span class="home-edition">CÂU CHUYỆN CỦA BẠN, Ở ĐÂY.</span></footer>`;
  document.body.append(root);
  const menu = root.querySelector<HTMLElement>(".home-menu")!;
  const panel = root.querySelector<HTMLElement>(".story-panel")!;
  const buttons = [
    ...root.querySelectorAll<HTMLButtonElement>("[data-journey]"),
  ];
  let selected: Journey | null = null;
  let frame = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const reduced = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function reset(): void {
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    const previous = selected;
    selected = null;
    root.removeAttribute("data-journey");
    root.classList.remove("is-entering");
    panel.hidden = true;
    menu.hidden = false;
    menu.inert = false;
    buttons.forEach((b) => (b.disabled = false));
    if (previous) buttons.find((b) => b.dataset.journey === previous)?.focus();
  }
  function choose(journey: Journey): void {
    if (selected) return;
    selected = journey;
    root.dataset.journey = journey;
    root.classList.add("is-entering");
    menu.inert = true;
    buttons.forEach((b) => (b.disabled = true));
    const story = stories[journey];
    root.querySelector(".story-label")!.textContent = story.label;
    root.querySelector("#story-title")!.textContent = story.title;
    root.querySelector(".story-text")!.textContent = story.text;
    root.querySelector(".story-note")!.textContent = story.note;
    if (!reduced()) {
      const start = performance.now();
      let last = 0;
      const move = (now: number) => {
        const t = Math.min((now - start) / 700, 1),
          ease = 1 - Math.pow(1 - t, 3);
        pan(
          (ease - last) * (journey === "tenant" ? 1.8 : -1.8),
          (ease - last) * 0.7,
        );
        last = ease;
        if (t < 1) frame = requestAnimationFrame(move);
      };
      frame = requestAnimationFrame(move);
    }
    timer = setTimeout(
      () => {
        menu.hidden = true;
        panel.hidden = false;
        root.classList.remove("is-entering");
        root.querySelector<HTMLElement>("#story-title")!.focus();
      },
      reduced() ? 0 : 450,
    );
  }
  buttons.forEach((button) => {
    const journey = button.dataset.journey as Journey;
    button.addEventListener("click", () => choose(journey));
    for (const event of ["pointerenter", "focus"])
      button.addEventListener(event, () => {
        if (!selected) root.dataset.journey = journey;
      });
    for (const event of ["pointerleave", "blur"])
      button.addEventListener(event, () => {
        if (!selected) root.removeAttribute("data-journey");
      });
  });
  root.querySelector(".story-back")!.addEventListener("click", reset);
  root.querySelector(".home-brand")!.addEventListener("click", (event) => {
    event.preventDefault();
    reset();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && selected) reset();
  });
}
