// Data kebiasaan (akan diisi dari localStorage jika tersedia)
let habits = [];

// Variabel untuk melacak mode edit
let editMode = false;
let editHabitId = null;

// Fungsi untuk menyimpan data ke localStorage
function saveHabitsToLocalStorage() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

// Fungsi untuk memuat data dari localStorage
function loadHabitsFromLocalStorage() {
    const savedHabits = localStorage.getItem('habits');
    if (savedHabits) {
        habits = JSON.parse(savedHabits);
    } else {
        // Data default jika tidak ada data tersimpan
        habits = [
            {
                id: 1,
                name: "Membaca Buku",
                category: "pendidikan",
                streak: 7,
                progress: 70,
                goal: 30
            },
            {
                id: 2,
                name: "Olahraga",
                category: "kesehatan",
                streak: 3,
                progress: 40,
                goal: 30
            }
        ];
        // Simpan data default ke localStorage
        saveHabitsToLocalStorage();
    }
}

// Fungsi efek typewriter
function typeWriter(element, text, speed = 100, delay = 0) {
    return new Promise(resolve => {
        let i = 0;
        setTimeout(() => {
            const interval = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(interval);
                    resolve();
                }
            }, speed);
        }, delay);
    });
}

// Fungsi untuk menginisialisasi animasi typewriter
async function initTypewriter() {
    // Tidak perlu animasi typewriter karena elemen tidak ada di HTML
    // Fungsi ini dipertahankan untuk kompatibilitas
    console.log("Typewriter initialized");
}

// Toggle mode gelap/terang
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const moonIcon = document.querySelector('.fa-moon');
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        moonIcon.classList.toggle('active');
        
        // Simpan preferensi tema ke localStorage
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
    });
    
    // Periksa preferensi tema yang tersimpan
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
        const isDarkMode = savedDarkMode === 'true';
        document.body.classList.toggle('dark-mode', isDarkMode);
        moonIcon.classList.toggle('active', isDarkMode);
    }
}

// Fungsi untuk menampilkan modal
function initModal() {
    const modal = document.getElementById('habit-modal');
    const addButton = document.getElementById('add-habit');
    const closeButton = document.querySelector('.close');
    
    addButton.addEventListener('click', () => {
        // Reset mode edit saat menambah kebiasaan baru
        editMode = false;
        editHabitId = null;
        
        // Reset form
        document.getElementById('habit-form').reset();
        
        // Ubah judul modal
        document.querySelector('.modal-content h2').textContent = 'Tambah Kebiasaan Baru';
        document.querySelector('.btn-submit').textContent = 'Simpan';
        
        modal.style.display = 'flex';
    });
    
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Fungsi untuk menangani form tambah/edit kebiasaan
function initHabitForm() {
    const form = document.getElementById('habit-form');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('habit-name');
        const categoryInput = document.getElementById('habit-category');
        const goalInput = document.getElementById('habit-goal');
        
        if (editMode && editHabitId !== null) {
            // Mode edit - update kebiasaan yang ada
            const habitIndex = habits.findIndex(h => h.id === editHabitId);
            if (habitIndex !== -1) {
                habits[habitIndex].name = nameInput.value;
                habits[habitIndex].category = categoryInput.value;
                habits[habitIndex].goal = parseInt(goalInput.value);
                // Hitung ulang progress berdasarkan goal baru
                habits[habitIndex].progress = Math.min(Math.round((habits[habitIndex].streak / habits[habitIndex].goal) * 100), 100);
            }
            
            // Reset mode edit
            editMode = false;
            editHabitId = null;
        } else {
            // Mode tambah - buat kebiasaan baru
            const newHabit = {
                id: Date.now(),
                name: nameInput.value,
                category: categoryInput.value,
                streak: 0,
                progress: 0,
                goal: parseInt(goalInput.value)
            };
            
            habits.push(newHabit);
        }
        
        // Simpan perubahan ke localStorage
        saveHabitsToLocalStorage();
        
        renderHabits();
        
        // Reset form dan tutup modal
        form.reset();
        document.getElementById('habit-modal').style.display = 'none';
    });
}

// Fungsi untuk memperbarui statistik
function updateStatistics() {
    // Total kebiasaan
    document.getElementById('total-habits').textContent = habits.length;
    
    // Total streak
    const totalStreaks = habits.reduce((sum, habit) => sum + habit.streak, 0);
    document.getElementById('total-streaks').textContent = totalStreaks;
    
    // Kebiasaan terbaik (dengan streak tertinggi)
    if (habits.length > 0) {
        const bestHabit = habits.reduce((best, habit) => 
            habit.streak > best.streak ? habit : best, habits[0]);
        document.getElementById('best-habit').textContent = bestHabit.name;
    } else {
        document.getElementById('best-habit').textContent = '-';
    }
    
    // Rata-rata progress
    if (habits.length > 0) {
        const avgProgress = habits.reduce((sum, habit) => sum + habit.progress, 0) / habits.length;
        document.getElementById('avg-progress').textContent = Math.round(avgProgress) + '%';
    } else {
        document.getElementById('avg-progress').textContent = '0%';
    }
}

// Fungsi untuk menambahkan event listeners ke tombol-tombol kebiasaan
function addHabitButtonListeners() {
    // Tombol check
    document.querySelectorAll('.btn-check').forEach(button => {
        button.addEventListener('click', (e) => {
            const habitCard = e.target.closest('.habit-card');
            const habitId = parseInt(habitCard.dataset.id);
            const habit = habits.find(h => h.id === habitId);
            
            if (habit) {
                const oldProgress = habit.progress;
                habit.streak += 1;
                habit.progress = Math.min(Math.round((habit.streak / habit.goal) * 100), 100);
                
                // Cek apakah mencapai target atau milestone
                if (habit.progress === 100 && oldProgress < 100) {
                    // Jalankan animasi konfetti untuk merayakan pencapaian target
                    celebrateAchievement();
                } else if (habit.progress % 25 === 0 && habit.progress > oldProgress) {
                    // Jalankan konfetti kecil untuk milestone (25%, 50%, 75%)
                    celebrateMilestone();
                }
                
                // Simpan perubahan ke localStorage
                saveHabitsToLocalStorage();
                
                renderHabits();
            }
        });
    });
    
    // Tombol edit
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', (e) => {
            const habitCard = e.target.closest('.habit-card');
            const habitId = parseInt(habitCard.dataset.id);
            const habit = habits.find(h => h.id === habitId);
            
            if (habit) {
                // Set mode edit
                editMode = true;
                editHabitId = habit.id;
                
                // Isi form dengan data kebiasaan yang akan diedit
                document.getElementById('habit-name').value = habit.name;
                document.getElementById('habit-goal').value = habit.goal;
                
                // Ubah judul modal dan teks tombol
                document.querySelector('.modal-content h2').textContent = 'Edit Kebiasaan';
                document.querySelector('.btn-submit').textContent = 'Perbarui';
                
                // Tampilkan modal
                document.getElementById('habit-modal').style.display = 'flex';
            }
        });
    });
    
    // Tombol delete
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', (e) => {
            const habitCard = e.target.closest('.habit-card');
            const habitId = parseInt(habitCard.dataset.id);
            
            habits = habits.filter(h => h.id !== habitId);
            
            // Simpan perubahan ke localStorage
            saveHabitsToLocalStorage();
            
            renderHabits();
        });
    });
}

// Fungsi untuk render kebiasaan
function renderHabits() {
    const habitsContainer = document.querySelector('.habits-container');
    habitsContainer.innerHTML = '';
    
    habits.forEach(habit => {
        const habitCard = document.createElement('div');
        habitCard.className = 'habit-card';
        habitCard.dataset.id = habit.id;
        habitCard.dataset.category = habit.category || 'lainnya';
        
        const categoryIcon = getCategoryIcon(habit.category);
        
        habitCard.innerHTML = `
            <div class="habit-header">
                <div class="habit-title">
                    <span class="category-icon">${categoryIcon}</span>
                    <h3>${habit.name}</h3>
                </div>
                <span class="streak"><i class="fas fa-fire"></i> ${habit.streak} hari</span>
            </div>
            <div class="habit-progress">
                <div class="progress-bar">
                    <div class="progress" style="width: ${habit.progress}%"></div>
                </div>
                <span>${habit.progress}%</span>
            </div>
            <div class="habit-actions">
                <button class="btn-check"><i class="fas fa-check"></i></button>
                <button class="btn-edit"><i class="fas fa-edit"></i></button>
                <button class="btn-delete"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        habitsContainer.appendChild(habitCard);
    });
    
    // Tambahkan event listeners untuk tombol-tombol
    addHabitButtonListeners();
    
    // Update statistik setiap kali kebiasaan dirender
    updateStatistics();
}

// Fungsi untuk merayakan pencapaian target dengan konfetti besar
function celebrateAchievement() {
    confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#5c7cfa', '#51cf66', '#fcc419', '#ff6b6b']
    });
    
    // Tampilkan pesan selamat
    showToast('🎉 Selamat! Anda telah mencapai target kebiasaan!');
}

// Fungsi untuk merayakan milestone dengan konfetti kecil
function celebrateMilestone() {
    confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#5c7cfa', '#51cf66']
    });
    
    // Tampilkan pesan milestone
    showToast('🔥 Bagus! Anda mencapai milestone baru!');
}

// Fungsi untuk menampilkan toast notification
function showToast(message) {
    // Buat elemen toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    // Tambahkan ke body
    document.body.appendChild(toast);
    
    // Tampilkan dengan animasi
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Hilangkan setelah 3 detik
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Fungsi untuk mendapatkan ikon berdasarkan kategori
function getCategoryIcon(category) {
    switch(category) {
        case 'kesehatan':
            return '<i class="fas fa-heartbeat"></i>';
        case 'produktivitas':
            return '<i class="fas fa-tasks"></i>';
        case 'pendidikan':
            return '<i class="fas fa-book"></i>';
        case 'keuangan':
            return '<i class="fas fa-coins"></i>';
        default:
            return '<i class="fas fa-star"></i>';
    }
}
// Fungsi untuk mengekspor data kebiasaan
function exportHabitsData() {
    // Buat objek data untuk diekspor
    const exportData = {
        habits: habits,
        exportDate: new Date().toISOString()
    };
    
    // Konversi ke string JSON
    const jsonData = JSON.stringify(exportData, null, 2);
    
    // Buat blob dan link untuk download
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Buat elemen link untuk download
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-data-${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('✅ Data berhasil diekspor!');
    }, 100);
}

// Fungsi untuk mengimpor data kebiasaan
function importHabitsData() {
    // Buat elemen input file tersembunyi
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                
                // Validasi data yang diimpor
                if (Array.isArray(importedData.habits)) {
                    // Terapkan data yang diimpor
                    habits = importedData.habits;
                    
                    // Simpan ke localStorage
                    saveHabitsToLocalStorage();
                    
                    // Render ulang kebiasaan
                    renderHabits();
                    
                    showToast('✅ Data berhasil diimpor!');
                } else {
                    showToast('❌ Format file tidak valid!');
                }
            } catch (error) {
                console.error('Error importing data:', error);
                showToast('❌ Gagal mengimpor data!');
            }
        };
        
        reader.readAsText(file);
    });
    
    // Trigger dialog pemilihan file
    input.click();
}

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    // Muat data dari localStorage
    loadHabitsFromLocalStorage();
    
    initThemeToggle();
    initTypewriter();
    initModal();
    initHabitForm();
    renderHabits();
    
    // Tambahkan event listener untuk tombol ekspor dan impor
    document.getElementById('export-data').addEventListener('click', exportHabitsData);
    document.getElementById('import-data').addEventListener('click', importHabitsData);
});