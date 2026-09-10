# Uzun Hikaye — Okey Salonu QR Menü Planı

> Statik, DB'siz, tek işletmeli QR menü. Mevcut `qr-menu` SaaS reposundan tamamen bağımsız.

---

## 1. Amaç

Okey salonu müşterileri masadaki QR kodu okutunca telefonda **sadece içecek/yiyecek menüsünü** görsün.

- Sipariş sistemi yok (garson/servis masadan alır)
- Giriş / kayıt yok
- Veritabanı yok
- Menü güncellemesi = `data/menu.json` dosyasını düzenlemek

---

## 2. Renk Paleti

Fiziksel menü panosundaki turuncu esas alındı. Metin renkleri koyu zeminde
4.5:1 kontrast eşiğinin üstünde.

| Rol | Kod |
|-----|-----|
| Ana vurgu (dolgu) | `#fe683c` |
| Vurgu (metin / ikon) | `#ff7d55` |
| Arka plan | `#0a0a0a` |
| Kart | `#191919` |
| Birincil metin | `#ffffff` |
| İkincil metin | `#b6bcc6` |
| Soluk metin | `#8a9099` |
| Ayraç | `rgba(254,104,60,0.22)` |

**Görsel his:** Koyu zemin, temiz liste, ürün adı solda / fiyat sağda.
Kategori bölümleri fotoğraf banner'ı yerine tipografik başlık kullanır.

---

## 3. Menü Verisi (`data/menu.json`)

Kaynak: **01.09.2026 tarihli fiziksel menü panosu** (4 sütun × 16 satır = 64 ürün).

Panonun sütun düzeni fiziksel bir kısıt; telefonda anlamı yok. Ürünler türlerine
göre yeniden gruplandı:

| Kategori | Sekme adı | Ürün |
|----------|-----------|------|
| Çaylar | Çay | 17 |
| Türk Kahveleri | Türk Kahvesi | 4 |
| Sıcak Kahveler | Sıcak Kahve | 13 |
| Soğuk Kahveler | Soğuk Kahve | 6 |
| Sıcak İçecekler | Sıcak İçecek | 3 |
| Frozen & Milkshake | Frozen | 6 |
| Soğuk İçecekler | Soğuk İçecek | 8 |
| Tatlı & Çerez | Tatlı | 7 |

**Toplam:** 64 ürün

Panodaki iki not da arayüze taşındı: `fiyatTarihi` (01.09.2026) ve `kdvNotu`
footer'da gösteriliyor.


## 4. Sayfa Yapısı

```
uzun-hikaye-qr/
├── index.html          → Ana menü (QR buraya yönlendirir)
├── qr.html             → QR kod üretici (salon sahibi için)
├── css/style.css       → Renk paleti + mobil layout
├── js/app.js           → JSON oku, kategorileri render et
├── data/menu.json      → Tek veri kaynağı
├── PLAN.md             → Bu dosya
└── README.md           → Kurulum & güncelleme rehberi
```

### index.html — Bölümler

1. **Sticky header** — Logo nokta + "UZUN HİKAYE" + "Menü" etiketi
2. **Hero** — "Ne içmek istersiniz?" (turuncu vurgu)
3. **Kategori sekmeleri** (opsiyonel v2) — 5 kategori arası hızlı geçiş
4. **Menü listesi** — Her kategori kart içinde, ürün + fiyat satırı
5. **Footer** — "Fiyatlar ₺ cinsindendir" notu

### qr.html

- Menü URL'sini QR'a çevirir
- Basılı QR için indirilebilir PNG (v2)

---

## 5. Teknik Kararlar

| Konu | Karar | Neden |
|------|-------|-------|
| Framework | **Vanilla HTML/CSS/JS** | Build yok, hosting kolay |
| Veri | **JSON dosyası** | DB gereksiz |
| Hosting | Vercel (statik) | Ücretsiz, build yok, domain bağlanabilir |
| Mobil | Mobile-first | QR telefondan açılır |
| Görsel | Sadece hero; kategori bölümleri tipografik | Uzak görsel isteği yok, QR açılışı hızlı |

---

## 6. Dağıtım Akışı

```
menu.json düzenle → git push → Vercel otomatik deploy

QR bir kez basılır:
qr.html'den /menu adresini yazdır → masaya koy → bir daha değiştirme
Taşınma gerekirse: yonlendirme.json'daki hedefi değiştir, QR aynı kalır
```

**QR'ın gittiği adres:** ayrı bir Vercel projesi (`yonlendirme.vercel.app`).
O proje bu siteye yönlendirir. Menü taşınırsa yönlendiricinin hedefi değişir,
basılı QR aynı kalır.

---

## 7. Yol Haritası

### Faz 1 — MVP
- [x] Klasör yapısı
- [x] Renk paleti uygulanmış menü sayfası
- [x] menu.json'dan otomatik render
- [x] qr.html ile QR üretimi

### Faz 2 — İyileştirme
- [x] Kategori sekmeleri (sticky, yatay kaydırmalı, aktif göstergeli)
- [x] Panodaki 64 ürünün girilmesi ve mantıksal kategorilere ayrılması
- [x] Mobil düzeltmeler (safe-area, 44px dokunma hedefi, 16px metin)
- [x] QR PNG indirme (baskı için 720px)
- [x] Masaüstünde iki kolonlu liste
- [ ] Ürün arama (64 kalemde işe yarar)
- [x] QR yönlendirme katmanı — ayrı repo/proje olarak ayrıldı
- [ ] PWA (çevrimdışı önbellek)
- [x] Hero görseli değiştirildi (Unsplash, yüksek çözünürlük, mobil/masaüstü iki boyut)
- [ ] Salonun kendi fotoğrafı (mevcut hero hâlâ stok görsel)

### Faz 3 — Opsiyonel
- [ ] Çoklu dil (TR/EN)
- [ ] Ürün açıklamaları / alerjen notu


## 8. Mevcut Repo ile Fark

| | qr-menu (SaaS) | uzun-hikaye-qr |
|--|----------------|----------------|
| DB | MongoDB | Yok |
| Auth | Var | Yok |
| Sipariş | Var | Yok |
| Hedef | Çoklu işletme | Tek salon |
| Güncelleme | Admin panel | JSON dosyası |
| Karmaşıklık | Yüksek | Minimal |

---

## 9. Sonraki Adım

1. `index.html`'i tarayıcıda aç → menü görünüyor mu kontrol et
2. Vercel'e deploy et
3. `qr.html`'den QR oluştur, yazdır
4. Kategori isimlerini onayla veya değiştir (`data/menu.json` → `kategoriGosterim`)
