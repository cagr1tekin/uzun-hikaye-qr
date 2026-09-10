# Uzun Hikaye — QR Menü

Okey salonu için statik, veritabanısız QR menü. Detaylı plan: [PLAN.md](./PLAN.md)

**8 kategori · 64 ürün** — kaynak: 01.09.2026 tarihli fiziksel menü panosu.

## Hızlı Başlangıç

**`index.html`'e çift tıklamayın** — tarayıcı `file://` adresinde `menu.json`
dosyasını okumayı engeller, sayfa "Failed to fetch" hatası verir. Küçük bir
yerel sunucu gerekir.

**Windows'ta:** `Baslat.bat` dosyasına çift tıklayın. Sunucuyu başlatır ve
menüyü tarayıcıda açar. Pencereyi kapatınca sunucu durur.

**Elle:**

```bash
cd uzun-hikaye-qr
python -m http.server 8080
# veya: npx serve .
```

Sonra tarayıcıda aç: `http://localhost:8080/index.html`

> Bu yalnızca yerel önizleme için. Vercel'e yüklendiğinde site zaten
> HTTP üzerinden sunulur, ek bir adım gerekmez.


## Menü Güncelleme

Tek veri kaynağı `data/menu.json`. Başka hiçbir dosyaya dokunmak gerekmez —
kategoriler, sekmeler ve ürün sayaçları bu dosyadan otomatik üretilir.

```json
{
  "salon": {
    "ad": "Uzun Hikaye",
    "etiket": "Okey Salonu",
    "baslik": "Ne içmek istersiniz?",
    "altBaslik": "Siparişinizi söyleyin, masanıza getirelim.",
    "heroGorsel": "assets/images/hero.webp",
    "fiyatTarihi": "01.09.2026",
    "kdvNotu": "Fiyatlarımıza KDV dahildir."
  },
  "menu": [
    {
      "kategoriGosterim": "Çaylar",
      "kisaAd": "Çay",
      "urunler": [{ "urun": "Çay", "fiyat": 20 }]
    }
  ]
}
```

| Alan | Ne işe yarar |
|------|--------------|
| `kategoriGosterim` | Bölüm başlığı (ör. `Frozen & Milkshake`) |
| `kisaAd` | Sekme etiketi — kısa tutun, sekme çubuğu yatay kaydırılır |
| `fiyatTarihi` | Footer'daki "Fiyat güncelleme" notu |
| `fiyat` | Sadece sayı yazın; `₺` işaretini arayüz ekler |

Fiyat zammında yapılacak tek iş: ilgili `fiyat` değerlerini ve `fiyatTarihi`'ni
güncellemek.

## QR Kod ve Yönlendirme

### Neden araya bir yönlendirme koyuyoruz

Basılı QR kod **değiştirilemez**. Masalara yapıştırıldıktan sonra adresi
değiştirmek, tüm masaları tek tek dolaşıp yeniden yapıştırmak demektir.

Bu yüzden QR doğrudan menüye değil, `/menu` adresine gider. O adres de
`data/yonlendirme.json` dosyasındaki hedefe yönlendirir:

```
QR kod  →  https://<siteniz>/menu  →  yonlendirme.json → hedef
           (asla değişmez)             (istediğiniz zaman değişir)
```

Domain aldığınızda, menüyü başka bir yere taşıdığınızda ya da geçici olarak
Instagram sayfanıza yönlendirmek istediğinizde tek yapılacak şu dosyayı
güncellemek:

```json
{
  "hedef": "https://uzunhikaye.com/menu",
  "aktif": true,
  "kapaliMesaji": "Menü şu anda güncelleniyor. Kısa süre sonra tekrar deneyin.",
  "gecikmeMs": 0
}
```

| Alan | Ne yapar |
|------|----------|
| `hedef` | Yönlendirilecek adres. Göreli (`index.html`) veya tam adres olabilir. |
| `aktif` | `false` yapılırsa yönlendirme durur, ziyaretçiye `kapaliMesaji` görünür. |
| `gecikmeMs` | `0` = anında. Değer verilirse önce salon adı görünür, sonra yönlendirir. |

Hedef yanlışlıkla `go.html`'in kendisine ayarlanırsa sonsuz döngüye girmez,
doğrudan menüye düşer.

### QR kodu üretme

1. Siteyi yayına alın
2. `https://<siteniz>/qr.html` sayfasını açın
3. Üstteki kutuya **kalıcı adresi** yazın — `https://<siteniz>/menu`
4. **PNG olarak indir** (baskı için 720px)
5. Yazdırmadan önce telefondan okutup menünün geldiğini doğrulayın

> **Önemli:** QR'ı yalnızca kalıcı adresiniz belli olduktan sonra bastırın.
> Kendi domaininizi alacaksanız önce onu bağlayın, QR'a o adresi yazın.
> `*.vercel.app` adresine bastırırsanız o adres sonsuza kadar ayakta kalmalıdır.

## Yayına Alma (Vercel)

Repo Vercel'e bağlandığında build adımı gerekmez — statik klasör olduğu gibi
sunulur.

1. Vercel → **Add New Project** → bu repoyu seçin
2. Framework Preset: **Other**, Build Command boş, Output Directory boş
3. Deploy

`vercel.json` şunları ayarlar:

- `/menu` adresini `go.html`'e bağlar (QR bu adresi gösterir)
- `menu.json` ve `yonlendirme.json` önbelleğe alınmaz — fiyat değişikliği
  anında yayına girer
- Görseller bir yıl önbelleğe alınır

### Kendi domaininizi bağlama

Vercel → Project → Settings → Domains → domaini ekleyin. QR'da yazan adres
`https://uzunhikaye.com/menu` olur ve bir daha hiç değişmez.


## Dosya Yapısı

```
Baslat.bat              Windows: sunucuyu başlat + tarayıcıda aç
index.html              Menü sayfası
go.html                 QR'ın gittiği yönlendirme sayfası (/menu)
qr.html                 QR üretici (işletme içi, noindex)
vercel.json             Yayın ayarları: /menu yolu, önbellek kuralları
css/style.css           Tek stil dosyası
js/app.js               JSON okur, kategorileri render eder
js/vendor/qrcode.min.js QR kütüphanesi (gömülü, CDN'e bağımlı değil)
data/menu.json          Menü verisi
data/yonlendirme.json   QR'ın hedefi
assets/images/
  hero.webp             Masaüstü hero (54 KB)
  hero-sm.webp          Mobil hero (26 KB)
  hero.jpg / hero-sm.jpg  WebP desteklemeyen tarayıcılar için yedek
  hero-original.jpg     Kırpılmamış orijinal
```

## Renk Paleti

Fiziksel menü panosundaki turuncu esas alındı.

| Rol | Kod |
|-----|-----|
| Vurgu | `#fe683c` |
| Vurgu (metin/ikon) | `#ff7d55` |
| Arka plan | `#0a0a0a` |
| Kart | `#191919` |
| Birincil metin | `#ffffff` |
| İkincil metin | `#b6bcc6` |
| Soluk metin | `#8a9099` |

Metin renkleri koyu zeminde 4.5:1 kontrast eşiğinin üstünde.

## Erişilebilirlik & Mobil Notları

- Dokunma hedefleri her ekran genişliğinde en az 44×44px
- Gövde metni 320px genişlikte bile 16px
- `env(safe-area-inset-*)` ile çentik ve ana ekran çubuğu boşlukları
- `prefers-reduced-motion` desteklenir; hareket tamamen kapanır
- Klavye: sekmelerde ok tuşlarıyla gezinme, görünür odak halkası
- 320 / 375 / 390 / 430 / 768 / 1024 / 1440px genişliklerde yatay kaydırma yok
- JavaScript kapalıysa açıklayıcı `<noscript>` mesajı görünür
