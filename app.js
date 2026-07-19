// =============================================================================
// SEED DATA & CONSTANTS
// =============================================================================

const INITIAL_POSTS = [
    {
        id: "post-1",
        title: "Secangkir Kopi dan Memori yang Tertinggal",
        category: "Cerita",
        tags: ["CatatanHarian", "Melangkah", "Memori", "Cerita"],
        date: "2026-07-18",
        cover: "assets/workspace.png",
        content: `Sore itu langit Jakarta tampak muram, sama seperti secangkir kopi hitam tanpa gula yang mendingin di hadapanku. Aku selalu menyukai kopi pahit, karena ia jujur—tidak berpura-pura manis seperti janji-janji yang akhirnya menguap bersama dinginnya malam.

Hari ini tepat satu tahun sejak keputusan besar itu diambil. Berjalan sendiri ternyata tidak seburuk yang kubayangkan pada mulanya. Meski terkadang di sela-sela riuhnya jalanan Sudirman, ada suara sunyi yang berbisik memanggil masa lalu. Namun, seperti yang tertulis di lembar catatan harianku, melangkah adalah satu-satunya pilihan. Luka ini mungkin masih ada, tapi ia tidak lagi berdarah. Ia telah berubah menjadi cerita.`
    },
    {
        id: "post-2",
        title: "Luka Yang di Tuliskan",
        category: "Puisi",
        tags: ["Puisi", "Sastra", "Rasa", "Luka"],
        date: "2026-07-16",
        cover: "assets/labuan_bajo.png",
        content: `Di atas kertas putih yang bisu
Kutitipkan perih yang tak sempat mengaduh
Bait-bait ini adalah sunyi yang bernyanyi
Tentang kisah yang layu sebelum mekar berseri.

Jangan tanya mengapa penaku menari
Membelah sunyi di keheningan sepi
Sebab luka yang dituliskan
Adalah satu-satunya cara berdamai dengan kenyataan.

Ia tidak hilang, hanya mengering
Menjadi jejak abadi yang tak lagi perih.`
    },
    {
        id: "post-3",
        title: "Seni Melepaskan Ekspektasi",
        category: "Renungan",
        tags: ["Renungan", "Berdamai", "DiriSendiri", "Ekspektasi"],
        date: "2026-07-15",
        cover: "assets/workspace.png",
        content: `Kekecewaan seringkali lahir bukan dari perbuatan orang lain, melainkan dari tinggi dan kokohnya tembok ekspektasi yang kita bangun sendiri di dalam kepala kita. Kita sering menuntut dunia untuk berjalan sesuai skenario yang kita tulis, padahal kita hanyalah aktor kecil di panggung semesta yang teramat luas ini.

Belajar melepaskan ekspektasi adalah perjalanan spiritual yang seumur hidup. Saat kita mulai belajar menerima bahwa ketidakpastian adalah bagian dari keindahan hidup, di situlah kedamaian batin bermula. Menerima bahwa tidak semua orang harus memahami cara kita berpikir, dan tidak setiap perjuangan harus berakhir dengan tepuk tangan riuh. Terkadang, berdamai dengan kekalahan adalah kemenangan yang paling sejati.`
    }
];

const INITIAL_MENUS = [
    { label: "Beranda", url: "#" },
    { label: "Cerita", url: "#category-Cerita" },
    { label: "Puisi", url: "#category-Puisi" },
    { label: "Renungan", url: "#category-Renungan" }
];

const DEFAULT_THEME = {
    preset: "night-ink",
    accent: "#d97706",
    font: "'Lora', serif",
    layout: "grid",
    heroTitle: "Danang Cruel Story",
    heroSubtitle: "Luka Yang di Tuliskan"
};

// =============================================================================
// STATE & INITIALIZATION
// =============================================================================

let posts = JSON.parse(localStorage.getItem("blog_posts")) || INITIAL_POSTS;
let menus = JSON.parse(localStorage.getItem("blog_menus")) || INITIAL_MENUS;
let themeSettings = JSON.parse(localStorage.getItem("blog_theme")) || DEFAULT_THEME;

// Force-restore theme layout settings (Migrated to v10 for Cozy Indie redesign)
if (!localStorage.getItem("blog_theme_migrated_v10")) {
    themeSettings.preset = "night-ink";
    themeSettings.accent = "#d97706";
    themeSettings.font = "'Lora', serif";
    themeSettings.heroTitle = "Danang Cruel Story";
    themeSettings.heroSubtitle = "Luka Yang di Tuliskan";
    localStorage.setItem("blog_theme", JSON.stringify(themeSettings));
    localStorage.setItem("blog_theme_migrated_v10", "true");
}

// Force-migrate category seed database (posts and menus) to v11 (About Me page inclusion)
if (!localStorage.getItem("blog_categories_migrated_v11")) {
    const updatedMenus = [...INITIAL_MENUS, { label: "About Me", url: "#about" }];
    localStorage.setItem("blog_posts", JSON.stringify(INITIAL_POSTS));
    localStorage.setItem("blog_menus", JSON.stringify(updatedMenus));
    localStorage.setItem("blog_categories_migrated_v11", "true");
    posts = INITIAL_POSTS;
    menus = updatedMenus;
}

// Self-healing function to recover Beranda & About Me if deleted from database
function ensureSystemMenus() {
    let modified = false;
    
    // Ensure Beranda is first
    const berandaIdx = menus.findIndex(m => m.label === "Beranda" || m.url === "#");
    if (berandaIdx === -1) {
        menus.unshift({ label: "Beranda", url: "#" });
        modified = true;
    }
    
    // Ensure About Me exists
    const aboutIdx = menus.findIndex(m => m.label === "About Me" || m.url === "#about");
    if (aboutIdx === -1) {
        menus.push({ label: "About Me", url: "#about" });
        modified = true;
    }
    
    if (modified) {
        localStorage.setItem("blog_menus", JSON.stringify(menus));
    }
}
ensureSystemMenus();

let currentCategoryFilter = "Semua";
let currentSearchQuery = "";
let tempUploadedCoverBase64 = "";
let editingMenuIndex = null;

const DEFAULT_AUTHOR = {
    name: "Danang",
    title: "Sang Pengelana Kata",
    photo: "assets/danang_profile.png",
    bio: `<p>Halo, aku <strong>Danang</strong>. Selamat datang di <em>nightyvity</em>—ruang hening tempatku merayakan kata-kata dan menumpahkan segala imajinasi, puisi, serta renungan personal.</p>
          <p>Bagiku, menulis bukan sekadar merangkai huruf, melainkan mengabadikan perasaan yang kerap layu sebelum sempat mekar berseri. Di lembaran digital ini, aku membagikan fragmen-fragmen pemikiran, catatan perjalanan sunyi, dan kisah-kisah kecil yang barangkali bisa menjadi teman bagi pencarianmu.</p>
          <p>Terima kasih telah meluangkan waktu sejenak untuk berteduh dan membaca baris demi baris cerita di blog ini. Semoga kamu menemukan bait yang mampu beresonansi dengan kisahmu sendiri.</p>`
};
let authorSettings = JSON.parse(localStorage.getItem("blog_author")) || DEFAULT_AUTHOR;
let tempUploadedAuthorPhotoBase64 = "";

// Save state to localStorage
function saveState() {
    localStorage.setItem("blog_posts", JSON.stringify(posts));
    localStorage.setItem("blog_menus", JSON.stringify(menus));
    localStorage.setItem("blog_theme", JSON.stringify(themeSettings));
}

// Admin Login and Access Controller
function checkAdminAccess() {
    const adminLoginOverlay = document.getElementById("adminLoginOverlay");
    const openDashboardBtn = document.getElementById("openDashboardBtn");
    const mobileOpenDashboardBtn = document.getElementById("mobileOpenDashboardBtn");
    
    // Check if hostname has "admin" or URL parameter "?admin=true"
    const isAdminDomain = window.location.hostname.includes("admin") || new URLSearchParams(window.location.search).has("admin");
    const isAdminLoggedIn = sessionStorage.getItem("admin_logged_in") === "true";

    if (openDashboardBtn) openDashboardBtn.style.display = "inline-flex";
    if (mobileOpenDashboardBtn) mobileOpenDashboardBtn.style.display = "inline-flex";

    if (isAdminLoggedIn) {
        if (adminLoginOverlay) adminLoginOverlay.classList.remove("active");
        if (openDashboardBtn) {
            openDashboardBtn.innerHTML = '<i data-lucide="sliders"></i><span>Dashboard</span>';
        }
        if (mobileOpenDashboardBtn) {
            mobileOpenDashboardBtn.innerHTML = '<i data-lucide="sliders"></i><span>Dashboard</span>';
        }
    } else {
        if (openDashboardBtn) {
            openDashboardBtn.innerHTML = '<i data-lucide="lock"></i><span>Masuk</span>';
        }
        if (mobileOpenDashboardBtn) {
            mobileOpenDashboardBtn.innerHTML = '<i data-lucide="lock"></i><span>Masuk</span>';
        }
        
        if (isAdminDomain) {
            if (adminLoginOverlay) adminLoginOverlay.classList.add("active");
        } else {
            if (adminLoginOverlay) adminLoginOverlay.classList.remove("active");
        }
    }

    if (window.lucide) window.lucide.createIcons();
}

function handleAdminLogin(e) {
    e.preventDefault();
    const usernameInput = document.getElementById("loginUsername");
    const passwordInput = document.getElementById("loginPassword");
    const errorMsg = document.getElementById("loginErrorMsg");
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    if (username === "admin" && password === "danangstory") {
        sessionStorage.setItem("admin_logged_in", "true");
        if (errorMsg) errorMsg.style.display = "none";
        showToast("Login sukses! Selamat datang Admin.");
        
        // Hide overlay and show dashboard buttons
        checkAdminAccess();
        
        // Open dashboard immediately for convenience
        openDashboard();
    } else {
        if (errorMsg) errorMsg.style.display = "block";
        showToast("Username atau Password salah!", "error");
    }
}

function handleAdminLogout() {
    showConfirmModal(
        "Keluar Admin",
        "Apakah Anda yakin ingin keluar dari akun Admin?",
        () => {
            sessionStorage.removeItem("admin_logged_in");
            showToast("Anda telah keluar dari akun Admin.", "error");
            
            // Close dashboard overlay
            closeDashboard();
            
            // Reload is cleanest to reset states
            window.location.reload();
        },
        "Keluar"
    );
}

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
    applyThemeSettings();
    checkAdminAccess();
    renderNav();
    renderFilters();
    renderPosts();
    initEventListeners();
    lucide.createIcons();

    // Listen for scroll to toggle styling on sticky blog brand header
    window.addEventListener("scroll", () => {
        const brand = document.querySelector(".blog-header-brand");
        if (brand) {
            if (window.scrollY > 20) {
                brand.classList.add("scrolled");
            } else {
                brand.classList.remove("scrolled");
            }
        }
    });
});

// =============================================================================
// THEME & CUSTOMIZATION CONTROLLERS
// =============================================================================

function applyThemeSettings() {
    const body = document.body;
    
    // Apply Preset Theme
    body.setAttribute("data-theme-preset", themeSettings.preset);
    
    // Apply Primary Accent Color
    body.style.setProperty("--color-primary", themeSettings.accent);
    const rgb = hexToRgb(themeSettings.accent);
    if (rgb) {
        body.style.setProperty("--color-primary-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }
    
    // Primary hover color (slightly lighter or darker depending on value)
    const hoverColor = adjustBrightness(themeSettings.accent, 20);
    body.style.setProperty("--color-primary-hover", hoverColor);

    // Apply Typography Font
    body.style.setProperty("--font-primary", themeSettings.font);

    // Apply Layout
    const postsGrid = document.getElementById("postsGrid");
    if (postsGrid) {
        if (themeSettings.layout === "list") {
            postsGrid.classList.remove("grid-view");
            postsGrid.classList.add("list-view");
        } else {
            postsGrid.classList.remove("list-view");
            postsGrid.classList.add("grid-view");
        }
    }

    // Apply Hero texts
    const heroTitle = document.getElementById("heroTitle");
    const heroSubtitle = document.getElementById("heroSubtitle");
    if (heroTitle) heroTitle.innerText = themeSettings.heroTitle;
    if (heroSubtitle) heroSubtitle.innerText = themeSettings.heroSubtitle;

    // Update customizer controls inside dashboard to match state
    updateCustomizerUIElements();
}

function updateCustomizerUIElements() {
    // 1. Theme Presets Active classes
    document.querySelectorAll(".theme-preset-card").forEach(card => {
        if (card.getAttribute("data-preset") === themeSettings.preset) {
            card.classList.add("active");
        } else {
            card.classList.remove("active");
        }
    });

    // 2. Accent Color Dots Active classes
    document.querySelectorAll(".accent-color-dot").forEach(dot => {
        if (dot.getAttribute("data-color").toLowerCase() === themeSettings.accent.toLowerCase()) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });

    // 3. Font Dropdown Select Value
    const fontSelect = document.getElementById("fontSelect");
    if (fontSelect) fontSelect.value = themeSettings.font;

    // 4. Layout selector Active classes
    const layoutGridBtn = document.getElementById("layoutGridBtn");
    const layoutListBtn = document.getElementById("layoutListBtn");
    if (layoutGridBtn && layoutListBtn) {
        if (themeSettings.layout === "list") {
            layoutListBtn.classList.add("active");
            layoutGridBtn.classList.remove("active");
        } else {
            layoutGridBtn.classList.add("active");
            layoutListBtn.classList.remove("active");
        }
    }

    // 5. Hero inputs
    const heroTitleInput = document.getElementById("heroTitleInput");
    const heroSubtitleInput = document.getElementById("heroSubtitleInput");
    if (heroTitleInput) heroTitleInput.value = themeSettings.heroTitle;
    if (heroSubtitleInput) heroSubtitleInput.value = themeSettings.heroSubtitle;

    // 6. Author Profile Form values
    const authorName = document.getElementById("authorName");
    const authorTitle = document.getElementById("authorTitle");
    const authorBio = document.getElementById("authorBio");
    const authorPhotoPreview = document.getElementById("authorPhotoPreview");
    if (authorName) authorName.value = authorSettings.name;
    if (authorTitle) authorTitle.value = authorSettings.title;
    if (authorBio) authorBio.value = authorSettings.bio;
    if (authorPhotoPreview) authorPhotoPreview.src = authorSettings.photo;
}

// Helpers for color operations
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function adjustBrightness(hex, percent) {
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    const rHex = R.toString(16).padStart(2, "0");
    const gHex = G.toString(16).padStart(2, "0");
    const bHex = B.toString(16).padStart(2, "0");

    return `#${rHex}${gHex}${bHex}`;
}

// =============================================================================
// BLOG RENDERERS & FILTERS
// =============================================================================

function getUniqueCategories() {
    const categories = new Set();
    
    // 1. Extract from existing posts
    posts.forEach(post => {
        if (post.category) {
            categories.add(post.category.trim());
        }
    });
    
    // 2. Extract from navigation menu anchors (to support pre-created categories)
    menus.forEach(menu => {
        if (menu.label === "Beranda") return;
        
        if (menu.url.startsWith("#category-")) {
            const cat = menu.url.replace("#category-", "").trim();
            if (cat) categories.add(cat);
        } else if (menu.url.startsWith("#") && menu.url !== "#") {
            const cat = menu.url.substring(1).trim();
            if (cat) {
                // Capitalize first letter to normalize naming format
                const formatted = cat.charAt(0).toUpperCase() + cat.slice(1);
                categories.add(formatted);
            }
        }
    });
    
    return Array.from(categories);
}


function renderNav() {
    const desktopNavList = document.getElementById("desktopNavList");
    const mobileNavList = document.getElementById("mobileNavList");
    
    // Sync any new categories first
    syncCategoriesToMenus();
    
    // Ensure Beranda & About Me system menus are present
    ensureSystemMenus();
    
    let html = "";
    menus.forEach(menu => {
        html += `<li><a href="${menu.url}" class="nav-link" data-url="${menu.url}">${menu.label}</a></li>`;
    });
    
    let mobileHtml = "";
    menus.forEach(menu => {
        mobileHtml += `<li><a href="${menu.url}" class="mobile-nav-link" data-url="${menu.url}">${menu.label}</a></li>`;
    });
    
    if (desktopNavList) desktopNavList.innerHTML = html;
    if (mobileNavList) mobileNavList.innerHTML = mobileHtml;

    // Highlight active link if category url matches current category
    updateNavHighlight();

    // Bind link click handlers
    const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const url = link.getAttribute("data-url");
            const labelText = link.textContent.trim().toLowerCase();
            
            // Check for About Me page trigger
            if (labelText === "about me" || labelText === "tentang saya" || url === "#about" || url === "#about-me") {
                e.preventDefault();
                showAboutPage();
                closeMobileDrawer();
                return;
            }
            
            // Smart category matching
            let matchedCategory = null;
            if (url.startsWith("#category-")) {
                matchedCategory = url.replace("#category-", "");
            } else if (url.startsWith("#") && url !== "#") {
                const potentialCat = url.substring(1).toLowerCase(); // e.g. "rindu" from "#rindu"
                // Check if this matches one of the categories of our posts
                const exists = posts.some(p => p.category.toLowerCase() === potentialCat);
                if (exists) {
                    const matchedPost = posts.find(p => p.category.toLowerCase() === potentialCat);
                    matchedCategory = matchedPost.category;
                }
            }

            if (matchedCategory) {
                e.preventDefault();
                setCategoryFilter(matchedCategory);
                closeMobileDrawer();
            } else if (url === "#" || url === "") {
                e.preventDefault();
                setCategoryFilter("Semua");
                closeMobileDrawer();
            }
        });
    });
}

function updateNavHighlight() {
    const links = document.querySelectorAll(".nav-link, .mobile-nav-link");
    links.forEach(link => {
        const url = link.getAttribute("data-url");
        if (currentCategoryFilter === "Semua" && (url === "#" || url === "")) {
            link.classList.add("active");
        } else if (
            url === `#category-${currentCategoryFilter}` || 
            url === `#${currentCategoryFilter.toLowerCase()}`
        ) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

function showAboutPage() {
    // Hide posts and filter section search container, but keep filter section brand header!
    const postsSection = document.querySelector(".posts-section");
    const searchContainer = document.querySelector(".search-container");
    const categoryFiltersContainer = document.querySelector(".category-filters-container");
    const aboutSection = document.getElementById("aboutSection");
    
    if (postsSection) postsSection.style.display = "none";
    if (searchContainer) searchContainer.style.display = "none";
    if (categoryFiltersContainer) categoryFiltersContainer.style.display = "none";
    
    if (aboutSection) {
        aboutSection.style.display = "block";
        
        // Render beautiful, customized About Author layout
        const activePostsCount = posts.length;
        const uniqueCategories = getUniqueCategories();
        const activeCategoriesCount = uniqueCategories.length;
        
        aboutSection.innerHTML = `
            <div class="about-grid">
                <!-- Polaroid Photo Frame Column -->
                <div class="about-photo-column">
                    <div class="polaroid-frame">
                        <div class="polaroid-photo">
                            <img src="assets/danang_profile.png" alt="Danang" onerror="this.src='https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80'">
                        </div>
                        <div class="polaroid-caption">Danang</div>
                    </div>
                    <div class="handwritten-signature">Sang Pengelana Kata</div>
                </div>
                
                <!-- Biography Column -->
                <div class="about-content-column">
                    <h2 class="about-title">Catatan Kecil Sang Penulis</h2>
                    <div class="about-text">
                        <p>Halo, aku <strong>Danang</strong>. Selamat datang di <em>nightyvity</em>—ruang hening tempatku merayakan kata-kata dan menumpahkan segala imajinasi, puisi, serta renungan personal.</p>
                        <p>Bagiku, menulis bukan sekadar merangkai huruf, melainkan mengabadikan perasaan yang kerap layu sebelum sempat mekar berseri. Di lembaran digital ini, aku membagikan fragmen-fragmen pemikiran, catatan perjalanan sunyi, dan kisah-kisah kecil yang barangkali bisa menjadi teman bagi pencarianmu.</p>
                        <p>Terima kasih telah meluangkan waktu sejenak untuk berteduh dan membaca baris demi baris cerita di blog ini. Semoga kamu menemukan bait yang mampu beresonansi dengan kisahmu sendiri.</p>
                    </div>
                    
                    <!-- Typewriter-styled Stats -->
                    <div class="about-stats-container">
                        <div class="about-stat-card">
                            <span class="stat-num">${activePostsCount}</span>
                            <span class="stat-label">Cerita Aktif</span>
                        </div>
                        <div class="about-stat-card">
                            <span class="stat-num">${activeCategoriesCount}</span>
                            <span class="stat-label">Kategori</span>
                        </div>
                        <div class="about-stat-card">
                            <span class="stat-num">2026</span>
                            <span class="stat-label">Tahun Berdiri</span>
                        </div>
                    </div>
                    
                    <div class="about-actions">
                        <button class="btn btn-primary" id="btnBackToHomeFromAbout">
                            <i data-lucide="book-open"></i> Baca Cerita
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        lucide.createIcons();
        
        // Bind back to home button
        const backBtn = document.getElementById("btnBackToHomeFromAbout");
        if (backBtn) {
            backBtn.addEventListener("click", () => {
                hideAboutPage();
                setCategoryFilter("Semua");
            });
        }
    }
    
    // Set active class on navbar link
    document.querySelectorAll(".nav-link, .mobile-nav-link").forEach(link => {
        const url = link.getAttribute("data-url");
        const labelText = link.textContent.trim().toLowerCase();
        if (labelText === "about me" || labelText === "tentang saya" || url === "#about" || url === "#about-me") {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

function hideAboutPage() {
    const postsSection = document.querySelector(".posts-section");
    const searchContainer = document.querySelector(".search-container");
    const categoryFiltersContainer = document.querySelector(".category-filters-container");
    const aboutSection = document.getElementById("aboutSection");
    
    if (postsSection) postsSection.style.display = "block";
    if (searchContainer) searchContainer.style.display = "block";
    if (categoryFiltersContainer) categoryFiltersContainer.style.display = "block";
    if (aboutSection) aboutSection.style.display = "none";
}

function renderFilters() {
    const filterContainer = document.getElementById("categoryFilters");
    if (!filterContainer) return;
    
    // Extract unique categories dynamically from both posts and menus
    const categories = getUniqueCategories();
    
    let html = `<button class="filter-chip ${currentCategoryFilter === "Semua" ? "active" : ""}" data-category="Semua">Semua</button>`;
    categories.forEach(cat => {
        html += `<button class="filter-chip ${currentCategoryFilter === cat ? "active" : ""}" data-category="${cat}">${cat}</button>`;
    });
    
    filterContainer.innerHTML = html;
    
    // Add chip click event listeners
    document.querySelectorAll(".filter-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            const category = chip.getAttribute("data-category");
            setCategoryFilter(category);
        });
    });
}

function setCategoryFilter(category) {
    hideAboutPage();
    currentCategoryFilter = category;
    
    // Update active filter pills
    document.querySelectorAll(".filter-chip").forEach(chip => {
        if (chip.getAttribute("data-category") === category) {
            chip.classList.add("active");
        } else {
            chip.classList.remove("active");
        }
    });
    
    updateNavHighlight();
    renderPosts();
}

function renderPosts() {
    const postsGrid = document.getElementById("postsGrid");
    const emptyState = document.getElementById("emptyState");
    if (!postsGrid) return;

    // Filter posts
    let filteredPosts = posts;

    // Category Filter
    if (currentCategoryFilter !== "Semua") {
        filteredPosts = filteredPosts.filter(post => post.category.toLowerCase() === currentCategoryFilter.toLowerCase());
    }

    // Search Query Filter
    if (currentSearchQuery.trim() !== "") {
        const query = currentSearchQuery.toLowerCase().trim();
        filteredPosts = filteredPosts.filter(post => 
            post.title.toLowerCase().includes(query) || 
            post.category.toLowerCase().includes(query) || 
            post.content.toLowerCase().includes(query) ||
            post.tags.some(tag => tag.toLowerCase().includes(query))
        );
    }

    // Sort by date descending
    filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filteredPosts.length === 0) {
        postsGrid.innerHTML = "";
        emptyState.style.display = "block";
    } else {
        emptyState.style.display = "none";
        
        let html = "";
        filteredPosts.forEach(post => {
            const tagsHtml = post.tags.slice(0, 3).map(tag => `#${tag}`).join(" ");
            const firstLetter = post.category ? post.category.charAt(0).toUpperCase() : "B";
            
            // Format dates neatly
            const dateObj = new Date(post.date);
            const formattedDate = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
            
            // Text snippet - strip HTML tags to prevent layout breakages
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = post.content;
            const plainText = tempDiv.textContent || tempDiv.innerText || "";
            const snippet = plainText.length > 140 ? plainText.substring(0, 140) + "..." : plainText;

            // Handle optional cover image
            const coverHtml = (post.cover && post.cover !== "none") ?
                `<img src="${post.cover}" alt="${post.title}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1546074177-ffedd79d494d?w=800&auto=format&fit=crop'">` :
                `<div class="card-no-cover-banner">DCS</div>`;

            html += `
            <article class="blog-card" data-id="${post.id}">
                <div class="card-img-wrapper">
                    ${coverHtml}
                    <span class="card-badge">${post.category}</span>
                </div>
                <div class="card-body">
                    <span class="card-date">${formattedDate}</span>
                    <h3 class="card-title">${post.title}</h3>
                    <p class="card-snippet">${snippet}</p>
                    <div class="card-footer">
                        <a href="#" class="btn-read-more" data-id="${post.id}">
                            Selengkapnya <i data-lucide="arrow-right" style="width: 14px; height: 14px;"></i>
                        </a>
                    </div>
                </div>
            </article>
            `;
        });
        
        postsGrid.innerHTML = html;
        lucide.createIcons();

        // Bind read details clicks
        document.querySelectorAll(".btn-read-more, .blog-card").forEach(el => {
            el.addEventListener("click", (e) => {
                // If clicked details, prevent default link behavior
                if (e.target.closest("a")) {
                    e.preventDefault();
                }
                const id = el.getAttribute("data-id");
                openArticleReader(id);
            });
        });
    }
}

// =============================================================================
// ARTICLE READER
// =============================================================================

function openArticleReader(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    const overlay = document.getElementById("articleReaderOverlay");
    const coverImg = document.getElementById("readerCoverImg");
    const category = document.getElementById("readerCategory");
    const date = document.getElementById("readerDate");
    const title = document.getElementById("readerTitle");
    const content = document.getElementById("readerContent");
    const tags = document.getElementById("readerTags");

    if (!overlay) return;

    // Handle optional cover layout
    const coverContainer = coverImg.closest(".reader-cover-container");
    const oldBanner = coverContainer.querySelector(".reader-no-cover-banner");
    if (oldBanner) oldBanner.remove();

    if (post.cover && post.cover !== "none") {
        coverImg.src = post.cover;
        coverImg.style.display = "block";
        coverImg.onerror = () => { coverImg.src = 'https://images.unsplash.com/photo-1546074177-ffedd79d494d?w=800&auto=format&fit=crop'; };
    } else {
        coverImg.style.display = "none";
        const noCoverBanner = document.createElement("div");
        noCoverBanner.className = "reader-no-cover-banner";
        noCoverBanner.innerText = "DCS";
        coverContainer.appendChild(noCoverBanner);
    }

    category.innerText = post.category;
    
    const dateObj = new Date(post.date);
    date.innerText = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    
    title.innerText = post.title;

    // Render HTML content if rich text, otherwise split text block paragraphs
    if (post.content.trim().startsWith("<p") || post.content.includes("</p>") || post.content.includes("<br>")) {
        content.innerHTML = post.content;
    } else {
        const paragraphHtml = post.content.split("\n\n").map(para => {
            return `<p>${para.replace(/\n/g, "<br>")}</p>`;
        }).join("");
        content.innerHTML = paragraphHtml;
    }

    // Tags
    let tagsHtml = "";
    post.tags.forEach(tag => {
        tagsHtml += `<span class="tag-badge">#${tag}</span>`;
    });
    tags.innerHTML = tagsHtml;

    // Open Modal
    overlay.classList.add("active");
    document.body.style.overflow = "hidden"; // Lock page scroll
}

function closeArticleReader() {
    const overlay = document.getElementById("articleReaderOverlay");
    if (overlay) {
        overlay.classList.remove("active");
        document.body.style.overflow = ""; // Restore page scroll
    }
}

// =============================================================================
// DASHBOARD & ADMIN PANEL CONTROLLER
// =============================================================================

function openDashboard() {
    document.getElementById("dashboardOverlay").classList.add("active");
    document.body.style.overflow = "hidden";
    
    // Default to articles tab
    switchTab("tab-articles");
    renderDashboardPosts();
}

function closeDashboard() {
    document.getElementById("dashboardOverlay").classList.remove("active");
    document.body.style.overflow = "";
}

function switchTab(tabId) {
    // Nav buttons active classes
    document.querySelectorAll(".sidebar-nav-btn").forEach(btn => {
        if (btn.getAttribute("data-tab") === tabId) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Content views active classes
    document.querySelectorAll(".dashboard-tab-content").forEach(content => {
        if (content.id === tabId) {
            content.classList.add("active");
        } else {
            content.classList.remove("active");
        }
    });

    // Render contents specifically for certain tabs
    if (tabId === "tab-articles") {
        renderDashboardPosts();
    } else if (tabId === "tab-menus") {
        renderDashboardMenus();
    }
}

// --- ARTICLE OPERATIONS ---

function renderDashboardPosts() {
    const listBody = document.getElementById("dashboardPostsList");
    if (!listBody) return;
    
    // Sort descending by date
    const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = "";
    if (sortedPosts.length === 0) {
        html = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Belum ada cerita. Silakan buat cerita baru!</td></tr>`;
    } else {
        sortedPosts.forEach(post => {
            const dateObj = new Date(post.date);
            const formattedDate = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
            
            html += `
            <tr>
                <td>
                    <div class="table-post-cell">
                        <img src="${post.cover}" alt="cover" class="table-post-img" onerror="this.src='https://images.unsplash.com/photo-1546074177-ffedd79d494d?w=800&auto=format&fit=crop'">
                        <span class="table-post-title">${post.title}</span>
                    </div>
                </td>
                <td>
                    <span class="table-badge">${post.category}</span>
                </td>
                <td>${formattedDate}</td>
                <td class="text-right">
                    <div class="actions-cell">
                        <button class="btn btn-secondary btn-sm btn-edit-post" data-id="${post.id}" title="Edit Cerita">
                            <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
                        </button>
                        <button class="btn btn-danger btn-sm btn-delete-post" data-id="${post.id}" title="Hapus Cerita">
                            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                        </button>
                    </div>
                </td>
            </tr>
            `;
        });
    }

    listBody.innerHTML = html;
    lucide.createIcons();

    // Bind Edit and Delete handlers
    document.querySelectorAll(".btn-edit-post").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            openPostEditor(id);
        });
    });

    document.querySelectorAll(".btn-delete-post").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            deletePost(id);
        });
    });
}

function populateCategoryDatalist() {
    const datalist = document.getElementById("categoryDatalist");
    if (!datalist) return;
    
    // Extract unique categories dynamically from both posts and menus
    const categories = getUniqueCategories();
    
    let html = "";
    categories.forEach(cat => {
        html += `<option value="${cat}"></option>`;
    });
    datalist.innerHTML = html;
}

function openPostEditor(id = null) {
    const editorOverlay = document.getElementById("articleEditorOverlay");
    const editorTitle = document.getElementById("editorPopupTitle");
    const form = document.getElementById("articleForm");
    
    // Inputs
    const editIdInput = document.getElementById("editPostId");
    const titleInput = document.getElementById("postTitle");
    const categoryInput = document.getElementById("postCategory");
    const tagsInput = document.getElementById("postTags");
    const coverFile = document.getElementById("postCoverFile");
    const coverPreview = document.getElementById("editorCoverPreview");
    const removeCoverBtn = document.getElementById("btnRemoveCover");
    const editorContent = document.getElementById("editorContent");

    form.reset();
    tempUploadedCoverBase64 = "none";
    if (coverFile) coverFile.value = "";
    if (coverPreview) {
        coverPreview.src = "";
        coverPreview.style.display = "none";
    }
    if (removeCoverBtn) removeCoverBtn.style.display = "none";

    populateCategoryDatalist();

    if (id) {
        // Edit mode
        const post = posts.find(p => p.id === id);
        if (!post) return;

        editorTitle.innerText = "Edit Cerita";
        editIdInput.value = post.id;
        titleInput.value = post.title;
        categoryInput.value = post.category;
        tagsInput.value = post.tags.join(", ");
        editorContent.innerHTML = post.content;

        // Cover handling
        if (post.cover && post.cover !== "none" && !post.cover.startsWith("assets/")) {
            tempUploadedCoverBase64 = post.cover;
            if (coverPreview) {
                coverPreview.src = post.cover;
                coverPreview.style.display = "block";
            }
            if (removeCoverBtn) removeCoverBtn.style.display = "flex";
        }
    } else {
        // Add Mode
        editorTitle.innerText = "Tulis Cerita Baru";
        editIdInput.value = "";
        editorContent.innerHTML = "";
    }

    editorOverlay.classList.add("active");
}

function closePostEditor() {
    document.getElementById("articleEditorOverlay").classList.remove("active");
}

function savePost(e) {
    e.preventDefault();
    
    const id = document.getElementById("editPostId").value;
    const title = document.getElementById("postTitle").value.trim();
    // Strip '#' symbol from category name to prevent hash collision
    const category = document.getElementById("postCategory").value.replace(/#/g, "").trim();
    const tagsRaw = document.getElementById("postTags").value.trim();
    const content = document.getElementById("editorContent").innerHTML.trim();

    if (content === "" || content === "<br>") {
        showToast("Konten cerita tidak boleh kosong!", "error");
        return;
    }

    const coverPath = tempUploadedCoverBase64 || "none";

    // Split tags by comma, strip '#' symbols, and filter empty entries
    const tags = tagsRaw ? tagsRaw.split(",").map(t => t.replace(/#/g, "").trim()).filter(t => t.length > 0) : [];

    if (id) {
        // Update post
        const index = posts.findIndex(p => p.id === id);
        if (index !== -1) {
            posts[index] = {
                ...posts[index],
                title,
                category,
                tags,
                cover: coverPath,
                content
            };
            showToast("Cerita berhasil diperbarui!");
        }
    } else {
        // Create new post
        const newPost = {
            id: `post-${Date.now()}`,
            title,
            category,
            tags,
            date: new Date().toISOString().split("T")[0],
            cover: coverPath,
            content
        };
        posts.push(newPost);
        showToast("Cerita baru berhasil diterbitkan!");
    }

    // Automatically add category to navigation menus if it doesn't exist
    const menuExists = menus.some(m => m.url === `#category-${category}` || m.label.toLowerCase() === category.toLowerCase());
    if (!menuExists && category && category !== "Semua") {
        menus.push({
            label: category,
            url: `#category-${category}`
        });
    }

    saveState();
    closePostEditor();
    renderNav();
    renderDashboardMenus();
    renderPosts();
    renderFilters();
    renderDashboardPosts();
}

function deletePost(id) {
    showConfirmModal(
        "Hapus Cerita",
        "Apakah Anda yakin ingin menghapus cerita ini secara permanen? Tindakan ini tidak dapat dibatalkan.",
        () => {
            posts = posts.filter(p => p.id !== id);
            saveState();
            showToast("Cerita telah dihapus.", "error");
            
            renderNav();
            renderDashboardMenus();
            renderPosts();
            renderFilters();
            renderDashboardPosts();
        }
    );
}

// --- NAVIGATION MENU OPERATIONS ---

function syncCategoriesToMenus() {
    let updated = false;
    posts.forEach(post => {
        if (post.category) {
            const cat = post.category.trim();
            const exists = menus.some(m => m.label.toLowerCase() === cat.toLowerCase() || m.url === `#category-${cat}`);
            if (!exists) {
                menus.push({ label: cat, url: `#category-${cat}` });
                updated = true;
            }
        }
    });
    if (updated) {
        saveState();
    }
}

function renderDashboardMenus() {
    const menuList = document.getElementById("menuList");
    if (!menuList) return;
    
    // Sync any new categories first
    syncCategoriesToMenus();
    
    let html = "";
    if (menus.length === 0) {
        html = `<div style="text-align: center; color: var(--text-muted); padding: 1rem 0;">Belum ada menu navigasi kustom.</div>`;
    } else {
        menus.forEach((menu, index) => {
            const isSystemMenu = menu.label === "Beranda" || menu.label === "About Me" || menu.url === "#" || menu.url === "#about";
            html += `
            <div class="menu-item-row" draggable="true" data-index="${index}">
                <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1;">
                    <!-- Drag handle icon -->
                    <i data-lucide="grip-vertical" style="width: 16px; height: 16px; color: var(--text-muted); cursor: grab; flex-shrink: 0;"></i>
                    <div class="menu-item-info">
                        <span class="menu-item-label">${menu.label}</span>
                        <span class="menu-item-url">${menu.url}</span>
                    </div>
                </div>
                ${!isSystemMenu ? `
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button type="button" class="btn-icon btn-edit-menu" data-index="${index}" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 50%; cursor: pointer;" title="Edit Menu">
                        <i data-lucide="edit-2" style="width: 14px; height: 14px;"></i>
                    </button>
                    <button type="button" class="btn-icon btn-delete-menu" data-index="${index}" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); color: #ef4444; cursor: pointer;" title="Hapus Menu">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                    </button>
                </div>
                ` : `<span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; padding-right: 0.5rem;">Sistem</span>`}
            </div>
            `;
        });
    }
    
    menuList.innerHTML = html;
    lucide.createIcons();

    // Bind Drag and Drop Events
    const rows = menuList.querySelectorAll(".menu-item-row");
    rows.forEach(row => {
        row.addEventListener("dragstart", (e) => {
            row.classList.add("dragging");
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", row.getAttribute("data-index"));
        });
        
        row.addEventListener("dragend", () => {
            row.classList.remove("dragging");
            rows.forEach(r => r.classList.remove("drag-over-above", "drag-over-below"));
        });
        
        row.addEventListener("dragover", (e) => {
            e.preventDefault();
            row.classList.remove("drag-over-above", "drag-over-below");
            
            const rect = row.getBoundingClientRect();
            const relY = e.clientY - rect.top;
            
            if (relY < rect.height / 2) {
                row.classList.add("drag-over-above");
            } else {
                row.classList.add("drag-over-below");
            }
        });
        
        row.addEventListener("dragleave", () => {
            row.classList.remove("drag-over-above", "drag-over-below");
        });
        
        row.addEventListener("drop", (e) => {
            e.preventDefault();
            const dragIdx = parseInt(e.dataTransfer.getData("text/plain"));
            const targetIdx = parseInt(row.getAttribute("data-index"));
            
            if (isNaN(dragIdx) || dragIdx === targetIdx) return;
            
            const rect = row.getBoundingClientRect();
            const relY = e.clientY - rect.top;
            
            let insertIdx = targetIdx;
            if (relY >= rect.height / 2) {
                insertIdx = targetIdx + 1;
            }
            
            const movedItem = menus[dragIdx];
            menus.splice(dragIdx, 1);
            
            let finalInsertIdx = insertIdx;
            if (dragIdx < insertIdx) {
                finalInsertIdx = insertIdx - 1;
            }
            
            menus.splice(finalInsertIdx, 0, movedItem);
            
            saveState();
            renderDashboardMenus();
            renderNav();
            showToast("Urutan menu navigasi berhasil diperbarui!");
        });
    });

    // Bind edit menu click
    document.querySelectorAll(".btn-edit-menu").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = parseInt(btn.getAttribute("data-index"));
            startEditMenu(idx);
        });
    });

    // Bind delete menu click
    document.querySelectorAll(".btn-delete-menu").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = parseInt(btn.getAttribute("data-index"));
            deleteMenu(idx);
        });
    });
}

function startEditMenu(index) {
    editingMenuIndex = index;
    const menu = menus[index];
    
    document.getElementById("menuLabel").value = menu.label;
    document.getElementById("menuUrl").value = menu.url;
    
    const formTitle = document.querySelector("#menuForm h3");
    if (formTitle) formTitle.innerText = "Edit Menu Navigasi";
    
    const submitBtn = document.getElementById("btnAddMenuSubmit");
    if (submitBtn) {
        submitBtn.innerHTML = `<i data-lucide="save"></i> Simpan Perubahan`;
        lucide.createIcons();
    }
    
    // Add cancel button if not already present
    if (!document.getElementById("btnCancelEditMenu")) {
        const cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.className = "btn btn-secondary w-full";
        cancelBtn.id = "btnCancelEditMenu";
        cancelBtn.style.marginTop = "0.5rem";
        cancelBtn.innerHTML = `<i data-lucide="x"></i> Batal Edit`;
        submitBtn.parentNode.appendChild(cancelBtn);
        lucide.createIcons();
        
        cancelBtn.addEventListener("click", resetMenuForm);
    }
    
    document.getElementById("menuLabel").focus();
}

function resetMenuForm() {
    editingMenuIndex = null;
    document.getElementById("menuForm").reset();
    
    const formTitle = document.querySelector("#menuForm h3");
    if (formTitle) formTitle.innerText = "Tambah Menu Baru";
    
    const submitBtn = document.getElementById("btnAddMenuSubmit");
    if (submitBtn) {
        submitBtn.innerHTML = `<i data-lucide="plus"></i> Tambah ke Navigasi`;
        lucide.createIcons();
    }
    
    const cancelBtn = document.getElementById("btnCancelEditMenu");
    if (cancelBtn) cancelBtn.remove();
}

function saveMenu(e) {
    e.preventDefault();
    const label = document.getElementById("menuLabel").value.trim();
    const url = document.getElementById("menuUrl").value.trim();

    if (editingMenuIndex !== null) {
        // Check for duplicates (excluding the current one)
        const isDuplicate = menus.some((m, idx) => idx !== editingMenuIndex && m.label.toLowerCase() === label.toLowerCase());
        if (isDuplicate) {
            showToast("Nama menu ini sudah digunakan!", "error");
            return;
        }
        
        const oldLabel = menus[editingMenuIndex].label;
        menus[editingMenuIndex] = { label, url };
        saveState();
        showToast(`Menu "${oldLabel}" diperbarui menjadi "${label}"!`);
        resetMenuForm();
    } else {
        if (menus.some(m => m.label.toLowerCase() === label.toLowerCase())) {
            showToast("Nama menu ini sudah digunakan!", "error");
            return;
        }

        menus.push({ label, url });
        saveState();
        showToast(`Menu "${label}" berhasil ditambahkan!`);
        document.getElementById("menuForm").reset();
    }
    
    renderNav();
    renderDashboardMenus();
    renderFilters();
}

let confirmProceedCallback = null;

function showConfirmModal(title, message, onProceed, proceedText = "Hapus") {
    const modal = document.getElementById("confirmModalOverlay");
    const titleEl = document.getElementById("confirmModalTitle");
    const msgEl = document.getElementById("confirmModalMessage");
    const proceedBtn = document.getElementById("btnConfirmProceed");
    
    if (!modal || !titleEl || !msgEl || !proceedBtn) return;
    
    titleEl.innerText = title;
    msgEl.innerText = message;
    proceedBtn.innerText = proceedText;
    confirmProceedCallback = onProceed;
    
    modal.classList.add("active");
}

function closeConfirmModal() {
    const modal = document.getElementById("confirmModalOverlay");
    if (modal) modal.classList.remove("active");
    confirmProceedCallback = null;
}

function deleteMenu(index) {
    if (index === 0) return; // Prevent deleting home
    const label = menus[index].label;
    
    showConfirmModal(
        "Hapus Menu",
        `Apakah Anda yakin ingin menghapus menu "${label}" dari navigasi?`,
        () => {
            menus.splice(index, 1);
            saveState();
            showToast("Menu berhasil dihapus.", "error");
            
            renderNav();
            renderDashboardMenus();
            renderFilters();
        }
    );
}

// =============================================================================
// TOAST NOTIFICATIONS UTILITY
// =============================================================================

function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    const icon = type === "success" ? "check-circle" : "alert-circle";
    toast.innerHTML = `
        <i data-lucide="${icon}" style="width: 18px; height: 18px;"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    // Remove toast after animation completes
    setTimeout(() => {
        toast.style.animation = "toastIn 0.3s reverse forwards ease-out";
        toast.addEventListener("animationend", () => {
            toast.remove();
        });
    }, 3000);
}

// =============================================================================
// INTERACTIVE EVENT LISTENERS BINDING
// =============================================================================

function initEventListeners() {
    // --- Header & Drawer Event Listeners ---
    const mobileMenuToggle = document.getElementById("mobileMenuToggle");
    const closeMobileDrawerBtn = document.getElementById("closeMobileDrawerBtn");
    const mobileDrawer = document.getElementById("mobileDrawer");
    const mobileDrawerOverlay = document.getElementById("mobileDrawerOverlay");

    const openMobileDrawer = () => {
        mobileDrawer.classList.add("active");
        mobileDrawerOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
    };

    const closeMobileDrawer = () => {
        mobileDrawer.classList.remove("active");
        mobileDrawerOverlay.classList.remove("active");
        document.body.style.overflow = "";
    };

    if (mobileMenuToggle) mobileMenuToggle.addEventListener("click", openMobileDrawer);
    if (closeMobileDrawerBtn) closeMobileDrawerBtn.addEventListener("click", closeMobileDrawer);
    if (mobileDrawerOverlay) mobileDrawerOverlay.addEventListener("click", closeMobileDrawer);

    // --- Search Filter Events ---
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            currentSearchQuery = e.target.value;
            renderPosts();
        });
    }

    // --- Reader Close Events ---
    const closeReaderBtn = document.getElementById("closeReaderBtn");
    const readerOverlay = document.getElementById("articleReaderOverlay");
    
    if (closeReaderBtn) closeReaderBtn.addEventListener("click", closeArticleReader);
    if (readerOverlay) {
        readerOverlay.addEventListener("click", (e) => {
            if (e.target === readerOverlay) {
                closeArticleReader();
            }
        });
    }

    // --- Dashboard Trigger Events ---
    const openDashboardBtn = document.getElementById("openDashboardBtn");
    const mobileOpenDashboardBtn = document.getElementById("mobileOpenDashboardBtn");
    const closeDashboardBtn = document.getElementById("closeDashboardBtn");
    const mobileCloseDashboardBtn = document.getElementById("mobileCloseDashboardBtn");
    const dashboardOverlay = document.getElementById("dashboardOverlay");

    const handleDashboardBtnClick = () => {
        const isAdminLoggedIn = sessionStorage.getItem("admin_logged_in") === "true";
        if (isAdminLoggedIn) {
            openDashboard();
        } else {
            const adminLoginOverlay = document.getElementById("adminLoginOverlay");
            if (adminLoginOverlay) adminLoginOverlay.classList.add("active");
        }
    };

    if (openDashboardBtn) openDashboardBtn.addEventListener("click", handleDashboardBtnClick);
    if (mobileOpenDashboardBtn) {
        mobileOpenDashboardBtn.addEventListener("click", () => {
            closeMobileDrawer();
            handleDashboardBtnClick();
        });
    }

    const closeAdminLoginBtn = document.getElementById("closeAdminLoginBtn");
    if (closeAdminLoginBtn) {
        closeAdminLoginBtn.addEventListener("click", () => {
            const adminLoginOverlay = document.getElementById("adminLoginOverlay");
            if (adminLoginOverlay) adminLoginOverlay.classList.remove("active");
        });
    }

    if (closeDashboardBtn) closeDashboardBtn.addEventListener("click", closeDashboard);
    if (mobileCloseDashboardBtn) mobileCloseDashboardBtn.addEventListener("click", closeDashboard);
    
    if (dashboardOverlay) {
        dashboardOverlay.addEventListener("click", (e) => {
            if (e.target === dashboardOverlay) {
                closeDashboard();
            }
        });
    }

    // --- Tab Switching ---
    document.querySelectorAll(".sidebar-nav-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const tabId = btn.getAttribute("data-tab");
            switchTab(tabId);
        });
    });

    // --- Quick Theme Preset Toggler in Header ---
    const themePresetToggle = document.getElementById("themePresetToggle");
    if (themePresetToggle) {
        themePresetToggle.addEventListener("click", () => {
            // Rotate presets: night-ink -> parchment-paper -> typewriter-vintage -> night-ink
            if (themeSettings.preset === "night-ink") {
                themeSettings.preset = "parchment-paper";
                themeSettings.accent = "#b45309"; // Muted sepia brown
            } else if (themeSettings.preset === "parchment-paper") {
                themeSettings.preset = "typewriter-vintage";
                themeSettings.accent = "#8a7b6e"; // Muted typewriter grey
            } else {
                themeSettings.preset = "night-ink";
                themeSettings.accent = "#d97706"; // Amber accent
            }
            
            saveState();
            applyThemeSettings();
            showToast(`Tema diganti ke: ${themeSettings.preset.replace("-", " ")}`);
        });
    }

    // --- Customizer Presets in Dashboard ---
    document.querySelectorAll(".theme-preset-card").forEach(card => {
        card.addEventListener("click", () => {
            const preset = card.getAttribute("data-preset");
            themeSettings.preset = preset;
            
            // Adjust defaults accent when preset changes for better visuals
            if (preset === "parchment-paper") {
                themeSettings.accent = "#b45309"; // Sepia brown
            } else if (preset === "typewriter-vintage") {
                themeSettings.accent = "#8a7b6e"; // Muted grey
            } else {
                themeSettings.accent = "#d97706"; // Amber
            }

            saveState();
            applyThemeSettings();
            showToast("Preset tema berhasil diubah!");
        });
    });

    // --- Customizer Accent Color ---
    document.querySelectorAll(".accent-color-dot").forEach(dot => {
        dot.addEventListener("click", () => {
            const color = dot.getAttribute("data-color");
            themeSettings.accent = color;
            
            saveState();
            applyThemeSettings();
            showToast("Warna aksen diperbarui!");
        });
    });

    // --- Customizer Font Selection ---
    const fontSelect = document.getElementById("fontSelect");
    if (fontSelect) {
        fontSelect.addEventListener("change", (e) => {
            themeSettings.font = e.target.value;
            saveState();
            applyThemeSettings();
            showToast("Pilihan font diterapkan!");
        });
    }

    // --- Customizer Layout Selection ---
    const layoutGridBtn = document.getElementById("layoutGridBtn");
    const layoutListBtn = document.getElementById("layoutListBtn");
    
    if (layoutGridBtn) {
        layoutGridBtn.addEventListener("click", () => {
            themeSettings.layout = "grid";
            saveState();
            applyThemeSettings();
            showToast("Tampilan diubah ke Grid Cards.");
        });
    }
    if (layoutListBtn) {
        layoutListBtn.addEventListener("click", () => {
            themeSettings.layout = "list";
            saveState();
            applyThemeSettings();
            showToast("Tampilan diubah ke Column List.");
        });
    }

    // --- Customizer Banner Text Editor ---
    const saveHeroTextBtn = document.getElementById("saveHeroTextBtn");
    if (saveHeroTextBtn) {
        saveHeroTextBtn.addEventListener("click", () => {
            const titleVal = document.getElementById("heroTitleInput").value.trim();
            const subtitleVal = document.getElementById("heroSubtitleInput").value.trim();
            
            if (!titleVal) {
                showToast("Judul banner tidak boleh kosong!", "error");
                return;
            }
            
            themeSettings.heroTitle = titleVal;
            themeSettings.heroSubtitle = subtitleVal;
            saveState();
            applyThemeSettings();
            showToast("Teks banner berhasil disimpan!");
        });
    }

    // --- Author Profile Settings Events ---
    const authorPhotoFile = document.getElementById("authorPhotoFile");
    const authorForm = document.getElementById("authorForm");
    const btnRemoveAuthorPhoto = document.getElementById("btnRemoveAuthorPhoto");

    if (authorPhotoFile) {
        authorPhotoFile.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    
                    // Downscale to max 300px width/height for author photo
                    const MAX_SIZE = 300;
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Compress as JPEG (75% quality)
                    tempUploadedAuthorPhotoBase64 = canvas.toDataURL("image/jpeg", 0.75);
                    
                    const preview = document.getElementById("authorPhotoPreview");
                    if (preview) preview.src = tempUploadedAuthorPhotoBase64;
                    
                    showToast("Foto profil terunggah (Pratinjau). Simpan profil untuk menerapkan.");
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    if (btnRemoveAuthorPhoto) {
        btnRemoveAuthorPhoto.addEventListener("click", () => {
            tempUploadedAuthorPhotoBase64 = "assets/danang_profile.png";
            const preview = document.getElementById("authorPhotoPreview");
            if (preview) preview.src = "assets/danang_profile.png";
            showToast("Foto profil direset ke default. Simpan profil untuk menerapkan.");
        });
    }

    if (authorForm) {
        authorForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const nameVal = document.getElementById("authorName").value.trim();
            const titleVal = document.getElementById("authorTitle").value.trim();
            const bioVal = document.getElementById("authorBio").value.trim();
            
            authorSettings.name = nameVal;
            authorSettings.title = titleVal;
            authorSettings.bio = bioVal;
            
            if (tempUploadedAuthorPhotoBase64) {
                authorSettings.photo = tempUploadedAuthorPhotoBase64;
                tempUploadedAuthorPhotoBase64 = "";
            }
            
            localStorage.setItem("blog_author", JSON.stringify(authorSettings));
            showToast("Profil penulis berhasil disimpan!");
            
            // Re-render About Me page if visible
            const aboutSection = document.getElementById("aboutSection");
            if (aboutSection && aboutSection.style.display !== "none") {
                showAboutPage();
            }
        });
    }

    // --- Article Editor Actions ---
    const btnCreatePost = document.getElementById("btnCreatePost");
    const emptyCreateBtn = document.getElementById("emptyCreateBtn");
    const closeEditorPopupBtn = document.getElementById("closeEditorPopupBtn");
    const btnCancelPost = document.getElementById("btnCancelPost");
    const articleForm = document.getElementById("articleForm");
    const coverSelect = document.getElementById("postCoverSelect");
    const customCoverGroup = document.getElementById("customCoverUrlGroup");

    if (btnCreatePost) btnCreatePost.addEventListener("click", () => openPostEditor());
    if (emptyCreateBtn) emptyCreateBtn.addEventListener("click", () => {
        closeDashboard();
        openPostEditor();
    });
    if (closeEditorPopupBtn) closeEditorPopupBtn.addEventListener("click", closePostEditor);
    if (btnCancelPost) btnCancelPost.addEventListener("click", closePostEditor);

    // --- File Uploader handler with Canvas resizing ---
    const coverFile = document.getElementById("postCoverFile");
    const removeCoverBtn = document.getElementById("btnRemoveCover");
    const previewImg = document.getElementById("editorCoverPreview");

    if (coverFile) {
        coverFile.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const maxW = 800; // max resolution
                    let w = img.width;
                    let h = img.height;
                    
                    if (w > maxW) {
                        h = Math.round((h * maxW) / w);
                        w = maxW;
                    }
                    
                    const canvas = document.createElement("canvas");
                    canvas.width = w;
                    canvas.height = h;
                    
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, w, h);
                    
                    // Compress JPEG
                    tempUploadedCoverBase64 = canvas.toDataURL("image/jpeg", 0.75);
                    
                    if (previewImg) {
                        previewImg.src = tempUploadedCoverBase64;
                        previewImg.style.display = "block";
                    }
                    if (removeCoverBtn) {
                        removeCoverBtn.style.display = "flex";
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    if (removeCoverBtn) {
        removeCoverBtn.addEventListener("click", () => {
            tempUploadedCoverBase64 = "none";
            if (coverFile) coverFile.value = "";
            if (previewImg) {
                previewImg.src = "";
                previewImg.style.display = "none";
            }
            removeCoverBtn.style.display = "none";
        });
    }

    // --- WYSIWYG Editor Toolbar events ---
    document.querySelectorAll(".toolbar-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const cmd = btn.getAttribute("data-command");
            const val = btn.getAttribute("data-value") || null;
            document.execCommand(cmd, false, val);
            
            // Keep focus in contenteditable editor
            const editorContent = document.getElementById("editorContent");
            if (editorContent) editorContent.focus();
        });
    });

    const headingSelect = document.getElementById("editorHeadingSelect");
    if (headingSelect) {
        headingSelect.addEventListener("change", (e) => {
            const val = e.target.value;
            if (val === "p") {
                document.execCommand("formatBlock", false, "p");
            } else {
                document.execCommand("formatBlock", false, val);
            }
            
            // Keep focus in contenteditable editor
            const editorContent = document.getElementById("editorContent");
            if (editorContent) editorContent.focus();
        });
    }

    if (articleForm) articleForm.addEventListener("submit", savePost);

    // --- Menu Form Action ---
    const menuForm = document.getElementById("menuForm");
    if (menuForm) menuForm.addEventListener("submit", saveMenu);

    // --- Admin Login Event Listeners ---
    const adminLoginForm = document.getElementById("adminLoginForm");
    if (adminLoginForm) adminLoginForm.addEventListener("submit", handleAdminLogin);

    const adminLogoutBtn = document.getElementById("adminLogoutBtn");
    if (adminLogoutBtn) adminLogoutBtn.addEventListener("click", handleAdminLogout);

    // --- Confirmation Modal Actions ---
    const btnConfirmCancel = document.getElementById("btnConfirmCancel");
    const btnConfirmProceed = document.getElementById("btnConfirmProceed");
    if (btnConfirmCancel) btnConfirmCancel.addEventListener("click", closeConfirmModal);
    if (btnConfirmProceed) {
        btnConfirmProceed.addEventListener("click", () => {
            if (confirmProceedCallback) {
                confirmProceedCallback();
            }
            closeConfirmModal();
        });
    }
}
