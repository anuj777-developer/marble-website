document.addEventListener('DOMContentLoaded', () => {
    const images = [
        'images/hero_mahalaxmi.jpg',
        'images/hero_vaishnodevi_1783449928150.jpg',
        'images/hero_shrinathji.jpg'
    ];

    const carouselContainer = document.getElementById('bg-carousel');
    const indicatorsContainer = document.getElementById('carousel-indicators');
    let currentIndex = 0;
    const intervalTime = 6000;

    function initCarousel() {
        if (!carouselContainer) return;
        images.forEach((imgSrc, index) => {
            const slide = document.createElement('div');
            slide.classList.add('carousel-slide');
            if (index === 0) slide.classList.add('active');
            slide.style.backgroundImage = `url('${imgSrc}')`;
            carouselContainer.appendChild(slide);

            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => goToSlide(index));
            indicatorsContainer.appendChild(indicator);
        });
    }

    function goToSlide(index) {
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator');

        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(ind => ind.classList.remove('active'));

        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        
        currentIndex = index;
    }

    function nextSlide() {
        let nextIndex = (currentIndex + 1) % images.length;
        goToSlide(nextIndex);
    }

    initCarousel();
    if (carouselContainer) {
        setInterval(nextSlide, intervalTime);
    }

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Stat Counter & Background Fill Animation (Unified Observer)
    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const section = entry.target;
                if (entry.isIntersecting) {
                    section.classList.add('filled');
                    if (!section.dataset.counting) {
                        section.dataset.counting = "true";
                        const counters = section.querySelectorAll('.counter');
                        counters.forEach(counter => {
                            counter.innerText = '0';
                            const target = +counter.getAttribute('data-target');
                            const inc = target / 100;
                            const updateCount = () => {
                                const count = +counter.innerText.replace(/,/g, '');
                                if (count < target) {
                                    counter.innerText = Math.ceil(count + inc).toLocaleString();
                                    setTimeout(updateCount, 20);
                                } else {
                                    counter.innerText = target.toLocaleString();
                                    if (counter.hasAttribute('data-suffix')) {
                                        counter.innerText += counter.getAttribute('data-suffix');
                                    }
                                }
                            };
                            updateCount();
                        });
                    }
                } else {
                    section.classList.remove('filled');
                    section.dataset.counting = "";
                    section.querySelectorAll('.counter').forEach(c => c.innerText = '0');
                }
            });
        }, { threshold: 0.2 });
        statsObserver.observe(statsSection);
    }

    // Vertical Counters with Re-triggering and Progress Bars
    const vCounters = document.querySelectorAll('.v-counter');
    if (vCounters.length > 0) {
        const vCounterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const counter = entry.target;
                const progressBar = counter.parentElement.querySelector('.progress-fill');
                
                if (entry.isIntersecting) {
                    counter.innerText = '0';
                    if (progressBar) progressBar.style.width = '0%';
                    
                    const target = +counter.getAttribute('data-target');
                    const updateCount = () => {
                        const countText = counter.innerText.replace(/,/g, '').replace(/%|\+/g, '');
                        const count = +countText;
                        const inc = target / 40;
                        
                        if (count < target) {
                            const newCount = Math.ceil(count + inc);
                            counter.innerText = newCount.toLocaleString();
                            if (progressBar) progressBar.style.width = Math.min((newCount / target) * 100, 100) + '%';
                            
                            setTimeout(updateCount, 25);
                        } else {
                            counter.innerText = target.toLocaleString();
                            if (counter.hasAttribute('data-suffix')) {
                                counter.innerText += counter.getAttribute('data-suffix');
                            }
                            if (progressBar) progressBar.style.width = '100%';
                        }
                    };
                    updateCount();
                } else {
                    counter.innerText = '0';
                    if (progressBar) progressBar.style.width = '0%';
                }
            });
        }, { threshold: 0.1 });
        vCounters.forEach(counter => vCounterObserver.observe(counter));
    }

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            // Change icon
            const icon = menuToggle.querySelector('i');
            if (icon.classList.contains('ri-menu-3-line')) {
                icon.classList.replace('ri-menu-3-line', 'ri-close-line');
            } else {
                icon.classList.replace('ri-close-line', 'ri-menu-3-line');
            }
        });
    }

    // Image Modal Logic (Global)
    let imageModal = document.getElementById('imageModal');
    if (!imageModal) {
        imageModal = document.createElement('div');
        imageModal.id = 'imageModal';
        imageModal.className = 'modal';
        imageModal.innerHTML = `
            <span class="close-modal" id="closeModal">&times;</span>
            <img class="modal-content" id="modalImage">
        `;
        document.body.appendChild(imageModal);
    }

    const modalImage = document.getElementById('modalImage');
    const closeModal = document.getElementById('closeModal');
    const ownerImgs = document.querySelectorAll('.owner-img');

    if (ownerImgs.length > 0 && imageModal && modalImage && closeModal) {
        ownerImgs.forEach(img => {
            img.addEventListener('click', (e) => {
                e.preventDefault();
                imageModal.style.display = 'block';
                modalImage.src = img.src;
            });
        });

        const closeImageModal = () => {
            imageModal.style.display = 'none';
        };

        closeModal.addEventListener('click', closeImageModal);
        
        // Close modal when clicking on the dark background
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                closeImageModal();
            }
        });
    }

    // ==========================================
    // Dynamic Data Fetching (Products & Collections)
    // ==========================================
    
    // ** IMPORTANT: THIS URL MUST BE REPLACED WITH THE ACTUAL GOOGLE APPS SCRIPT WEB APP URL **
    const GOOGLE_APP_SCRIPT_URL = 'YOUR_GOOGLE_WEB_APP_URL_HERE';
    
    const productsGrid = document.getElementById('dynamic-products-grid');
    const collectionsGrid = document.getElementById('dynamic-collections-grid');

    if ((productsGrid || collectionsGrid) && GOOGLE_APP_SCRIPT_URL !== 'YOUR_GOOGLE_WEB_APP_URL_HERE') {
        fetch(GOOGLE_APP_SCRIPT_URL)
            .then(res => res.json())
            .then(data => {
                // Populate Products
                if (productsGrid && data.products) {
                    if (data.products.length === 0) {
                        productsGrid.innerHTML = '<div style="width: 100%; text-align: center; padding: 40px; grid-column: 1 / -1;"><p style="color: var(--text-muted); font-size: 18px;">No products found.</p></div>';
                    } else {
                        productsGrid.innerHTML = ''; // clear loading
                        data.products.forEach(prod => {
                            const card = document.createElement('div');
                            card.className = 'featured-card'; // reusing existing css class
                            card.innerHTML = `
                                <div class="featured-img">
                                    <span class="material-tag">${prod.category}</span>
                                    <img src="${prod.imageUrl}" alt="${prod.title}" class="fit-cover">
                                </div>
                                <div class="featured-info" style="text-align: left; padding: 20px;">
                                    <h3 style="margin-bottom: 5px; font-size: 18px;">${prod.title}</h3>
                                    <p style="color: var(--primary-color); font-weight: 600; margin-bottom: 10px;">â‚¹${prod.price}/sq.ft</p>
                                    <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 15px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${prod.description}</p>
                                    <a href="#" class="btn btn-secondary btn-sm" style="width: 100%; text-align: center;">View Details</a>
                                </div>
                            `;
                            productsGrid.appendChild(card);
                        });
                    }
                }

                // Populate Collections
                if (collectionsGrid && data.collections) {
                    if (data.collections.length === 0) {
                        collectionsGrid.innerHTML = '<div style="width: 100%; text-align: center; padding: 40px; grid-column: 1 / -1;"><p style="color: var(--text-muted); font-size: 18px;">No collections found.</p></div>';
                    } else {
                        collectionsGrid.innerHTML = ''; // clear loading
                        data.collections.forEach(col => {
                            const card = document.createElement('div');
                            card.className = 'collection-card';
                            card.innerHTML = `
                                <div class="collection-img">
                                    <img src="${col.imageUrl}" alt="${col.title}" class="fit-cover">
                                </div>
                                <div class="collection-info">
                                    <h3>${col.title}</h3>
                                    <p>${col.description}</p>
                                    <span style="display:inline-block; margin-top:15px; font-size: 12px; color: var(--primary-color); text-transform: uppercase; letter-spacing: 1px;">${col.category}</span>
                                </div>
                            `;
                            collectionsGrid.appendChild(card);
                        });
                    }
                }
            })
            .catch(err => {
                console.error("Error fetching dynamic data:", err);
                if (productsGrid) productsGrid.innerHTML = '<div style="width: 100%; text-align: center; padding: 40px;"><p style="color: #ff4444;">Error loading products.</p></div>';
                if (collectionsGrid) collectionsGrid.innerHTML = '<div style="width: 100%; text-align: center; padding: 40px;"><p style="color: #ff4444;">Error loading collections.</p></div>';
            });
    }

});

    // (Removed statItemObserver)

    // --- Luxury Scroll Reveal ---
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-top, .reveal-bottom, .reveal-center');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Optional: Unobserve after revealing to prevent re-triggering
                    // revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        
        revealElements.forEach(el => revealObserver.observe(el));
    }

