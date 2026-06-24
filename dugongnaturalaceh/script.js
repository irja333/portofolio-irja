// --- Tailwind Configuration ---
tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                'deep-sea': 'var(--deep-sea)',
                'dark-cyan': 'var(--dark-cyan)',
                'mid-cyan': 'var(--mid-cyan)',
                'neon-cyan': 'var(--neon-cyan)',
                'neon-green': 'var(--neon-green)',
                'text-muted': 'var(--text-muted)',
                'footer-bg': 'var(--footer-bg)'
            },
            textColor: {
                'white': 'var(--text-white)',
                'gray-200': 'var(--text-gray-200)',
                'gray-300': 'var(--text-gray-300)',
                'gray-400': 'var(--text-gray-400)',
                'gray-500': 'var(--text-gray-500)',
            },
            boxShadow: {
                'neon': '0 0 15px rgba(0, 240, 255, 0.3)',
                'neon-strong': '0 0 25px rgba(0, 240, 255, 0.5)',
            }
        }
    }
};


// --- Navigation Scroll Effect (Dark Theme) ---
const navbar = document.getElementById('navbar');
let lastKnownScrollPosition = 0;
let ticking = false;

function updateNavbarState() {
    if (lastKnownScrollPosition > 20) {
        navbar.firstElementChild.classList.remove('bg-opacity-40');
        navbar.firstElementChild.classList.add('bg-opacity-90', 'border-neon-cyan/40');
    } else {
        navbar.firstElementChild.classList.add('bg-opacity-40');
        navbar.firstElementChild.classList.remove('bg-opacity-90', 'border-neon-cyan/40');
    }
}

window.addEventListener('scroll', () => {
    lastKnownScrollPosition = window.scrollY;

    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateNavbarState();
            ticking = false;
        });
        ticking = true;
    }
});

// Trigger initial check
updateNavbarState();

// --- Mobile Menu Toggle ---
const btn = document.getElementById('mobile-menu-btn');
const menu = document.getElementById('mobile-menu');

btn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
});

const mobileLinks = menu.querySelectorAll('a');
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        menu.classList.add('hidden');
    });
});

// --- Kamera & GPS Verification Logic ---
const btnOpenCamera = document.getElementById('btn-open-camera');
const btnCloseCamera = document.getElementById('btn-close-camera');
const cameraModal = document.getElementById('camera-modal');
const cameraVideo = document.getElementById('camera-video');
const btnCapture = document.getElementById('btn-capture');
const btnSwitchCamera = document.getElementById('btn-switch-camera');
const btnRetryGps = document.getElementById('btn-retry-gps');

const photoSelectorContainer = document.getElementById('photo-selector-container');
const photoPreviewContainer = document.getElementById('photo-preview-container');
const capturedPhotoPreview = document.getElementById('captured-photo-preview');
const photoDataInput = document.getElementById('photo-data-input');

const btnRetakePhoto = document.getElementById('btn-retake-photo');
const btnDeletePhoto = document.getElementById('btn-delete-photo');

const infoLat = document.getElementById('info-lat');
const infoLon = document.getElementById('info-lon');
const infoDate = document.getElementById('info-date');
const infoAccuracy = document.getElementById('info-accuracy');

let cameraStream = null;
let currentFacingMode = 'environment'; // Default to back camera
let userLocation = null;
let hudClockInterval = null;

function fetchGPSLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation tidak didukung oleh browser"));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date(position.timestamp)
                };
                resolve(userLocation);
            },
            (error) => {
                reject(error);
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
    });
}

function startHUDClock() {
    if (hudClockInterval) clearInterval(hudClockInterval);
    const clockEl = document.getElementById('hud-clock');
    const formatTime = (d) => {
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    clockEl.textContent = formatTime(new Date());
    hudClockInterval = setInterval(() => {
        clockEl.textContent = formatTime(new Date());
    }, 1000);
}

function updateHUDGPS() {
    const badge = document.getElementById('hud-gps-badge');
    const text = document.getElementById('hud-gps-text');
    badge.className = "px-2.5 py-1 rounded-full bg-red-955/70 border border-red-500/30 text-[10px] font-mono text-red-400 flex items-center gap-1.5 backdrop-blur-sm";
    text.textContent = "GPS: MENCARI LOKASI...";

    fetchGPSLocation()
        .then(loc => {
            badge.className = "px-2.5 py-1 rounded-full bg-emerald-955/70 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 backdrop-blur-sm";
            text.textContent = `GPS: ${loc.lat.toFixed(5)}, ${loc.lon.toFixed(5)} (±${Math.round(loc.accuracy)}m)`;
        })
        .catch(err => {
            console.warn("Gagal mendeteksi lokasi:", err);
            badge.className = "px-2.5 py-1 rounded-full bg-red-955/70 border border-red-500/30 text-[10px] font-mono text-red-400 flex items-center gap-1.5 backdrop-blur-sm";
            text.textContent = "GPS: TIDAK AKTIF / BLOCKED";
        });
}

async function startCamera() {
    const loading = document.getElementById('camera-loading');
    loading.classList.remove('hidden');

    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn("Devices media API not supported");
        alert("Browser Anda atau koneksi lokal (non-HTTPS) tidak mendukung pengambilan foto kamera langsung. Pastikan Anda menggunakan HTTPS.");
        closeCameraModal();
        return;
    }

    try {
        // Setup listener first to prevent race condition
        cameraVideo.onloadedmetadata = () => {
            loading.classList.add('hidden');
        };

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: currentFacingMode
            },
            audio: false
        });
        cameraVideo.srcObject = cameraStream;
        
        // Explicitly play video stream (essential for mobile iOS Safari & some Chrome versions)
        await cameraVideo.play();
        loading.classList.add('hidden'); // Fail-safe: hide immediately once play starts

        // Detect actual facing mode from stream settings (handling browser fallbacks on laptops)
        let actualFacingMode = currentFacingMode;
        const videoTracks = cameraStream.getVideoTracks();
        if (videoTracks.length > 0) {
            const settings = videoTracks[0].getSettings();
            if (settings.facingMode) {
                actualFacingMode = settings.facingMode;
            }
        }

        if (actualFacingMode === 'user') {
            cameraVideo.style.transform = 'scaleX(-1)';
        } else {
            cameraVideo.style.transform = 'none';
        }

        startHUDClock();
        updateHUDGPS();
    } catch (err) {
        console.error("Camera error:", err);
        alert("Gagal mengakses kamera. Pastikan izin kamera telah diberikan di browser Anda.");
        closeCameraModal();
    }
}

function openCameraModal() {
    cameraModal.classList.remove('hidden');
    cameraModal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    currentFacingMode = 'environment';
    startCamera();
}

function closeCameraModal() {
    cameraModal.classList.add('hidden');
    cameraModal.classList.remove('flex');
    document.body.style.overflow = '';
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    cameraVideo.srcObject = null; // Properly release camera/video stream resources
    if (hudClockInterval) {
        clearInterval(hudClockInterval);
        hudClockInterval = null;
    }
}

async function handleCapture() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const w = cameraVideo.videoWidth || 640;
    const h = cameraVideo.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;

    // Detect actual facing mode from stream settings
    let actualFacing = currentFacingMode;
    if (cameraStream) {
        const videoTracks = cameraStream.getVideoTracks();
        if (videoTracks.length > 0) {
            const settings = videoTracks[0].getSettings();
            if (settings.facingMode) {
                actualFacing = settings.facingMode;
            }
        }
    }

    ctx.save();
    if (actualFacing === 'user') {
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
    }
    ctx.drawImage(cameraVideo, 0, 0, w, h);
    ctx.restore();

    const rawData = canvas.toDataURL('image/jpeg', 0.9);
    closeCameraModal();

    // Generate watermark
    const lat = userLocation ? userLocation.lat : null;
    const lon = userLocation ? userLocation.lon : null;
    const accuracy = userLocation ? userLocation.accuracy : 0;
    const timestamp = userLocation ? userLocation.timestamp : new Date();

    const watermarkedData = await watermarkImage(rawData, lat, lon, accuracy, timestamp);
    saveAndShowPhoto(watermarkedData, lat, lon, accuracy, timestamp);
}

function watermarkImage(imageSource, lat, lon, accuracy, timestamp, isUploaded = false) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);

            const w = canvas.width;
            const h = canvas.height;

            const barHeight = Math.max(60, Math.round(h * 0.12));
            const paddingX = Math.round(w * 0.03);
            const fontSizeMain = Math.max(12, Math.round(barHeight * 0.22));
            const fontSizeSub = Math.max(10, Math.round(barHeight * 0.16));

            ctx.textBaseline = 'middle';

            // Formatting
            const pad = (n) => String(n).padStart(2, '0');
            const formattedDate = `${timestamp.getFullYear()}-${pad(timestamp.getMonth() + 1)}-${pad(timestamp.getDate())} ${pad(timestamp.getHours())}:${pad(timestamp.getMinutes())}:${pad(timestamp.getSeconds())} WIB`;

            const titleText = isUploaded 
                ? '📷 DUGONG ACEH CONSERVATION - FILE UPLOAD' 
                : '📷 DUGONG ACEH CONSERVATION - VERIFIED';
            const gpsText = lat !== null
                ? `LAT: ${lat.toFixed(6)} | LON: ${lon.toFixed(6)} (Akurasi: ±${Math.round(accuracy)}m)`
                : 'LOKASI GPS: TIDAK TERSEDIA (TIDAK TERVERIFIKASI)';
            const dateLabel = isUploaded ? 'WAKTU UNGGAH' : 'WAKTU PENGAMBILAN';
            const dateText = formattedDate;

            // Check if texts would overlap
            ctx.font = `bold ${fontSizeMain}px sans-serif`;
            const titleWidth = ctx.measureText(titleText).width;
            const dateLabelWidth = ctx.measureText(dateLabel).width;

            ctx.font = `${fontSizeSub}px monospace`;
            const gpsWidth = ctx.measureText(`📍 ${gpsText}`).width;
            const dateTextWidth = ctx.measureText(dateText).width;

            const availableWidth = w - paddingX * 2 - 20; // 20px buffer gap
            const needsStackedLayout = (titleWidth + dateLabelWidth > availableWidth) || (gpsWidth + dateTextWidth > availableWidth) || (w < 700);

            if (needsStackedLayout) {
                const stackedBarHeight = Math.max(85, Math.round(h * 0.16));
                ctx.fillStyle = 'rgba(2, 13, 20, 0.85)';
                ctx.fillRect(0, h - stackedBarHeight, w, stackedBarHeight);

                ctx.strokeStyle = '#00f0ff';
                ctx.lineWidth = Math.max(2, Math.round(h * 0.003));
                ctx.beginPath();
                ctx.moveTo(0, h - stackedBarHeight);
                ctx.lineTo(w, h - stackedBarHeight);
                ctx.stroke();

                const lineSpacing = stackedBarHeight / 4;

                // Left align for all stacked items
                ctx.textAlign = 'left';

                // Line 1: Title (Cyan)
                ctx.fillStyle = '#00f0ff';
                ctx.font = `bold ${fontSizeMain}px sans-serif`;
                ctx.fillText(titleText, paddingX, h - stackedBarHeight + lineSpacing * 1);

                // Line 2: GPS coordinates (White)
                ctx.fillStyle = '#ffffff';
                ctx.font = `${fontSizeSub}px monospace`;
                ctx.fillText(`📍 ${gpsText}`, paddingX, h - stackedBarHeight + lineSpacing * 2);

                // Line 3: Timestamp (Green label, white value)
                ctx.fillStyle = '#00ff9d';
                ctx.font = `bold ${fontSizeSub}px sans-serif`;
                const dateLabelText = isUploaded ? '📅 WAKTU UNGGAH: ' : '📅 WAKTU PENGAMBILAN: ';
                ctx.fillText(dateLabelText, paddingX, h - stackedBarHeight + lineSpacing * 3);

                const dateLabelTextWidth = ctx.measureText(dateLabelText).width;
                ctx.fillStyle = '#ffffff';
                ctx.font = `${fontSizeSub}px monospace`;
                ctx.fillText(dateText, paddingX + dateLabelTextWidth, h - stackedBarHeight + lineSpacing * 3);

                // Draw status indicator bar on the side
                ctx.fillStyle = lat !== null ? '#00ff9d' : '#ef4444';
                ctx.fillRect(w - 5, h - stackedBarHeight, 5, stackedBarHeight);
            } else {
                ctx.fillStyle = 'rgba(2, 13, 20, 0.85)';
                ctx.fillRect(0, h - barHeight, w, barHeight);

                ctx.strokeStyle = '#00f0ff';
                ctx.lineWidth = Math.max(2, Math.round(h * 0.003));
                ctx.beginPath();
                ctx.moveTo(0, h - barHeight);
                ctx.lineTo(w, h - barHeight);
                ctx.stroke();

                // Left: Title & coordinates
                ctx.textAlign = 'left';
                ctx.fillStyle = '#00f0ff';
                ctx.font = `bold ${fontSizeMain}px sans-serif`;
                ctx.fillText(titleText, paddingX, h - barHeight + barHeight * 0.3);

                ctx.fillStyle = '#ffffff';
                ctx.font = `${fontSizeSub}px monospace`;
                ctx.fillText(`📍 ${gpsText}`, paddingX, h - barHeight + barHeight * 0.7);

                // Right: Date
                ctx.textAlign = 'right';
                ctx.fillStyle = '#00ff9d';
                ctx.font = `bold ${fontSizeMain}px sans-serif`;
                ctx.fillText(dateLabel, w - paddingX, h - barHeight + barHeight * 0.3);

                ctx.fillStyle = '#ffffff';
                ctx.font = `${fontSizeSub}px monospace`;
                ctx.fillText(dateText, w - paddingX, h - barHeight + barHeight * 0.7);

                // Draw status indicator bar on the side
                ctx.fillStyle = lat !== null ? '#00ff9d' : '#ef4444';
                ctx.fillRect(w - 5, h - barHeight, 5, barHeight);
            }

            resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = imageSource;
    });
}

function saveAndShowPhoto(dataUrl, lat, lon, accuracy, timestamp) {
    photoDataInput.value = dataUrl;
    capturedPhotoPreview.src = dataUrl;

    const pad = (n) => String(n).padStart(2, '0');
    infoLat.textContent = lat !== null ? lat.toFixed(6) : 'Tidak ada';
    infoLon.textContent = lon !== null ? lon.toFixed(6) : 'Tidak ada';
    infoDate.textContent = `${timestamp.getFullYear()}-${pad(timestamp.getMonth() + 1)}-${pad(timestamp.getDate())} ${pad(timestamp.getHours())}:${pad(timestamp.getMinutes())}:${pad(timestamp.getSeconds())}`;
    infoAccuracy.textContent = lat !== null ? `±${Math.round(accuracy)}m` : 'N/A';

    const latLink = document.getElementById('info-lat-link');
    const lonLink = document.getElementById('info-lon-link');
    if (latLink && lonLink) {
        if (lat !== null && lon !== null) {
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
            latLink.href = mapsUrl;
            lonLink.href = mapsUrl;
            latLink.className = 'text-neon-cyan hover:underline cursor-pointer';
            lonLink.className = 'text-neon-cyan hover:underline cursor-pointer';
        } else {
            latLink.removeAttribute('href');
            lonLink.removeAttribute('href');
            latLink.className = 'cursor-default';
            lonLink.className = 'cursor-default';
        }
    }

    const mapsBtn = document.getElementById('btn-google-maps');
    if (mapsBtn) {
        if (lat !== null && lon !== null) {
            mapsBtn.href = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
            mapsBtn.classList.remove('hidden');
        } else {
            mapsBtn.classList.add('hidden');
        }
    }

    photoSelectorContainer.classList.add('hidden');
    photoPreviewContainer.classList.remove('hidden');
}

function resetPhotoContainer() {
    photoDataInput.value = '';
    capturedPhotoPreview.src = '';

    infoLat.textContent = '-';
    infoLon.textContent = '-';
    infoDate.textContent = '-';
    infoAccuracy.textContent = '-';

    const latLink = document.getElementById('info-lat-link');
    const lonLink = document.getElementById('info-lon-link');
    if (latLink && lonLink) {
        latLink.removeAttribute('href');
        lonLink.removeAttribute('href');
        latLink.className = 'cursor-default';
        lonLink.className = 'cursor-default';
    }

    const mapsBtn = document.getElementById('btn-google-maps');
    if (mapsBtn) mapsBtn.className = 'hidden';

    photoPreviewContainer.classList.add('hidden');
    photoSelectorContainer.classList.remove('hidden');
    userLocation = null;
}

// --- Event Listeners ---
btnOpenCamera.addEventListener('click', openCameraModal);
btnCloseCamera.addEventListener('click', closeCameraModal);
btnCapture.addEventListener('click', handleCapture);
btnDeletePhoto.addEventListener('click', resetPhotoContainer);
btnRetakePhoto.addEventListener('click', () => {
    resetPhotoContainer();
    openCameraModal();
});
btnSwitchCamera.addEventListener('click', () => {
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    startCamera();
});
btnRetryGps.addEventListener('click', () => {
    updateHUDGPS();
});





// --- Instagram Native Embed Logic ---
const DEFAULT_POSTS = [
    'https://www.instagram.com/p/DZFp4eKEyMG/?img_index=1',
    'https://www.instagram.com/p/DZEKg37E-B_/?img_index=1',
    'http://instagram.com/p/DVITzTMkRWM/?img_index=1'
];

function getShortcode(url) {
    if (!url) return '';
    const match = url.match(/\/p\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : '';
}

function loadInstagramFrames() {
    const sc1 = getShortcode(DEFAULT_POSTS[0]);
    const sc2 = getShortcode(DEFAULT_POSTS[1]);
    const sc3 = getShortcode(DEFAULT_POSTS[2]);

    const igFrame1 = document.getElementById('ig-frame-1');
    const igFrame2 = document.getElementById('ig-frame-2');
    const igFrame3 = document.getElementById('ig-frame-3');

    if (igFrame1) igFrame1.src = sc1 ? `https://www.instagram.com/p/${sc1}/embed` : '';
    if (igFrame2) igFrame2.src = sc2 ? `https://www.instagram.com/p/${sc2}/embed` : '';
    if (igFrame3) igFrame3.src = sc3 ? `https://www.instagram.com/p/${sc3}/embed` : '';
}

// Initialize Instagram Frames
loadInstagramFrames();

// --- Konfigurasi Google Apps Script (Ubah dengan URL Web App Anda) ---
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzveenZ_lzrl9_dpjRVO7A6Wv_ZDN7n4LCUJuSW6XmXCK-WByX_36HrzDs8h2G28lIw4Q/exec';

// --- Simple Form Handler (With Verification validation & Google Apps Script Integration) ---
const reportForm = document.getElementById('reportForm');
reportForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate that image has been captured/uploaded
    const photoData = photoDataInput.value;
    if (!photoData) {
        alert("Harap ambil foto bukti penampakan menggunakan kamera terlebih dahulu!");
        return;
    }

    const btn = reportForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    // Neon loading styling
    btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin mr-2"></i> Mengirim Laporan...';
    btn.disabled = true;

    const formData = new FormData(reportForm);

    // Prepare payload data for Google Apps Script
    const payload = {
        nama: formData.get('Nama Pelapor'),
        whatsapp: formData.get('Nomor WhatsApp'),
        kondisi: formData.get('Kondisi Dugong'),
        catatan: formData.get('Catatan Tambahan'),
        latitude: infoLat.textContent,
        longitude: infoLon.textContent,
        waktu: infoDate.textContent,
        akurasi: infoAccuracy.textContent,
        maps_url: (infoLat.textContent !== '-' && infoLon.textContent !== '-')
            ? `https://www.google.com/maps/search/?api=1&query=${infoLat.textContent},${infoLon.textContent}`
            : '',
        photo_base64: photoData
    };

    // If APPS_SCRIPT_URL is not set, run in simulation mode (useful for local preview)
    if (APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
        console.warn("Google Apps Script URL belum dikonfigurasi. Menjalankan mode simulasi.");

        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-check mr-2"></i> Laporan Terkirim (Simulasi)!';
            btn.classList.replace('bg-neon-cyan', 'bg-neon-green');
            btn.classList.replace('text-deep-sea', 'text-deep-sea');
            btn.classList.replace('hover:bg-white', 'hover:bg-neon-green');
            btn.classList.replace('shadow-neon', 'shadow-[0_0_15px_rgba(0,255,157,0.5)]');

            alert("Simulasi sukses! Untuk mengirim email asli, silakan buat Google Apps Script Web App dan pasang URL-nya pada variabel APPS_SCRIPT_URL di dalam kode HTML.");

            setTimeout(() => {
                reportForm.reset();
                resetPhotoContainer();
                btn.innerHTML = originalText;
                btn.classList.replace('bg-neon-green', 'bg-neon-cyan');
                btn.classList.replace('hover:bg-neon-green', 'hover:bg-white');
                btn.classList.replace('shadow-[0_0_15px_rgba(0,255,157,0.5)]', 'shadow-neon');
            }, 3000);
        }, 1500);
        return;
    }

    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8' // Send as text/plain to bypass CORS preflight
        },
        body: JSON.stringify(payload),
        redirect: 'follow'
    })
        .then(response => response.json())
        .then(data => {
            btn.disabled = false;
            if (data.success || data.status === 'success') {
                // Neon success styling
                btn.innerHTML = '<i class="fa-solid fa-check mr-2"></i> Laporan Terkirim!';
                btn.classList.replace('bg-neon-cyan', 'bg-neon-green');
                btn.classList.replace('text-deep-sea', 'text-deep-sea');
                btn.classList.replace('hover:bg-white', 'hover:bg-neon-green');
                btn.classList.replace('shadow-neon', 'shadow-[0_0_15px_rgba(0,255,157,0.5)]');

                setTimeout(() => {
                    reportForm.reset();
                    resetPhotoContainer();
                    btn.innerHTML = originalText;
                    btn.classList.replace('bg-neon-green', 'bg-neon-cyan');
                    btn.classList.replace('hover:bg-neon-green', 'hover:bg-white');
                    btn.classList.replace('shadow-[0_0_15px_rgba(0,255,157,0.5)]', 'shadow-neon');
                }, 3000);
            } else {
                throw new Error(data.message || "Gagal mengirim laporan");
            }
        })
        .catch(error => {
            console.error("Gagal mengirim laporan:", error);
            btn.disabled = false;
            // Fallback simulation
            btn.innerHTML = '<i class="fa-solid fa-check mr-2"></i> Laporan Terkirim (Simulasi)!';
            btn.classList.replace('bg-neon-cyan', 'bg-neon-green');
            btn.classList.replace('text-deep-sea', 'text-deep-sea');
            btn.classList.replace('hover:bg-white', 'hover:bg-neon-green');
            btn.classList.replace('shadow-neon', 'shadow-[0_0_15px_rgba(0,255,157,0.5)]');

            alert("Gagal terhubung ke Google Apps Script: " + error.message + "\n\nMenampilkan hasil simulasi lokal.");

            setTimeout(() => {
                reportForm.reset();
                resetPhotoContainer();
                btn.innerHTML = originalText;
                btn.classList.replace('bg-neon-green', 'bg-neon-cyan');
                btn.classList.replace('hover:bg-neon-green', 'hover:bg-white');
                btn.classList.replace('shadow-[0_0_15px_rgba(0,255,157,0.5)]', 'shadow-neon');
            }, 3000);
        });
});

// Handle ESC key to close modals
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (typeof closeCameraModal === 'function') {
            closeCameraModal();
        }
    }
});

// --- Theme Toggle Logic (Light / Dark Mode) ---
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeToggleIcon = document.getElementById('theme-toggle-icon');
const themeToggleBtnMobile = document.getElementById('theme-toggle-btn-mobile');
const themeToggleIconMobile = document.getElementById('theme-toggle-icon-mobile');

// Check localStorage for saved theme preference
const savedTheme = localStorage.getItem('theme-mode');

if (savedTheme === 'light') {
    enableLightMode();
} else {
    enableDarkMode();
}

function enableLightMode() {
    document.body.classList.add('light-mode');
    localStorage.setItem('theme-mode', 'light');
    if (themeToggleIcon) {
        themeToggleIcon.classList.replace('fa-sun', 'fa-moon');
    }
    if (themeToggleIconMobile) {
        themeToggleIconMobile.classList.replace('fa-sun', 'fa-moon');
    }
}

function enableDarkMode() {
    document.body.classList.remove('light-mode');
    localStorage.setItem('theme-mode', 'dark');
    if (themeToggleIcon) {
        themeToggleIcon.classList.replace('fa-moon', 'fa-sun');
    }
    if (themeToggleIconMobile) {
        themeToggleIconMobile.classList.replace('fa-moon', 'fa-sun');
    }
}

function toggleTheme() {
    if (document.body.classList.contains('light-mode')) {
        enableDarkMode();
    } else {
        enableLightMode();
    }
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
}
if (themeToggleBtnMobile) {
    themeToggleBtnMobile.addEventListener('click', toggleTheme);
}




