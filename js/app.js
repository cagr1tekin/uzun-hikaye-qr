const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches

async function loadMenu() {
  const menuEl = document.getElementById("menu")
  const tabsEl = document.getElementById("tabs")

  try {
    const res = await fetch("./data/menu.json")
    if (!res.ok) throw new Error("Menü dosyası bulunamadı")
    const data = await res.json()

    applySalon(data.salon)
    menuEl.innerHTML = ""

    data.menu.forEach((cat, i) => {
      const sectionId = `section-${i}`
      tabsEl.appendChild(createTab(cat, sectionId, i === 0))
      menuEl.appendChild(createSection(cat, sectionId, i))
    })

    initNavHeight()
    initTabs()
    initScrollReveal()
    initParallax()
    initToTop()
    dismissLoader()
  } catch (err) {
    showError(menuEl, err)
    dismissLoader()
  }
}

/**
 * En sık görülen hata: dosyaya çift tıklayıp file:// üzerinden açmak.
 * Tarayıcı bu protokolde fetch'i engeller ve mesaj "Failed to fetch" olur —
 * sebebi anlatmadığı için burada kendimiz açıklıyoruz.
 */
function showError(menuEl, err) {
  const dosyaProtokolu = location.protocol === "file:"

  const govde = dosyaProtokolu
    ? `<strong>Menü dosyaya çift tıklanarak açıldığında çalışmaz.</strong>
       <span>Tarayıcı, <code>file://</code> adresinde <code>menu.json</code>
       dosyasını okumayı güvenlik gerekçesiyle engelliyor.</span>
       <span>Klasördeki <strong>Baslat.bat</strong> dosyasına çift tıklayın —
       menü kendiliğinden açılır.</span>
       <span class="error-note">Site sunucuya yüklendiğinde bu adıma gerek kalmaz.</span>`
    : `<strong>Menü yüklenemedi.</strong>
       <span>${escapeHtml(err.message)}</span>
       <span>Lütfen sayfayı yenileyin.</span>`

  menuEl.innerHTML = `<div class="state error">${govde}</div>`
}

function applySalon(salon) {
  document.getElementById("salon-name").textContent = salon.ad
  document.getElementById("salon-tag").textContent = salon.etiket || "Menü"
  document.title = `${salon.ad} — Menü`

  applyHero(salon)

  // Başlığın son kelimesini italik vurguya al
  const titleEl = document.getElementById("hero-title")
  const words = salon.baslik.split(" ")
  const last = words.pop()
  titleEl.textContent = ""
  titleEl.append(document.createTextNode(words.join(" ") + " "))
  const em = document.createElement("em")
  em.textContent = last
  titleEl.append(em)

  document.getElementById("hero-sub").textContent = salon.altBaslik
  document.querySelector(".hero-eyebrow").textContent =
    salon.etiket ? `${salon.etiket} · Menü` : "İçecek Menüsü"

  if (salon.kdvNotu) {
    document.getElementById("footer-kdv").textContent = salon.kdvNotu
  }
  if (salon.fiyatTarihi) {
    document.getElementById("footer-date").textContent =
      `Fiyat güncelleme: ${salon.fiyatTarihi}`
  }
}

/**
 * Hero görseli iki boyutta duruyor: küçük ekranda 720px (26 KB), büyükte
 * 1280px (54 KB). Seçim ekran genişliği × piksel yoğunluğuna göre yapılır —
 * telefonda gereksiz 54 KB indirilmesin.
 *
 * WebP desteklemeyen eski tarayıcılar için image-set() içinde JPG yedeği var;
 * image-set'i tanımayan tarayıcı da önce atanan düz url()'de kalır.
 */
function applyHero(salon) {
  const el = document.getElementById("hero-bg")
  if (!el || !salon.heroGorsel) return

  const genislik = window.innerWidth * (window.devicePixelRatio || 1)
  const webp =
    genislik <= 900 && salon.heroGorselMobil ? salon.heroGorselMobil : salon.heroGorsel
  const jpg = webp.replace(/\.webp$/, ".jpg")

  el.style.backgroundImage = `url('${jpg}')`
  el.style.backgroundImage =
    `image-set(url('${webp}') type('image/webp'), url('${jpg}') type('image/jpeg'))`
}

function createTab(cat, targetId, active) {
  const tab = document.createElement("button")
  tab.type = "button"
  tab.className = "tab" + (active ? " active" : "")
  tab.textContent = cat.kisaAd || cat.kategoriGosterim
  tab.dataset.target = targetId
  tab.setAttribute("role", "tab")
  tab.setAttribute("aria-controls", targetId)
  tab.setAttribute("aria-selected", String(active))
  return tab
}

function createSection(cat, sectionId, index) {
  const label = cat.kategoriGosterim || cat.kategori
  const section = document.createElement("section")
  section.className = "section reveal"
  section.id = sectionId
  section.setAttribute("aria-labelledby", `${sectionId}-title`)
  if (!REDUCED_MOTION) {
    section.style.transitionDelay = `${Math.min(index, 3) * 0.05}s`
  }

  const items = cat.urunler
    .map(
      (item) => `
      <div class="item">
        <span class="item-name">${escapeHtml(item.urun)}</span>
        <span class="item-price">${escapeHtml(String(item.fiyat))}</span>
      </div>`
    )
    .join("")

  section.innerHTML = `
    <div class="section-head">
      <h2 class="section-title" id="${sectionId}-title">${escapeHtml(label)}</h2>
      <span class="section-meta">${cat.urunler.length} ürün</span>
    </div>
    <div class="section-card">${items}</div>`

  return section
}

function escapeHtml(str) {
  const div = document.createElement("div")
  div.textContent = str
  return div.innerHTML
}

/**
 * --nav-height'i sabit yazmak yerine ölç: yazı tipi ve cihaz yüksekliği
 * değiştiğinde sekmeye tıklanan bölümün başlığı nav'ın altında kalmasın.
 */
function initNavHeight() {
  const nav = document.getElementById("nav")
  if (!nav) return

  const apply = () =>
    document.documentElement.style.setProperty(
      "--nav-height",
      `${Math.round(nav.getBoundingClientRect().height)}px`
    )

  apply()
  document.fonts?.ready.then(apply)
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(apply).observe(nav)
  } else {
    window.addEventListener("resize", apply)
  }
}

function initTabs() {
  const track = document.getElementById("tabs-track")
  const tabsEl = document.getElementById("tabs")
  const indicator = document.getElementById("tabs-indicator")
  const tabs = [...tabsEl.querySelectorAll(".tab")]
  const sections = tabs.map((t) => document.getElementById(t.dataset.target))

  function moveIndicator(tab) {
    if (!tab) return
    indicator.style.width = `${tab.offsetWidth}px`
    indicator.style.height = `${tab.offsetHeight}px`
    indicator.style.transform = `translate(${tab.offsetLeft}px, ${tab.offsetTop}px)`
    indicator.classList.add("ready")
  }

  function setActive(tab, { scrollTab = true } = {}) {
    tabs.forEach((t) => {
      const on = t === tab
      t.classList.toggle("active", on)
      t.setAttribute("aria-selected", String(on))
    })
    moveIndicator(tab)
    if (scrollTab) {
      tab.scrollIntoView({
        behavior: REDUCED_MOTION ? "auto" : "smooth",
        inline: "center",
        block: "nearest",
      })
    }
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => {
      setActive(tab)
      document.getElementById(tab.dataset.target)?.scrollIntoView({
        behavior: REDUCED_MOTION ? "auto" : "smooth",
      })
    })

    // Klavye: sekmeler arasında ok tuşlarıyla gezinme
    tab.addEventListener("keydown", (e) => {
      const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0
      if (!dir) return
      e.preventDefault()
      const next = tabs[(i + dir + tabs.length) % tabs.length]
      next.focus()
      setActive(next)
      document.getElementById(next.dataset.target)?.scrollIntoView({
        behavior: REDUCED_MOTION ? "auto" : "smooth",
      })
    })
  })

  // Görünen bölüme göre aktif sekmeyi güncelle
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const idx = sections.indexOf(entry.target)
        if (idx !== -1) setActive(tabs[idx])
      })
    },
    { rootMargin: "-45% 0px -50% 0px" }
  )
  sections.forEach((s) => s && observer.observe(s))

  // Kenar solmaları: kaydırma imkânını göster
  function updateEdges() {
    const max = tabsEl.scrollWidth - tabsEl.clientWidth
    track.dataset.atStart = String(tabsEl.scrollLeft <= 2)
    track.dataset.atEnd = String(max <= 2 || tabsEl.scrollLeft >= max - 2)
  }
  tabsEl.addEventListener("scroll", updateEdges, { passive: true })

  requestAnimationFrame(() => {
    moveIndicator(tabs[0])
    updateEdges()
  })

  // Yazı tipi yüklenince sekme genişlikleri değişir
  document.fonts?.ready.then(() => {
    moveIndicator(tabs.find((t) => t.classList.contains("active")) || tabs[0])
    updateEdges()
  })

  window.addEventListener("resize", () => {
    moveIndicator(tabs.find((t) => t.classList.contains("active")))
    updateEdges()
  })
}

function initScrollReveal() {
  const sections = document.querySelectorAll(".section.reveal")

  if (REDUCED_MOTION) {
    sections.forEach((el) => el.classList.add("visible"))
    return
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add("visible")
        obs.unobserve(entry.target)
      })
    },
    { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
  )

  sections.forEach((el) => observer.observe(el))
}

function initParallax() {
  const heroBg = document.getElementById("hero-bg")
  const hero = document.getElementById("hero")
  if (!heroBg || REDUCED_MOTION) return

  let visible = true
  let ticking = false

  // Hero ekrandan çıkınca scroll işini bırak
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(hero)

  window.addEventListener(
    "scroll",
    () => {
      if (!visible || ticking) return
      ticking = true
      requestAnimationFrame(() => {
        heroBg.style.transform = `scale(1.06) translate3d(0, ${window.scrollY * 0.22}px, 0)`
        ticking = false
      })
    },
    { passive: true }
  )
}

function initToTop() {
  const btn = document.getElementById("to-top")
  const hero = document.getElementById("hero")

  new IntersectionObserver(([e]) => btn.classList.toggle("visible", !e.isIntersecting), {
    threshold: 0,
  }).observe(hero)

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? "auto" : "smooth" })
  })
}

function dismissLoader() {
  // Yapay gecikme yok: QR okutan müşteri bekliyor
  requestAnimationFrame(() => document.body.classList.add("loaded"))
}

loadMenu()
