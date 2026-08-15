# EXCORE — Executive SaaS & Operations Ecosystem

Dasbor eksekutif modern, non-generik, dan responsif yang dirancang menggunakan arsitektur antarmuka SaaS berkinerja tinggi serta di-generate melalui **Google Stitch MCP & Gemini 3.1 Pro**.

---

## ✨ Karakteristik & Keunggulan Desain (Non-Generic)

1. **Tipografi Modern & Presisi**:
   - Memadukan font **Geist**, **Plus Jakarta Sans**, dan **JetBrains Mono** untuk visual data density yang tajam dan mudah dibaca.
2. **Ikon Vektor Lucide/Feather Standar Industri**:
   - Seluruh navigasi, kartu metrik KPI, tombol aksi, dan status gateway menggunakan SVG icon geometri presisi (stroke width 1.8px-2.0px), bukan emoji atau ikon generik AI.
3. **Arsitektur Visual Obsidian Dark & Clean Light**:
   - Tema *Obsidian Slate* (`#090D16`) dengan aksen *Electric Violet* (`#8B5CF6`), *Indigo* (`#6366F1`), *Mint Emerald* (`#10B981`), dan *Warm Amber* (`#F59E0B`).
   - Efek *glassmorphic topbar* (`backdrop-filter: blur(14px)`), kartu bergaris batas halus (*subtle 1px border elevation*), dan efek glowing interaktif.
4. **Visualisasi Data Chart.js Real-time (Dual Series)**:
   - Grafik interaktif *Actual Revenue* vs *Target Trajectory* dengan tooltip kustom dan filter periode (6 Bulan, 12 Bulan, 30 Hari) yang otomatis menyesuaikan tema.
5. **Katalog Produk Berkecepatan Tinggi (Inventory Health)**:
   - Menampilkan volume unit terjual, visual progress bar level stok gudang, dan indikator status *In Stock / Low Stock*.
6. **Live Transaction Ledger Table**:
   - Kode referensi `#ORD`, inisial avatar pelanggan berwarna, cap waktu *real-time*, nominal Rupiah (IDR), dan status pembayaran (*Settled, Processing, Refunded*).
7. **Pencarian Live & Shortcut Keyboard (`⌘K` / `Ctrl+K`)**:
   - Filter pencarian cepat untuk transaksi, pelanggan, maupun SKU.
8. **Fitur Ekspor CSV & Toast Feedback Engine**:
   - Mengunduh rekap transaksi langsung ke file `.csv` dengan umpan balik visual animasi instan.

---

## 📂 Struktur Proyek

Proyek ini telah dibundel rapi dalam 1 folder khusus:
- **`PulseOps-Dashboard/`** (Folder proyek mandiri)
  - `index.html`: Struktur semantik HTML5, SVG icons, dan tab routing.
  - `style.css`: Token desain, variabel tema, layout responsif, dan animasi.
  - `script.js`: Logika interaktif, router URL hash, Chart.js engine, dan ekspor CSV.
- `stitch_screen.html`: Blueprint screen mentah yang dihasilkan langsung dari Google Stitch MCP.

---

## 🚀 Cara Menjalankan

Cukup buka file `index.html` (baik di root folder maupun di dalam folder `PulseOps-Dashboard`) langsung di browser Chrome, Edge, Safari, atau Firefox.
