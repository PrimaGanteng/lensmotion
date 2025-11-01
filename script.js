// ===== PAGE CHECK =====
const isGalleryPage = document.getElementById('galleryGrid') !== null;
const isIndexPage = document.getElementById('landing-page') !== null;

// ===== LOADING SCREEN =====
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');

    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hide');
            setTimeout(() => {
                loadingScreen.style.display = "none";
                if (isIndexPage) {
                    const landingPage = document.getElementById('landing-page');
                    if (landingPage) {
                        landingPage.classList.remove("hidden");
                    }
                }
            }, 600);
        }, 1800);
    } else if (isIndexPage) {
        // If no loading screen, show landing page immediately
        const landingPage = document.getElementById('landing-page');
        if (landingPage) {
            landingPage.classList.remove("hidden");
        }
    }
});

// ===== LANDING PAGE BUTTON =====
window.enterGallery = function () {
    window.location.href = "gallery.html";
};

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    const toast = document.getElementById('notificationToast');
    const messageEl = document.getElementById('notificationMessage');
    
    if (toast && messageEl) {
        messageEl.textContent = message;
        toast.className = 'notification-toast show ' + type;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// ===== GALLERY PAGE FUNCTIONALITY =====
if (isGalleryPage) {
    let currentCategory = 'all';
    let currentSort = 'newest';
    let filteredProjects = [...projects];
    let currentModalSlide = 0;
    let currentProject = null;

    // Initialize gallery
    function initGallery() {
        renderGallery();
        setupFilters();
        setupEventListeners();
        showNotification('Gallery loaded successfully! ', 'success');
    }

    // Render gallery
    function renderGallery() {
        const galleryGrid = document.getElementById('galleryGrid');
        if (!galleryGrid) return;

        // Filter by category
        if (currentCategory === 'all') {
            filteredProjects = [...projects];
        } else {
            filteredProjects = projects.filter(p => p.category === currentCategory);
        }

        // Sort projects
        filteredProjects.sort((a, b) => {
            if (currentSort === 'newest') {
                return new Date(b.date) - new Date(a.date);
            } else if (currentSort === 'oldest') {
                return new Date(a.date) - new Date(b.date);
            } else if (currentSort === 'title') {
                return a.title.localeCompare(b.title);
            }
            return 0;
        });

        // Render cards with animation
        galleryGrid.innerHTML = filteredProjects.map((project, index) => `
            <div class="gallery-card ${project.orientation} fade-in-card" 
                 style="animation-delay: ${index * 0.1}s"
                 onclick="openProjectModal(${project.id})"
                 data-testid="gallery-card-${project.id}">
                <img src="${project.thumbnail}" alt="${project.title}" class="card-image" loading="lazy">
                <div class="card-overlay">
                    <h3 class="card-title">${project.title}</h3>
                    <div class="card-meta">
                        <span class="card-category"> ${project.category}</span>
                        <span class="card-date"> ${formatDate(project.date)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Setup filters
    function setupFilters() {
        // Category filters
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = btn.dataset.category;
                renderGallery();
                showNotification(`Menampilkan kategori: ${currentCategory === 'all' ? 'Semua' : currentCategory}`, 'info');
            });
        });

        // Sort filter
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                currentSort = e.target.value;
                renderGallery();
            });
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Close modals on outside click
        document.getElementById('projectModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'projectModal') {
                closeProjectModal();
            }
        });

        document.getElementById('passwordModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'passwordModal') {
                closePasswordModal();
            }
        });

        // Enter key to submit password
        document.getElementById('passwordInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                verifyPassword();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const projectModal = document.getElementById('projectModal');
            const passwordModal = document.getElementById('passwordModal');
            
            if (projectModal?.classList.contains('active')) {
                if (e.key === 'ArrowLeft') {
                    changeModalSlide(-1);
                } else if (e.key === 'ArrowRight') {
                    changeModalSlide(1);
                } else if (e.key === 'Escape') {
                    closeProjectModal();
                }
            }
            
            if (passwordModal?.classList.contains('active') && e.key === 'Escape') {
                closePasswordModal();
            }
        });
    }

    // Format date
    function formatDate(dateString) {
        try {
            const date = new Date(dateString);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString('id-ID', options);
        } catch (error) {
            return dateString;
        }
    }

    // Open project modal
    window.openProjectModal = function(projectId) {
        currentProject = projects.find(p => p.id === projectId);
        if (!currentProject) return;

        currentModalSlide = 0;

        // Update modal content
        const titleElement = document.getElementById('modalProjectTitle');
        const categoryElement = document.getElementById('modalProjectCategory');
        const dateElement = document.getElementById('modalProjectDate');
        const descriptionElement = document.getElementById('modalProjectDescription');

        if (titleElement) titleElement.textContent = currentProject.title;
        if (categoryElement) categoryElement.textContent = ` ${currentProject.category}`;
        if (dateElement) dateElement.textContent = ` ${formatDate(currentProject.date)}`;
        if (descriptionElement) descriptionElement.textContent = currentProject.description;

        // Render slider
        const sliderWrapper = document.getElementById('modalSliderWrapper');
        const indicatorsContainer = document.getElementById('modalSliderIndicators');

        if (sliderWrapper) {
            sliderWrapper.innerHTML = currentProject.images.map((img, index) => `
                <div class="modal-slider-slide">
                    <img src="${img}" 
                         alt="${currentProject.title} - Image ${index + 1}" 
                         class="modal-slider-image" 
                         loading="lazy">
                </div>
            `).join('');
        }

        if (indicatorsContainer) {
            indicatorsContainer.innerHTML = currentProject.images.map((_, index) => `
                <span class="indicator ${index === 0 ? 'active' : ''}" 
                      onclick="goToModalSlide(${index})"
                      data-testid="slider-indicator-${index}"></span>
            `).join('');
        }

        // Show modal with animation
        const projectModal = document.getElementById('projectModal');
        if (projectModal) {
            projectModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    // Close project modal
    window.closeProjectModal = function() {
        const projectModal = document.getElementById('projectModal');
        if (projectModal) {
            projectModal.classList.remove('active');
        }
        document.body.style.overflow = 'auto';
        currentProject = null;
    };

    // Change modal slide
    window.changeModalSlide = function(direction) {
        if (!currentProject) return;

        const slides = document.querySelectorAll('.modal-slider-slide');
        currentModalSlide += direction;

        if (currentModalSlide < 0) {
            currentModalSlide = slides.length - 1;
        } else if (currentModalSlide >= slides.length) {
            currentModalSlide = 0;
        }

        updateModalSlider();
    };

    // Go to specific modal slide
    window.goToModalSlide = function(index) {
        if (!currentProject) return;
        currentModalSlide = index;
        updateModalSlider();
    };

    // Update modal slider
    function updateModalSlider() {
        const sliderWrapper = document.getElementById('modalSliderWrapper');
        const indicators = document.querySelectorAll('#modalSliderIndicators .indicator');

        if (sliderWrapper) {
            sliderWrapper.style.transform = `translateX(-${currentModalSlide * 100}%)`;
        }

        indicators.forEach((indicator, index) => {
            if (index === currentModalSlide) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    // Show password modal
    window.showPasswordModal = function() {
        if (!currentProject) return;

        const modal = document.getElementById('passwordModal');
        const projectTitle = document.getElementById('passwordProjectTitle');

        if (modal && projectTitle) {
            projectTitle.textContent = currentProject.title;
            modal.classList.add('active');
            
            const passwordInput = document.getElementById('passwordInput');
            const passwordError = document.getElementById('passwordError');
            const passwordSuccess = document.getElementById('passwordSuccess');
            const driveLinkContainer = document.getElementById('driveLinkContainer');
            
            if (passwordInput) {
                passwordInput.value = '';
                passwordInput.focus();
            }
            if (passwordError) {
                passwordError.classList.remove('show');
                passwordError.textContent = '';
            }
            if (passwordSuccess) {
                passwordSuccess.classList.remove('show');
                passwordSuccess.textContent = '';
            }
            if (driveLinkContainer) {
                driveLinkContainer.style.display = 'none';
            }
        }
    };

    // Close password modal
    window.closePasswordModal = function() {
        const modal = document.getElementById('passwordModal');
        if (modal) {
            modal.classList.remove('active');
        }
    };

    // Verify password - Server-side dengan Vercel Serverless Function
    window.verifyPassword = async function() {
        if (!currentProject) return;

        const passwordInput = document.getElementById('passwordInput');
        const passwordError = document.getElementById('passwordError');
        const passwordSuccess = document.getElementById('passwordSuccess');
        const driveLinkContainer = document.getElementById('driveLinkContainer');
        const driveLinkButton = document.getElementById('driveLinkButton');
        const enteredPassword = passwordInput.value.trim();

        // Clear previous messages
        if (passwordError) {
            passwordError.classList.remove('show');
            passwordError.textContent = '';
        }
        if (passwordSuccess) {
            passwordSuccess.classList.remove('show');
            passwordSuccess.textContent = '';
        }
        if (driveLinkContainer) {
            driveLinkContainer.style.display = 'none';
        }

        // Validate input
        if (!enteredPassword) {
            if (passwordError) {
                passwordError.textContent = '⚠️ Silakan masukkan password!';
                passwordError.classList.add('show');
            }
            passwordInput.focus();
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '🔄 Memverifikasi...';
        submitBtn.disabled = true;

        try {
            // Call API endpoint
            const response = await fetch('/api/verify-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId: currentProject.id,
                    password: enteredPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                // Success - Show drive link in popup
                if (passwordSuccess) {
                    passwordSuccess.innerHTML = '✅ ' + data.message;
                    passwordSuccess.classList.add('show');
                }
                
                // Show drive link container
                if (driveLinkContainer && driveLinkButton) {
                    driveLinkButton.href = data.driveLink;
                    driveLinkContainer.style.display = 'block';
                }
                
                showNotification('✅ Akses diberikan! Link Google Drive tersedia di popup.', 'success');
                
                // Clear password input
                passwordInput.value = '';
            } else {
                // Wrong password or error
                if (passwordError) {
                    passwordError.innerHTML = '❌ ' + data.error;
                    passwordError.classList.add('show');
                    
                    if (data.remainingAttempts !== undefined) {
                        passwordError.innerHTML += `<br><small>Sisa percobaan: ${data.remainingAttempts}</small>`;
                    }
                }
                showNotification('❌ ' + data.error, 'error');
                passwordInput.value = '';
                passwordInput.focus();
            }
        } catch (error) {
            console.error('Error verifying password:', error);
            if (passwordError) {
                passwordError.innerHTML = '⚠️ Terjadi kesalahan koneksi. Silakan coba lagi.';
                passwordError.classList.add('show');
            }
            showNotification('⚠️ Terjadi kesalahan sistem', 'error');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    };

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGallery);
    } else {
        initGallery();
    }
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== NAVBAR SCROLL EFFECT =====
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const currentScroll = window.pageYOffset;

    if (navbar) {
        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        // Add shadow on scroll
        if (currentScroll > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(212, 175, 55, 0.2)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    }

    lastScroll = currentScroll;
});

// ===== LAZY LOADING IMAGES WITH INTERSECTION OBSERVER =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    // Observe all images
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== PREVENT RIGHT CLICK ON IMAGES (Optional Protection) =====
document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
        showNotification('⚠️ Download melalui tombol Download dengan password', 'warning');
    }
});

// ===== CONSOLE WARNING =====
console.log('%c⚠️ WARNING!', 'color: red; font-size: 40px; font-weight: bold;');
console.log('%cJangan paste kode di sini jika Anda tidak tahu apa yang Anda lakukan!', 'color: yellow; font-size: 16px;');
console.log('%cIni bisa membahayakan akun dan data Anda.', 'color: yellow; font-size: 16px;');