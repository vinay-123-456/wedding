/* 
   Devesh Events - Main Interactive Logic
   Handles Mobile Navigation, Active Navigation Highlighting, Gallery Filters,
   Interactive Budget Calculator, Testimonials Carousel, Scroll Animations, & Form Submissions.
*/

document.addEventListener('DOMContentLoaded', () => {

    // Initialize Scroll Intersection Observer for fade-in animations
    const scrollObserverOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target); // Trigger once
            }
        });
    }, scrollObserverOptions);

    /* ==========================================
       1. MOBILE MENU DRAWER
       ========================================== */
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

    hamburgerMenu.addEventListener('click', () => {
        hamburgerMenu.classList.toggle('active');
        mobileMenuDrawer.classList.toggle('active');
        
        // Prevent body scrolling when menu is open
        if (mobileMenuDrawer.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    mobileNavItems.forEach(item => {
        item.addEventListener('click', () => {
            hamburgerMenu.classList.remove('active');
            mobileMenuDrawer.classList.remove('active');
            document.body.style.overflow = '';
        });
    });


    /* ==========================================
       2. NAVBAR SCROLL EFFECT & SCROLL SPY
       ========================================== */
    const navbar = document.getElementById('main-navbar');
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('header, section');

    window.addEventListener('scroll', () => {
        // Sticky scroll background
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Scroll Spy active navigation indicator
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120; // offset navbar height
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${currentSectionId}`) {
                item.classList.add('active');
            }
        });
    });


    /* ==========================================
       3. DYNAMIC PORTFOLIO RENDERING & FILTERING
       ========================================== */
    const portfolioGrid = document.getElementById('portfolio-gallery-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Fetch portfolio items from JSON file
    fetch('portfolio.json')
        .then(response => response.json())
        .then(data => {
            renderPortfolio(data);
            initPortfolioFilters();
        })
        .catch(err => console.error('Error fetching portfolio:', err));

    function renderPortfolio(items) {
        if (!portfolioGrid) return;
        portfolioGrid.innerHTML = ''; // Clear loading placeholder
        
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'portfolio-item fade-in';
            itemElement.setAttribute('data-category', item.category);
            itemElement.id = `portfolio-item-${item.id}`;
            
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.alt || item.title}">
                <div class="portfolio-overlay">
                    <span class="portfolio-category">${item.category}</span>
                    <h3 class="portfolio-title">${item.title}</h3>
                    <p class="portfolio-details">${item.details}</p>
                </div>
            `;
            
            portfolioGrid.appendChild(itemElement);
            
            // Observe item for lazy fade-in animation
            scrollObserver.observe(itemElement);
        });
    }

    function initPortfolioFilters() {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from buttons
                filterButtons.forEach(button => button.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');
                const portfolioItems = document.querySelectorAll('.portfolio-item');

                portfolioItems.forEach(item => {
                    const itemCategory = item.getAttribute('data-category');
                    if (filterValue === 'all' || itemCategory === filterValue) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }


    /* ==========================================
       4. INTERACTIVE EVENT BUDGET ESTIMATOR
       ========================================== */
    // Input elements
    const eventRadios = document.querySelectorAll('input[name="event-type"]');
    const radioLabels = document.querySelectorAll('.event-type-grid .radio-card');
    const guestSlider = document.getElementById('guest-slider');
    const guestOutput = document.getElementById('guest-count-output');
    
    // Add-on checkboxes
    const addonDecor = document.getElementById('addon-decor');
    const addonCatering = document.getElementById('addon-catering');
    const addonAV = document.getElementById('addon-av');
    const addonArtists = document.getElementById('addon-artists');
    const addonMedia = document.getElementById('addon-media');
    const addonPlanning = document.getElementById('addon-planning');
    
    const checkboxes = [addonDecor, addonCatering, addonAV, addonArtists, addonMedia, addonPlanning];

    // Output elements
    const displayTotal = document.getElementById('calc-total-display');
    const displayBreakdownTotal = document.getElementById('calc-breakdown-total');
    const displayBase = document.getElementById('calc-base-display');
    const displayGuestCost = document.getElementById('calc-guest-display');
    const displayFlatCost = document.getElementById('calc-flat-display');

    // Calculator constants
    const pricing = {
        wedding: { base: 15000, guestBase: 30 },
        corporate: { base: 20000, guestBase: 45 },
        live: { base: 25000, guestBase: 15 }
    };

    const flatRates = {
        av: 12000,
        artists: 18000,
        media: 6000,
        planning: 4000
    };

    function updateEstimates() {
        // Find selected event type
        let selectedType = 'wedding';
        eventRadios.forEach(radio => {
            if (radio.checked) {
                selectedType = radio.value;
            }
        });

        // Toggle selected styling class for radio cards
        radioLabels.forEach(label => {
            const radioInput = label.querySelector('input');
            if (radioInput.checked) {
                label.classList.add('selected');
            } else {
                label.classList.remove('selected');
            }
        });

        const guests = parseInt(guestSlider.value, 10);
        guestOutput.textContent = guests.toLocaleString();

        // Update slider track gradient fill
        const min = guestSlider.min || 50;
        const max = guestSlider.max || 2000;
        const percentage = ((guests - min) / (max - min)) * 100;
        guestSlider.style.background = `linear-gradient(to right, var(--gold) ${percentage}%, var(--bg-primary) ${percentage}%)`;

        // Base fee
        const baseFee = pricing[selectedType].base;

        // Guest Cost variables
        let perGuestCharge = pricing[selectedType].guestBase;
        
        // Add-on calculations
        let flatCost = 0;

        // Check decor addon (affects guests)
        if (addonDecor.checked) {
            perGuestCharge += 50;
            addonDecor.parentElement.classList.add('checked');
        } else {
            addonDecor.parentElement.classList.remove('checked');
        }

        // Check catering addon (affects guests)
        if (addonCatering.checked) {
            perGuestCharge += 90;
            addonCatering.parentElement.classList.add('checked');
        } else {
            addonCatering.parentElement.classList.remove('checked');
        }

        // Other flat addons
        if (addonAV.checked) {
            flatCost += flatRates.av;
            addonAV.parentElement.classList.add('checked');
        } else {
            addonAV.parentElement.classList.remove('checked');
        }

        if (addonArtists.checked) {
            flatCost += flatRates.artists;
            addonArtists.parentElement.classList.add('checked');
        } else {
            addonArtists.parentElement.classList.remove('checked');
        }

        if (addonMedia.checked) {
            flatCost += flatRates.media;
            addonMedia.parentElement.classList.add('checked');
        } else {
            addonMedia.parentElement.classList.remove('checked');
        }

        if (addonPlanning.checked) {
            flatCost += flatRates.planning;
            addonPlanning.parentElement.classList.add('checked');
        } else {
            addonPlanning.parentElement.classList.remove('checked');
        }

        const guestCostTotal = guests * perGuestCharge;
        const finalTotal = baseFee + guestCostTotal + flatCost;

        // Format and render results
        displayBase.textContent = `$${baseFee.toLocaleString()}`;
        displayGuestCost.textContent = `$${guestCostTotal.toLocaleString()}`;
        displayFlatCost.textContent = `$${flatCost.toLocaleString()}`;
        
        const formattedTotal = `$${finalTotal.toLocaleString()}`;
        displayTotal.textContent = formattedTotal;
        displayBreakdownTotal.textContent = formattedTotal;
    }

    // Attach Event Listeners
    eventRadios.forEach(radio => radio.addEventListener('change', updateEstimates));
    guestSlider.addEventListener('input', updateEstimates);
    checkboxes.forEach(chk => chk.addEventListener('change', updateEstimates));

    // Initialize Calculator
    updateEstimates();


    /* ==========================================
       5. CLIENT TESTIMONIALS SLIDER
       ========================================== */
    const slides = document.querySelectorAll('.testimonial-slide');
    const prevBtn = document.getElementById('testimonial-prev-btn');
    const nextBtn = document.getElementById('testimonial-next-btn');
    let currentSlide = 0;
    let autoSlideInterval;

    function showSlide(index) {
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoSlide();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoSlide();
    });

    // Auto rotate slides
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 7000);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    startAutoSlide();


    /* ==========================================
       6. SCROLL INTERSECTION OBSERVER (Fade-In Effect)
       ========================================== */
    // Observe existing static elements in the DOM
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(element => {
        scrollObserver.observe(element);
    });


    /* ==========================================
       7. CONTACT & NEWSLETTER FORMS SUBMISSION
       ========================================== */
    const bookingForm = document.getElementById('booking-contact-form');
    const newsletterForm = document.getElementById('footer-newsletter-form');

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameVal = document.getElementById('contact-name').value;
        const emailVal = document.getElementById('contact-email').value;
        const categoryVal = document.getElementById('contact-category').options[document.getElementById('contact-category').selectedIndex].text;
        const dateVal = document.getElementById('contact-date').value;

        // Custom High-End notification dialog
        const modalHtml = `
            <div id="booking-success-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(9,9,11,0.95); z-index: 9999; display: flex; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.5s ease;">
                <div class="glass-panel" style="padding: 4rem; max-width: 550px; text-align: center; border: 1px solid var(--gold); border-radius: 0; box-shadow: var(--shadow-gold);">
                    <i class="fa-solid fa-circle-check" style="font-size: 4rem; color: var(--gold); margin-bottom: 2rem;"></i>
                    <h3 style="font-size: 2.2rem; margin-bottom: 1rem;">Submission Received</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 2rem; font-size: 0.95rem; line-height: 1.6;">
                        Thank you, <strong>${nameVal}</strong>. A dedicated senior producer has been assigned to your request for a <strong>${categoryVal}</strong> on <strong>${dateVal}</strong>. We will review your vision and contact you at <strong>${emailVal}</strong> within 24 hours.
                    </p>
                    <button id="close-success-modal" class="btn btn-primary">Return to Gallery</button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const successOverlay = document.getElementById('booking-success-overlay');
        setTimeout(() => {
            successOverlay.style.opacity = '1';
        }, 50);

        document.getElementById('close-success-modal').addEventListener('click', () => {
            successOverlay.style.opacity = '0';
            setTimeout(() => {
                successOverlay.remove();
                bookingForm.reset();
                // recalculate defaults
                updateEstimates();
            }, 500);
        });
    });

    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailVal = document.getElementById('newsletter-email').value;
        
        const btn = newsletterForm.querySelector('button');
        const originalText = btn.textContent;
        
        btn.textContent = 'Joined';
        btn.style.background = 'transparent';
        btn.style.border = '1px solid var(--gold)';
        btn.style.color = 'var(--gold)';
        
        const input = document.getElementById('newsletter-email');
        input.value = '';
        input.placeholder = 'Inspiration Awaits';
        input.disabled = true;

        // Reset state after a few seconds
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.border = '';
            btn.style.color = '';
            input.disabled = false;
            input.placeholder = 'Email address';
        }, 5000);
    });

});
