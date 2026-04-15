/**
 * SISTEM MANAJEMEN CUSTOMER PERIKLANAN (AdManage System)
 * 
 * File ini menangani seluruh logika aplikasi, mulai dari pengelolaan state data,
 * manipulasi DOM untuk tabel dan dashboard, hingga sistem dialog kustom.
 */

// --- STATE DATA APLIKASI ---

/**
 * Variabel global untuk menyimpan daftar customer.
 * Data disimpan dalam bentuk array of objects.
 */
let customers = [];

/**
 * Daftar Master Data Kota untuk pilihan di dropdown.
 * Daftar ini bersifat dinamis (bisa bertambah via UI).
 */
let masterCities = [
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

/**
 * Daftar Master Data Perusahaan untuk pilihan di dropdown.
 * Daftar ini bersifat dinamis (bisa bertambah via UI).
 */
let masterCompanies = [
    "Agensi Kreatif Muda",
    "CV. AdTech Sinergi",
    "Global Advertising Inc.",
    "PT. Kreatif Inspirasi",
    "PT. Media Digital Nusantara",
    "Sinar Mandiri Group",
];

// --- INISIALISASI APLIKASI ---

/**
 * Menunggu seluruh konten DOM dimuat sebelum menjalankan logika awal.
 */
document.addEventListener("DOMContentLoaded", () => {
    // Merender pilihan kota dan perusahaan ke elemen <select>
    renderDropdowns();
    
    // Melakukan render awal untuk dashboard dan tabel (data awal kosong)
    renderAll();

    // Mendaftarkan event listener untuk pengiriman formulir customer
    const customerForm = document.getElementById("customerForm");
    if (customerForm) {
        customerForm.addEventListener("submit", saveCustomer);
    }
});

// --- SISTEM DIALOG KUSTOM (Alert, Confirm, Prompt) ---

/**
 * Variabel untuk menyimpan fungsi callback saat konfirmasi dialog disetujui.
 */
let dialogConfirmCallback = null;

/**
 * Fungsi utama untuk menampilkan modal dialog kustom.
 * @param {Object} options - Konfigurasi dialog (type, title, message, onConfirm)
 */
function showDialog({ type, title, message, onConfirm }) {
    const modal = document.getElementById("customDialogModal");
    const box = document.getElementById("customDialogBox");
    const titleEl = document.getElementById("dialogTitle");
    const msgEl = document.getElementById("dialogMessage");
    const inputEl = document.getElementById("dialogInput");
    const btnCancel = document.getElementById("dialogBtnCancel");
    const btnOk = document.getElementById("dialogBtnOk");
    const iconEl = document.getElementById("dialogIcon");

    titleEl.innerText = title;
    msgEl.innerText = message;
    dialogConfirmCallback = onConfirm;

    // Reset status tampilan elemen input dan tombol batal
    btnCancel.classList.add("hidden");
    inputEl.classList.add("hidden");
    inputEl.value = "";

    // Mengatur icon berdasarkan tipe dialog
    if (type === "alert") {
        iconEl.className = "fas fa-exclamation-triangle text-amber-500 mr-2";
    } else if (type === "confirm") {
        iconEl.className = "fas fa-question-circle text-blue-500 mr-2";
    } else {
        iconEl.className = "fas fa-edit text-slate-500 mr-2";
    }

    // Event handler untuk tombol
    btnCancel.onclick = closeDialog;
    btnOk.onclick = () => {
        if (type === "prompt") {
            if (onConfirm) onConfirm(inputEl.value);
        } else {
            if (onConfirm) onConfirm();
        }
        closeDialog();
    };

    // Tampilkan elemen tambahan jika tipe adalah prompt atau confirm
    if (type === "prompt") {
        inputEl.classList.remove("hidden");
        btnCancel.classList.remove("hidden");
        setTimeout(() => inputEl.focus(), 100);
    } else if (type === "confirm") {
        btnCancel.classList.remove("hidden");
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    // Animasi masuk modal (menggunakan timeout kecil agar transisi CSS berjalan)
    setTimeout(() => {
        box.classList.remove("scale-95", "opacity-0");
        box.classList.add("scale-100", "opacity-100");
    }, 10);
}

/**
 * Fungsi untuk menutup modal dialog kustom dengan animasi.
 */
function closeDialog() {
    const modal = document.getElementById("customDialogModal");
    const box = document.getElementById("customDialogBox");

    // Animasi keluar
    box.classList.remove("scale-100", "opacity-100");
    box.classList.add("scale-95", "opacity-0");

    setTimeout(() => {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
        dialogConfirmCallback = null;
    }, 200);
}

/**
 * Helper untuk memanggil alert kustom.
 */
const myAlert = (message) =>
    showDialog({ type: "alert", title: "Perhatian", message });

/**
 * Helper untuk memanggil dialog konfirmasi kustom.
 */
const myConfirm = (message, onConfirm) =>
    showDialog({
        type: "confirm",
        title: "Konfirmasi",
        message,
        onConfirm,
    });

/**
 * Helper untuk memanggil dialog input (prompt) kustom.
 */
const myPrompt = (message, onConfirm) =>
    showDialog({ type: "prompt", title: "Input Data", message, onConfirm });

// --- MANAJEMEN DROPDOWN (MASTER DATA) ---

/**
 * Fungsi untuk merender ulang isi dari dropdown Kota dan Perusahaan.
 * Selalu mengambil data terbaru dari array masterCities dan masterCompanies.
 */
function renderDropdowns() {
    const citySelect = document.getElementById("formKota");
    const companySelect = document.getElementById("formPerusahaan");

    if (!citySelect || !companySelect) return;

    // Simpan nilai yang sedang terpilih agar tidak hilang saat re-render
    const currentCity = citySelect.value;
    const currentCompany = companySelect.value;

    // Render Dropdown Kota
    citySelect.innerHTML = '<option value="">Pilih Kota</option>';
    masterCities.sort().forEach((city) => {
        citySelect.add(new Option(city, city));
    });
    if (masterCities.includes(currentCity)) citySelect.value = currentCity;

    // Render Dropdown Perusahaan
    companySelect.innerHTML = '<option value="">Pilih Perusahaan</option>';
    masterCompanies.sort().forEach((company) => {
        companySelect.add(new Option(company, company));
    });
    if (masterCompanies.includes(currentCompany))
        companySelect.value = currentCompany;
}

/**
 * Menambahkan perusahaan baru ke dalam daftar master data.
 */
function addCompany() {
    myPrompt("Masukkan nama Perusahaan baru:", (newVal) => {
        if (newVal && newVal.trim() !== "") {
            const trimmed = newVal.trim();
            if (!masterCompanies.includes(trimmed)) {
                masterCompanies.push(trimmed);
                renderDropdowns();
                document.getElementById("formPerusahaan").value = trimmed;
            } else {
                myAlert("Perusahaan tersebut sudah terdaftar dalam pilihan.");
            }
        }
    });
}

/**
 * Menghapus perusahaan dari daftar master data.
 * Dilengkapi validasi agar tidak menghapus data yang sedangan digunakan oleh customer.
 */
function deleteCompany() {
    const select = document.getElementById("formPerusahaan");
    const val = select.value;
    if (!val) {
        myAlert("Silakan pilih perusahaan yang ingin dihapus terlebih dahulu.");
        return;
    }

    // Validasi: Cek jika ada customer yang menggunakan perusahaan ini
    const isUsed = customers.some((c) => c.perusahaan === val);
    if (isUsed) {
        myAlert(`Gagal menghapus! Perusahaan "${val}" masih digunakan oleh data customer.`);
        return;
    }

    myConfirm(`Apakah Anda yakin ingin menghapus "${val}" dari daftar pilihan?`, () => {
        masterCompanies = masterCompanies.filter((c) => c !== val);
        renderDropdowns();
    });
}

/**
 * Menambahkan kota baru ke dalam daftar master data.
 */
function addCity() {
    myPrompt("Masukkan nama Kota baru:", (newVal) => {
        if (newVal && newVal.trim() !== "") {
            const trimmed = newVal.trim();
            if (!masterCities.includes(trimmed)) {
                masterCities.push(trimmed);
                renderDropdowns();
                document.getElementById("formKota").value = trimmed;
            } else {
                myAlert("Kota tersebut sudah terdaftar dalam pilihan.");
            }
        }
    });
}

/**
 * Menghapus kota dari daftar master data.
 * Dilengkapi validasi penggunaan data.
 */
function deleteCity() {
    const select = document.getElementById("formKota");
    const val = select.value;
    if (!val) {
        myAlert("Silakan pilih kota yang ingin dihapus terlebih dahulu.");
        return;
    }

    const isUsed = customers.some((c) => c.kota === val);
    if (isUsed) {
        myAlert(`Gagal menghapus! Kota "${val}" masih digunakan oleh data customer.`);
        return;
    }

    myConfirm(`Apakah Anda yakin ingin menghapus "${val}" dari daftar pilihan?`, () => {
        masterCities = masterCities.filter((c) => c !== val);
        renderDropdowns();
    });
}

// --- LOGIKA RENDER DASHBOARD & TABEL ---

/**
 * Memperbarui seluruh tampilan aplikasi (Dashboard + Tabel).
 */
function renderAll() {
    renderDashboard();
    renderTable(customers);
}

/**
 * Menghitung statistik dan merender kartu dashboard.
 */
function renderDashboard() {
    // Update Total Customer
    const statTotalEl = document.getElementById("statTotal");
    if (statTotalEl) statTotalEl.innerText = customers.length;

    // Inisialisasi object untuk perhitungan (aggregation)
    const cityCount = {};
    const companyCount = {};

    customers.forEach((c) => {
        cityCount[c.kota] = (cityCount[c.kota] || 0) + 1;
        companyCount[c.perusahaan] = (companyCount[c.perusahaan] || 0) + 1;
    });

    // Render Statistik Kota
    const cityContainer = document.getElementById("statCity");
    if (cityContainer) {
        cityContainer.innerHTML = "";
        const sortedCities = Object.entries(cityCount).sort((a, b) => b[1] - a[1]);

        if (sortedCities.length === 0) {
            cityContainer.innerHTML = '<p class="text-slate-500 text-sm italic">Belum ada data...</p>';
        } else {
            sortedCities.forEach(([city, count]) => {
                cityContainer.innerHTML += `
                    <div class="flex justify-between items-center mb-2 border-b border-slate-300 border-dashed pb-1 last:border-0">
                        <span class="text-sm text-slate-700 truncate pr-2">${city}</span>
                        <span class="bg-slate-700 text-white text-xs py-0.5 px-2 rounded-full font-bold">${count}</span>
                    </div>
                `;
            });
        }
    }

    // Render Statistik Perusahaan
    const companyContainer = document.getElementById("statCompany");
    if (companyContainer) {
        companyContainer.innerHTML = "";
        const sortedCompanies = Object.entries(companyCount).sort((a, b) => b[1] - a[1]);

        if (sortedCompanies.length === 0) {
            companyContainer.innerHTML = '<p class="text-slate-500 text-sm italic">Belum ada data...</p>';
        } else {
            sortedCompanies.forEach(([company, count]) => {
                companyContainer.innerHTML += `
                    <div class="flex justify-between items-center mb-2 border-b border-slate-300 border-dashed pb-1 last:border-0">
                        <span class="text-sm text-slate-700 truncate pr-2" title="${company}">${company}</span>
                        <span class="bg-slate-700 text-white text-xs py-0.5 px-2 rounded-full font-bold">${count}</span>
                    </div>
                `;
            });
        }
    }
}

/**
 * Merender baris data customer ke dalam tabel HTML.
 * @param {Array} dataToRender - Data customer yang akan ditampilkan.
 */
function renderTable(dataToRender) {
    const tbody = document.getElementById("tableBody");
    const emptyState = document.getElementById("emptyState");
    if (!tbody || !emptyState) return;

    if (dataToRender.length === 0) {
        tbody.innerHTML = "";
        emptyState.classList.remove("hidden");
    } else {
        emptyState.classList.add("hidden");

        let rowsHTML = "";
        dataToRender.forEach((c, index) => {
            rowsHTML += `
                <tr class="bg-white border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-3 font-medium text-slate-500">${index + 1}</td>
                    <td class="px-6 py-3 font-semibold text-slate-800">${c.nama}</td>
                    <td class="px-6 py-3">${c.perusahaan}</td>
                    <td class="px-6 py-3">${c.kota}</td>
                    <td class="px-6 py-3 text-slate-600">${c.email}</td>
                    <td class="px-6 py-3">${c.hp}</td>
                    <td class="px-6 py-3 truncate max-w-xs" title="${c.alamat}">${c.alamat}</td>
                </tr>
            `;
        });
        tbody.innerHTML = rowsHTML;
    }
}

// --- FITUR PENCARIAN & MODAL ---

/**
 * Fungsi untuk memfilter data berdasarkan input pencarian pengguna.
 */
function handleSearch() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;

    const query = searchInput.value.toLowerCase();
    const filteredData = customers.filter((c) => {
        return (
            (c.nama || "").toLowerCase().includes(query) ||
            (c.perusahaan || "").toLowerCase().includes(query) ||
            (c.kota || "").toLowerCase().includes(query) ||
            (c.email || "").toLowerCase().includes(query) ||
            (c.hp || "").toLowerCase().includes(query) ||
            (c.alamat || "").toLowerCase().includes(query)
        );
    });
    renderTable(filteredData);
}

/**
 * Menampilkan modal form tambah customer.
 */
function openModal() {
    const modal = document.getElementById("customerModal");
    if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        const focusEl = document.getElementById("formNama");
        if (focusEl) focusEl.focus();
    }
}

/**
 * Menutup modal form dan mereset isinya.
 */
function closeModal() {
    const modal = document.getElementById("customerModal");
    if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
        const form = document.getElementById("customerForm");
        if (form) form.reset();
        const alert = document.getElementById("successAlert");
        if (alert) alert.classList.add("hidden");
    }
}

// Variabel untuk menyimpan timer notifikasi sukses
let successAlertTimeout;

/**
 * Mengambil data dari form dan menyimpannya ke array customers.
 * @param {Event} e - Event submit formulir.
 */
function saveCustomer(e) {
    if (e) e.preventDefault();

    // Mengumpulkan data dari elemen input
    const newCustomer = {
        nama: document.getElementById("formNama").value.trim(),
        perusahaan: document.getElementById("formPerusahaan").value,
        kota: document.getElementById("formKota").value,
        email: document.getElementById("formEmail").value.trim(),
        hp: document.getElementById("formHp").value.trim(),
        alamat: document.getElementById("formAlamat").value.trim(),
    };

    // Validasi sederhana (tambahan selain attribute 'required')
    if (!newCustomer.nama || !newCustomer.perusahaan || !newCustomer.kota) {
        myAlert("Mohon lengkapi semua data wajib yang bertanda bintang (*)");
        return;
    }

    // Menambahkan ke array global
    customers.push(newCustomer);

    // Refresh UI
    renderDashboard();
    handleSearch();

    // Reset form untuk input data berikutnya
    const form = document.getElementById("customerForm");
    if (form) form.reset();
    document.getElementById("formNama").focus();

    // Tampilkan notifikasi sukses dalam modal
    const alert = document.getElementById("successAlert");
    if (alert) {
        alert.classList.remove("hidden");
        clearTimeout(successAlertTimeout);
        successAlertTimeout = setTimeout(() => {
            alert.classList.add("hidden");
        }, 3000);
    }
}

// --- FITUR IMPORT & EXPORT ---

/**
 * Mengekspor data customer saat ini ke file .txt dalam format JSON.
 */
function exportTxt() {
    if (customers.length === 0) {
        myAlert("Tidak ada data untuk diekspor!");
        return;
    }

    // Mengonversi data ke string JSON agar struktur tetap terjaga
    const dataStr = JSON.stringify(customers, null, 2);
    const blob = new Blob([dataStr], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Data_Customer_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Mengimpor data dari file .txt hasil ekspor sebelumnya.
 * @param {Event} event - Event change dari input file.
 */
function importTxt(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);

            if (Array.isArray(importedData)) {
                // Validasi struktur data yang diinginkan
                const isValid = importedData.every(
                    (item) => item.nama && item.perusahaan && item.kota
                );

                if (isValid) {
                    // Menggabungkan data lama dengan data baru yang diimpor
                    customers = [...customers, ...importedData];

                    // Perbarui master data dropdown jika ada data baru di item yang diimpor
                    importedData.forEach((c) => {
                        if (!masterCities.includes(c.kota)) masterCities.push(c.kota);
                        if (!masterCompanies.includes(c.perusahaan))
                            masterCompanies.push(c.perusahaan);
                    });

                    renderDropdowns();
                    renderAll();
                    handleSearch();

                    myAlert(`Berhasil mengimpor ${importedData.length} data customer.`);
                } else {
                    myAlert("Gagal mengimpor: Format data dalam file tidak sesuai struktur.");
                }
            } else {
                myAlert("Gagal mengimpor: Format data tidak valid (bukan daftar/array).");
            }
        } catch (error) {
            myAlert("Gagal mengimpor: File harus berisi format data yang valid hasil dari ekspor.");
        }

        // Reset input file agar file yang sama bisa diimpor kembali jika perlu
        event.target.value = "";
    };

    reader.readAsText(file);
}
