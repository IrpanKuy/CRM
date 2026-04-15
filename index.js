/**
 * SISTEM MANAJEMEN PELANGGAN (AdManage System)
 *
 * Logika utama untuk mengelola data pelanggan, statistik,
 * dan fitur ekspor/impor.
 */

// --- PENYIMPANAN DATA (STATE) ---

// List utama penampung data pelanggan
let dataPelanggan = [];

// Daftar pilihan kota untuk dropdown
let listKota = [
  "Bandung",
  "Balikpapan",
  "Denpasar",
  "Jakarta Pusat",
  "Jakarta Selatan",
  "Makassar",
  "Medan",
  "Semarang",
  "Surabaya",
  "Yogyakarta",
];

// Daftar pilihan perusahaan untuk dropdown
let listPerusahaan = [
  "Agensi Kreatif Muda",
  "CV. AdTech Sinergi",
  "Global Advertising Inc.",
  "PT. Kreatif Inspirasi",
  "PT. Media Digital Nusantara",
  "Sinar Mandiri Group",
];

// --- STARTUP APLIKASI ---

// Jalankan fungsi awal saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", () => {
  updateDropdown();
  refreshTampilan();

  const formInput = document.getElementById("customerForm");
  if (formInput) {
    formInput.addEventListener("submit", simpanData);
  }
});

// --- SISTEM MODAL DIALOG KUSTOM (ALERT & PROMPT) ---

// --- Bagian Alert & Konfirmasi ---
function kasihTau(pesan, aksi, tipe = "info") {
  const modal = document.getElementById("alertModal");
  const box = document.getElementById("alertBox");
  const teksPesan = document.getElementById("alertMessage");
  const tombolBatal = document.getElementById("alertBtnCancel");
  const tombolOk = document.getElementById("alertBtnOk");
  const ikon = document.getElementById("alertIcon");
  const judul = document.getElementById("alertTitle");

  teksPesan.innerText = pesan;
  tombolBatal.classList.add("hidden"); // Default hidden

  // Atur Gaya Dialog berdasarkan Tipe
  if (tipe === "error") {
    judul.innerText = "Error";
    ikon.className = "fas fa-times-circle text-red-500 mr-2";
  } else if (tipe === "confirm" || (aksi && pesan.includes("?"))) {
    judul.innerText = "Konfirmasi";
    tombolBatal.classList.remove("hidden");
    ikon.className = "fas fa-question-circle text-amber-500 mr-2";
  } else {
    judul.innerText = "Info";
    ikon.className = "fas fa-info-circle text-blue-500 mr-2";
  }

  tombolOk.onclick = () => {
    if (aksi) aksi();
    tutupAlert();
  };
  tombolBatal.onclick = tutupAlert;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  setTimeout(() => {
    box.classList.remove("scale-95", "opacity-0");
    box.classList.add("scale-100", "opacity-100");
  }, 10);
}

function mintaKonfirmasi(pesan, aksi) {
  // Alias untuk kasihTau dengan logika konfirmasi
  kasihTau(pesan, aksi);
}

function tutupAlert() {
  const modal = document.getElementById("alertModal");
  const box = document.getElementById("alertBox");
  box.classList.remove("scale-100", "opacity-100");
  box.classList.add("scale-95", "opacity-0");
  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }, 200);
}

// --- Bagian Prompt (Input) ---
function mintaInput(pesan, aksi) {
  const modal = document.getElementById("promptModal");
  const box = document.getElementById("promptBox");
  const teksPesan = document.getElementById("promptMessage");
  const inputTeks = document.getElementById("promptInput");
  const tombolBatal = document.getElementById("promptBtnCancel");
  const tombolOk = document.getElementById("promptBtnOk");

  teksPesan.innerText = pesan;
  inputTeks.value = "";

  tombolOk.onclick = () => {
    if (aksi) aksi(inputTeks.value);
    tutupPrompt();
  };
  tombolBatal.onclick = tutupPrompt;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  setTimeout(() => {
    box.classList.remove("scale-95", "opacity-0");
    box.classList.add("scale-100", "opacity-100");
    inputTeks.focus();
  }, 10);
}

function tutupPrompt() {
  const modal = document.getElementById("promptModal");
  const box = document.getElementById("promptBox");
  box.classList.remove("scale-100", "opacity-100");
  box.classList.add("scale-95", "opacity-0");
  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }, 200);
}

// --- KELOLA LIST MASTER (KOTA & PERUSAHAAN) ---

// Fungsi buat nge-update isi dropdown dari list master
function updateDropdown() {
  const selectKota = document.getElementById("formKota");
  const selectPT = document.getElementById("formPerusahaan");

  if (!selectKota || !selectPT) return;

  const kotaPilihan = selectKota.value;
  const ptPilihan = selectPT.value;

  // Reset dan isi ulang Kota
  selectKota.innerHTML = '<option value="">Pilih Kota</option>';
  listKota.sort().forEach((k) => selectKota.add(new Option(k, k)));
  if (listKota.includes(kotaPilihan)) selectKota.value = kotaPilihan;

  // Reset dan isi ulang Perusahaan
  selectPT.innerHTML = '<option value="">Pilih Perusahaan</option>';
  listPerusahaan.sort().forEach((p) => selectPT.add(new Option(p, p)));
  if (listPerusahaan.includes(ptPilihan)) selectPT.value = ptPilihan;
}

function tambahDataPT() {
  mintaInput("Masukkan nama Perusahaan baru:", (namaBaru) => {
    if (!namaBaru || namaBaru.trim() === "") {
      return kasihTau("Nama perusahaan tidak boleh kosong!", null, "error");
    }

    const namaFix = namaBaru.trim();
    // Cek duplikat (nggak peka huruf besar-kecil)
    const sudahAda = listPerusahaan.some(
      (p) => p.toLowerCase() === namaFix.toLowerCase(),
    );

    if (!sudahAda) {
      listPerusahaan.push(namaFix);
      updateDropdown();
      document.getElementById("formPerusahaan").value = namaFix;
    } else {
      kasihTau(`Perusahaan "${namaFix}" sudah terdaftar.`, null, "error");
    }
  });
}

function hapusDataPT() {
  const pilihan = document.getElementById("formPerusahaan").value;
  if (!pilihan) return kasihTau("Pilih dulu perusahaan yang mau dihapus.");

  // Cek dulu apakah ada pelanggan yang pakai perusahaan ini
  const adaYgPakai = dataPelanggan.some((p) => p.perusahaan === pilihan);
  if (adaYgPakai)
    return kasihTau("Gagal! Perusahaan ini masih dipakai oleh data pelanggan.");

  mintaKonfirmasi(`Yakin mau hapus "${pilihan}" dari list?`, () => {
    listPerusahaan = listPerusahaan.filter((p) => p !== pilihan);
    updateDropdown();
  });
}

function tambahDataKota() {
  mintaInput("Masukkan nama Kota baru:", (namaBaru) => {
    if (!namaBaru || namaBaru.trim() === "") {
      return kasihTau("Nama kota tidak boleh kosong!", null, "error");
    }

    const namaFix = namaBaru.trim();
    // Cek duplikat (nggak peka huruf besar-kecil)
    const sudahAda = listKota.some(
      (k) => k.toLowerCase() === namaFix.toLowerCase(),
    );

    if (!sudahAda) {
      listKota.push(namaFix);
      updateDropdown();
      document.getElementById("formKota").value = namaFix;
    } else {
      kasihTau(`Kota "${namaFix}" sudah ada dalam daftar.`, null, "error");
    }
  });
}

function hapusDataKota() {
  const pilihan = document.getElementById("formKota").value;
  if (!pilihan) return kasihTau("Pilih dulu kota yang mau dihapus.");

  const adaYgPakai = dataPelanggan.some((p) => p.kota === pilihan);
  if (adaYgPakai)
    return kasihTau("Gagal! Kota ini masih dipakai oleh data pelanggan.");

  mintaKonfirmasi(`Yakin mau hapus "${pilihan}" dari list?`, () => {
    listKota = listKota.filter((k) => k !== pilihan);
    updateDropdown();
  });
}

// --- RENDER TAMPILAN (TABEL & STATISTIK) ---

function refreshTampilan() {
  updateStatistik();
  buatTabel(dataPelanggan);
}

function updateStatistik() {
  const elTotal = document.getElementById("statTotal");
  if (elTotal) elTotal.innerText = dataPelanggan.length;

  const hitungKota = {};
  const hitungPT = {};

  dataPelanggan.forEach((p) => {
    hitungKota[p.kota] = (hitungKota[p.kota] || 0) + 1;
    hitungPT[p.perusahaan] = (hitungPT[p.perusahaan] || 0) + 1;
  });

  // Cetak ke layar (Stats Kota)
  const boxKota = document.getElementById("statCity");
  if (boxKota) {
    boxKota.innerHTML = "";
    const sorted = Object.entries(hitungKota).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) {
      boxKota.innerHTML =
        '<p class="text-slate-500 text-sm italic">Belum ada data...</p>';
    } else {
      sorted.forEach(([k, jml]) => {
        boxKota.innerHTML += `
                    <div class="flex justify-between items-center mb-2 border-b border-slate-300 border-dashed pb-1 last:border-0">
                        <span class="text-sm text-slate-700 truncate pr-2">${k}</span>
                        <span class="bg-slate-700 text-white text-xs py-0.5 px-2 rounded-full font-bold">${jml}</span>
                    </div>
                `;
      });
    }
  }

  // Cetak ke layar (Stats Perusahaan)
  const boxPT = document.getElementById("statCompany");
  if (boxPT) {
    boxPT.innerHTML = "";
    const sorted = Object.entries(hitungPT).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) {
      boxPT.innerHTML =
        '<p class="text-slate-500 text-sm italic">Belum ada data...</p>';
    } else {
      sorted.forEach(([p, jml]) => {
        boxPT.innerHTML += `
                    <div class="flex justify-between items-center mb-2 border-b border-slate-300 border-dashed pb-1 last:border-0">
                        <span class="text-sm text-slate-700 truncate pr-2" title="${p}">${p}</span>
                        <span class="bg-slate-700 text-white text-xs py-0.5 px-2 rounded-full font-bold">${jml}</span>
                    </div>
                `;
      });
    }
  }
}

function buatTabel(listData) {
  const bodiTabel = document.getElementById("tableBody");
  const infoKosong = document.getElementById("emptyState");
  if (!bodiTabel || !infoKosong) return;

  if (listData.length === 0) {
    bodiTabel.innerHTML = "";
    infoKosong.classList.remove("hidden");
  } else {
    infoKosong.classList.add("hidden");
    let html = "";
    listData.forEach((p, i) => {
      html += `
                <tr class="bg-white border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-3 font-medium text-slate-500">${i + 1}</td>
                    <td class="px-6 py-3 font-semibold text-slate-800">${p.nama}</td>
                    <td class="px-6 py-3">${p.perusahaan}</td>
                    <td class="px-6 py-3">${p.kota}</td>
                    <td class="px-6 py-3 text-slate-600">${p.email}</td>
                    <td class="px-6 py-3">${p.hp}</td>
                    <td class="px-6 py-3 truncate max-w-xs" title="${p.alamat}">${p.alamat}</td>
                </tr>
            `;
    });
    bodiTabel.innerHTML = html;
  }
}

// --- FITUR FORM & PENCARIAN ---

function cariSekarang() {
  const cariInput = document.getElementById("searchInput");
  if (!cariInput) return;

  const keyword = cariInput.value.toLowerCase();
  const hasil = dataPelanggan.filter((p) => {
    return (
      (p.nama || "").toLowerCase().includes(keyword) ||
      (p.perusahaan || "").toLowerCase().includes(keyword) ||
      (p.kota || "").toLowerCase().includes(keyword) ||
      (p.email || "").toLowerCase().includes(keyword) ||
      (p.hp || "").toLowerCase().includes(keyword) ||
      (p.alamat || "").toLowerCase().includes(keyword)
    );
  });
  buatTabel(hasil);
}

function bukaForm() {
  const modal = document.getElementById("customerModal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    const fokus = document.getElementById("formNama");
    if (fokus) fokus.focus();
  }
}

function tutupForm() {
  const modal = document.getElementById("customerModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    const form = document.getElementById("customerForm");
    if (form) form.reset();
    const alertBox = document.getElementById("successAlert");
    if (alertBox) alertBox.classList.add("hidden");
  }
}

let timeoutSukses;

function simpanData(e) {
  if (e) e.preventDefault();

  const dataBaru = {
    nama: document.getElementById("formNama").value.trim(),
    perusahaan: document.getElementById("formPerusahaan").value,
    kota: document.getElementById("formKota").value,
    email: document.getElementById("formEmail").value.trim(),
    hp: document.getElementById("formHp").value.trim(),
    alamat: document.getElementById("formAlamat").value.trim(),
  };

  // --- VALIDASI MANUAL ---

  // 1. Cek field yang wajib diisi
  if (
    !dataBaru.nama ||
    !dataBaru.perusahaan ||
    !dataBaru.kota ||
    !dataBaru.email ||
    !dataBaru.hp ||
    !dataBaru.alamat
  ) {
    return kasihTau(
      "Semua data yang bertanda bintang (*) wajib diisi!",
      null,
      "error",
    );
  }

  // 2. Validasi Format Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(dataBaru.email)) {
    return kasihTau("Format email tidak valid!", null, "error");
  }

  // 3. Validasi Format No HP (Angka saja, minimal 9 maksimal 15)
  const hpRegex = /^[0-9]{9,15}$/;
  if (!hpRegex.test(dataBaru.hp)) {
    return kasihTau(
      "Nomor HP harus berupa angka dan berjumlah 9-15 digit!",
      null,
      "error",
    );
  }

  // --- PROSES SIMPAN DATA ---
  dataPelanggan.push(dataBaru);
  refreshTampilan();
  cariSekarang();

  const form = document.getElementById("customerForm");
  if (form) form.reset();
  document.getElementById("formNama").focus();

  // Notif sukses
  const notif = document.getElementById("successAlert");
  if (notif) {
    notif.classList.remove("hidden");
    clearTimeout(timeoutSukses);
    timeoutSukses = setTimeout(() => notif.classList.add("hidden"), 3000);
  }
}

// --- EKSPOR & IMPOR ---

function eksporData() {
  if (dataPelanggan.length === 0)
    return kasihTau("Belum ada data untuk diekspor!");

  const isiJson = JSON.stringify(dataPelanggan, null, 2);
  const blob = new Blob([isiJson], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Data_Pelanggan_${new Date().toISOString().split("T")[0]}.txt`;
  link.click();
}

function imporData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const hasil = JSON.parse(e.target.result);
      if (Array.isArray(hasil)) {
        const valid = hasil.every((p) => p.nama && p.perusahaan && p.kota);
        if (valid) {
          dataPelanggan = [...dataPelanggan, ...hasil];
          // Update master list kalau ada yang baru
          hasil.forEach((p) => {
            if (!listKota.includes(p.kota)) listKota.push(p.kota);
            if (!listPerusahaan.includes(p.perusahaan))
              listPerusahaan.push(p.perusahaan);
          });
          updateDropdown();
          refreshTampilan();
          cariSekarang();
          kasihTau(`Sip! ${hasil.length} data baru masuk.`);
        } else {
          kasihTau("Format datanya nggak sesuai.", null, "error");
        }
      } else {
        kasihTau("Isi file-nya harus list array.", null, "error");
      }
    } catch (err) {
      kasihTau("Gagal baca file. Pastikan formatnya bener.", null, "error");
    }
    event.target.value = "";
  };
  reader.readAsText(file);
}
