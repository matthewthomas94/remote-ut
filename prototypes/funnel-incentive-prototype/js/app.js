/**
 * Funnel Incentive Prototype App Logic
 */

const App = {
    state: {
        currentScreen: 'roleSelection',
        role: null,
        paymentMethods: []
    },

    init() {
        console.log('App initialized');
        this.render();
    },

    setRole(roleId) {
        this.state.role = roleId;

        const mainCard = document.querySelector('.main-card');
        const optionsList = document.querySelector('.options-list');
        const oldProgressBar = document.querySelector('.progress-fill');
        let startProgressWidth = '0%';
        if (oldProgressBar) {
            startProgressWidth = oldProgressBar.style.width || getComputedStyle(oldProgressBar).width;
        }

        // 1. Lock Height & Exit Phase
        if (mainCard) {
            // Lock height to current computed size immediately
            const startHeight = mainCard.getBoundingClientRect().height;
            mainCard.style.height = `${startHeight}px`;
            mainCard.style.minHeight = '0'; // Override CSS min-height if present
            mainCard.style.overflow = 'hidden'; // Prevent content spill during shrink
            mainCard.style.transition = 'min-height 0.5s ease, height 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)';
        }

        if (optionsList) {
            optionsList.classList.add('fade-out');
        }

        // 2. Loading/Skeleton Phase (after 250ms)
        setTimeout(() => {
            // Apply skeleton styles (visual only, height is locked)
            const title = document.querySelector('.section-title');
            const subtitle = document.querySelector('.section-subtitle');

            if (title) title.classList.add('skeleton-text');
            if (subtitle) subtitle.classList.add('skeleton-text');

            if (optionsList) optionsList.innerHTML = ''; // Content clears, but container height is locked

            // 3. Enter Phase: Render New Content (after 500ms total)
            setTimeout(() => {
                // Render Step 2 (DOM updates, but height is still locked at Step 1 size)
                this.state.currentScreen = 'paymentMethodSelection';
                this.render();

                const newCard = document.querySelector('.main-card');
                const newOptions = document.querySelector('.options-list');
                const footer = document.querySelector('.sticky-footer');
                const newProgressBar = document.querySelector('.progress-fill');
                const newTitle = document.querySelector('.section-title');
                const newSubtitle = document.querySelector('.section-subtitle');

                // A. Apply Skeleton to NEW Header Elements (to bridge transition)
                if (newTitle) newTitle.classList.add('skeleton-text');
                if (newSubtitle) newSubtitle.classList.add('skeleton-text');

                // B. Animate CARD HEIGHT (FLIP)
                if (newCard) {
                    // Temporarily unset height to measure natural target size
                    // We must do this carefully to avoid a flash. 
                    // Strategy: Clone or use scrollHeight.
                    // Since specific overflow:hidden is on, scrollHeight gives us content height.
                    const targetHeight = newCard.scrollHeight;

                    // Now animate from locked Start Height -> Target Height
                    // Force reflow to ensure the previous locked height is the "start" frame
                    newCard.offsetHeight;

                    newCard.style.height = `${targetHeight}px`;

                    // Cleanup after animation finishes (500ms)
                    setTimeout(() => {
                        newCard.style.height = 'auto';
                        newCard.style.overflow = 'visible';
                        newCard.style.transition = ''; // clear inline transition
                    }, 500);
                }

                // C. Animate PROGRESS BAR
                if (newProgressBar) {
                    // Force start at old width
                    newProgressBar.style.transition = 'none';
                    newProgressBar.style.width = startProgressWidth;
                    newProgressBar.offsetHeight; // Force reflow

                    // Animate to new width
                    newProgressBar.style.transition = 'width 0.5s ease-in-out';
                    newProgressBar.style.width = '50%'; // Target for Step 2
                }

                // D. Reveal Content & Remove Skeletons
                // Animate Content Entrance
                if (newOptions) {
                    newOptions.classList.add('fade-in');
                }
                if (footer) {
                    footer.classList.add('slide-up');
                }

                // Remove skeleton text after animation to reveal new headers
                setTimeout(() => {
                    if (newTitle) newTitle.classList.remove('skeleton-text');
                    if (newSubtitle) newSubtitle.classList.remove('skeleton-text');
                }, 500);

            }, 250);

        }, 250);
    },

    togglePaymentMethod(methodId) {
        const methods = this.state.paymentMethods;
        if (methods.includes(methodId)) {
            this.state.paymentMethods = methods.filter(id => id !== methodId);
        } else {
            this.state.paymentMethods = [...methods, methodId];
        }
        this.render();
    },

    getIcon(id) {
        const icons = {
            business: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 6H16V4C16 2.89 15.11 2 14 2H10C8.89 2 8 2.89 8 4V6H4C2.89 6 2.01 6.89 2.01 8L2 19C2 20.11 2.89 21 4 21H20C21.11 21 22 20.11 22 19V8C22 6.89 21.11 6 20 6ZM14 6H10V4H14V6Z" fill="#003C80"/></svg>',
            executive: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 16 18" fill="none"><path d="M8 0C10.21 0 12 1.79 12 4C12 6.21 10.21 8 8 8C5.79 8 4 6.21 4 4C4 1.79 5.79 0 8 0ZM12 10.54C12 11.6 11.72 14.07 9.81 16.83L9 12L9.29985 11.4003C9.61066 10.7787 9.20776 10.0345 8.51321 10.0094C8.34358 10.0033 8.17245 10 8 10C7.82755 10 7.65642 10.0033 7.48679 10.0094C6.79224 10.0345 6.38934 10.7787 6.70015 11.4003L7 12L6.19 16.83C4.28 14.07 4 11.6 4 10.54C1.61 11.24 0 12.5 0 14V17C0 17.5523 0.447715 18 1 18H15C15.5523 18 16 17.5523 16 17V14C16 12.5 14.4 11.24 12 10.54Z" fill="#003C80"/></svg>',
            accountant: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="14" viewBox="0 0 20 14" fill="none"><path d="M19.3833 3.33333V11.6667C19.3833 12.5833 18.5903 13.3333 17.6211 13.3333H3.52423C3.03965 13.3333 2.64317 12.9583 2.64317 12.5C2.64317 12.0417 3.03965 11.6667 3.52423 11.6667H17.6211V3.33333C17.6211 2.875 18.0176 2.5 18.5022 2.5C18.9868 2.5 19.3833 2.875 19.3833 3.33333ZM2.64317 10C1.18062 10 0 8.88333 0 7.5V2.5C0 1.11667 1.18062 0 2.64317 0H13.2159C14.6784 0 15.859 1.11667 15.859 2.5V8.33333C15.859 9.25 15.0661 10 14.0969 10H2.64317ZM5.28634 5C5.28634 6.38333 6.46696 7.5 7.92952 7.5C9.39207 7.5 10.5727 6.38333 10.5727 5C10.5727 3.61667 9.39207 2.5 7.92952 2.5C6.46696 2.5 5.28634 3.61667 5.28634 5Z" fill="#003C80"/></svg>',
            bookkeeper: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22" fill="none"><path d="M0 22V18H20V22H0ZM4 14H5.4L13.2 6.225L12.475 5.5L11.775 4.8L4 12.6V14ZM2 16V11.75L13.2 0.575C13.3833 0.391667 13.5958 0.25 13.8375 0.15C14.0792 0.05 14.3333 0 14.6 0C14.8667 0 15.125 0.05 15.375 0.15C15.625 0.25 15.85 0.4 16.05 0.6L17.425 2C17.625 2.18333 17.7708 2.4 17.8625 2.65C17.9542 2.9 18 3.15833 18 3.425C18 3.675 17.9542 3.92083 17.8625 4.1625C17.7708 4.40417 17.625 4.625 17.425 4.825L6.25 16H2ZM13.2 6.225L12.475 5.5L11.775 4.8L13.2 6.225Z" fill="#003C80"/></svg>',
            employee: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="14" viewBox="0 0 22 14" fill="none"><path d="M15 6C16.66 6 17.99 4.66 17.99 3C17.99 1.34 16.66 0 15 0C13.34 0 12 1.34 12 3C12 4.66 13.34 6 15 6ZM7 6C8.66 6 9.99 4.66 9.99 3C9.99 1.34 8.66 0 7 0C5.34 0 4 1.34 4 3C4 4.66 5.34 6 7 6ZM7 8C4.67 8 0 9.17 0 11.5V13C0 13.55 0.45 14 1 14H13C13.55 14 14 13.55 14 13V11.5C14 9.17 9.33 8 7 8ZM15 8C14.71 8 14.38 8.02 14.03 8.05C14.05 8.06 14.06 8.08 14.07 8.09C15.21 8.92 16 10.03 16 11.5V13C16 13.35 15.93 13.69 15.82 14H21C21.55 14 22 13.55 22 13V11.5C22 9.17 17.33 8 15 8Z" fill="#003C80"/></svg>',
            rewards: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="17" viewBox="0 0 18 17" fill="none"><path d="M8.55696 13.6975L12.707 16.2075C13.467 16.6675 14.397 15.9875 14.197 15.1275L13.097 10.4075L16.767 7.2275C17.437 6.6475 17.077 5.5475 16.197 5.4775L11.367 5.0675L9.47696 0.6075C9.13696 -0.2025 7.97696 -0.2025 7.63696 0.6075L5.74696 5.0575L0.916957 5.4675C0.0369575 5.5375 -0.323043 6.6375 0.346957 7.2175L4.01696 10.3975L2.91696 15.1175C2.71696 15.9775 3.64696 16.6575 4.40696 16.1975L8.55696 13.6975Z" fill="#003C80"/></svg>',
            // Placeholders for Step 2
            amex: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#016FD0"/><path d="M4 14L6 8H8L10 14H8.5L8 12.5H6L5.5 14H4ZM6.3 11.5H7.7L7 9.2L6.3 11.5ZM11 14V8H13.5L14.5 11L15.5 8H18V14H16.5V9.5L15 14H14L12.5 9.5V14H11Z" fill="white"/></svg>',
            bank: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 10V17H20V10M2 22H22V19H2V22M12 2L2 7V9H22V7L12 2M6.5 15.5H8.5V11.5H6.5V15.5M10.5 15.5H12.5V11.5H10.5V15.5M14.5 15.5H16.5V11.5H14.5V15.5Z" fill="#003C80"/></svg>',
            visa: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#1A1F70"/><path d="M10 16L12 8H10L8 16H10ZM16.5 8.2C16.2 8.1 15.5 8 15 8C13 8 11.8 9 11.8 10.8C11.8 12.2 13 13 13.8 13.4C14.5 13.8 14.8 14 14.8 14.5C14.8 15.2 14 15.5 13.2 15.5C12.5 15.5 11.8 15.3 11.2 15L11 16.2C11.5 16.4 12.5 16.6 13.5 16.6C15.8 16.6 17 15.5 17 13.8C17 11.8 14.2 11.5 14.2 10.2C14.2 9.8 14.6 9.4 15.5 9.4C16 9.4 16.5 9.5 16.8 9.6L16.5 8.2ZM7 16H8.8L10 8H8.2L7 16ZM5 8H3L3 16H5L7 8Z" fill="white"/></svg>',
            mastercard: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="12" r="7" fill="#EB001B"/><circle cx="16" cy="12" r="7" fill="#F79E1B" fill-opacity="0.8"/></svg>',
            other: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="#003C80"/></svg>',
            plus: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M13 5H11V11H5V13H11V19H13V13H19V11H13V5Z" fill="#003C80"/></svg>'
        };
        return icons[id] || icons.rewards;
    },

    getChevron() {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M7 5.88L13.1808 12L7 18.12L8.90283 20L17 12L8.90283 4L7 5.88Z" fill="#003C80"/>
        </svg>`;
    },

    getCheckmark() {
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="#003C80"/></svg>`;
    },

    render() {
        const viewPort = document.getElementById('view-port');

        if (this.state.currentScreen === 'roleSelection') {
            this.renderRoleSelection(viewPort);
        } else if (this.state.currentScreen === 'paymentMethodSelection') {
            this.renderPaymentMethodSelection(viewPort);
        }
    },

    renderRoleSelection(container) {
        const roles = [
            { id: 'business', label: 'Business owner' },
            { id: 'executive', label: 'Executive / Manager' },
            { id: 'accountant', label: 'Accountant' },
            { id: 'bookkeeper', label: 'Bookkeeper' },
            { id: 'employee', label: 'Employee' },
            { id: 'rewards', label: 'Rewards / Other' }
        ];

        const listHtml = roles.map(role => {
            const isSelected = this.state.role === role.id;
            const rightIcon = isSelected ? this.getCheckmark() : this.getChevron();

            return `
            <button class="option-btn ${isSelected ? 'selected' : ''}" onclick="App.setRole('${role.id}')">
                <div class="option-content">
                    <span class="option-icon">${this.getIcon(role.id)}</span>
                    <span class="option-text">${role.label}</span>
                </div>
                <div class="option-arrow">
                    <span style="display:flex; justify-content:center; align-items:center;">${rightIcon}</span>
                </div>
            </button>
            `;
        }).join('');

        container.innerHTML = `
            <!-- Header -->
            <div class="app-header">
                <div class="logo-container">
                    <svg xmlns="http://www.w3.org/2000/svg" width="164" height="32" viewBox="0 0 164 32" fill="none" fill-rule="evenodd">
                      <path d="M143.827 8.50344C147.786 8.50344 149.527 10.515 149.527 13.9093V21.186H146.023V19.8296C145.138 20.7881 143.924 21.4191 142.158 21.4191C139.75 21.4191 137.771 20.0627 137.771 17.5829V17.5345C137.771 14.7975 139.893 13.5334 142.925 13.5334C143.993 13.5226 145.055 13.6975 146.061 14.05V13.8302C146.061 12.355 145.131 11.5372 143.319 11.5372H139.678V8.45947L143.827 8.50344ZM146.093 16.1319C145.365 15.8167 144.578 15.6636 143.783 15.6636C142.23 15.6636 141.276 16.2704 141.276 17.3938V17.4422C141.276 18.4007 142.087 18.9613 143.256 18.9613C144.948 18.9613 146.093 18.0489 146.093 16.7628V16.1319Z" fill="#414141"/>
                      <path d="M45.0671 21.4193C43.1358 21.4193 41.9438 20.5532 41.0857 19.5463V24.928H37.4629V8.64441H41.0768V10.4449C41.9595 9.27535 43.1739 8.41138 45.0581 8.41138C48.0402 8.41138 50.8833 10.7021 50.8833 14.8923V14.9384C50.8878 19.1264 48.0962 21.4193 45.0671 21.4193ZM47.2627 14.8923C47.2627 12.8104 45.8333 11.4298 44.1261 11.4298C42.4188 11.4298 41.0275 12.8104 41.0275 14.8923V14.9384C41.0275 17.0203 42.4345 18.4009 44.1261 18.4009C45.8176 18.4009 47.2627 14.9384 47.2627 14.9384V14.8923Z" fill="#414141"/>
                      <path d="M58.1361 8.50344C62.095 8.50344 63.8359 10.515 63.8359 13.9093V21.186H60.3318V19.8296C59.4468 20.7881 58.2324 21.4191 56.4669 21.4191C54.0584 21.4191 52.0801 20.0627 52.0801 17.5829V17.5345C52.0801 14.7975 54.2018 13.5334 57.2332 13.5334C58.3016 13.5226 59.3636 13.6975 60.3698 14.05V13.8302C60.3698 12.355 59.44 11.5372 57.6275 11.5372H53.9867V8.45947L58.1361 8.50344ZM60.4012 16.1319C59.6738 15.8167 58.8864 15.6571 58.0913 15.6636C56.5386 15.6636 55.5842 16.2704 55.5842 17.3938V17.4422C55.5842 18.4007 56.3952 18.9613 57.5648 18.9613C59.2563 18.9613 60.4012 18.0489 60.4012 16.7628V16.1319Z" fill="#414141"/>
                      <path d="M68.8237 25.0004H65.1694L65.6377 22.0436H68.3688C68.9894 22.0436 69.3255 21.8589 69.6347 21.2258L64.625 8.6377H68.4652L71.3778 17.1785L74.1694 8.6377H77.9379L73.0245 21.483C72.0477 24.0331 70.9969 25.0004 68.8281 25.0004" fill="#414141"/>
                      <path d="M79.1414 21.3553C78.8182 21.3519 78.5033 21.2547 78.2364 21.076C77.9694 20.8973 77.7623 20.6451 77.6411 20.3512C77.5199 20.0573 77.49 19.7347 77.5552 19.4241C77.6204 19.1136 77.7778 18.8289 78.0075 18.6059C78.2372 18.3829 78.5291 18.2316 78.8463 18.171C79.1635 18.1104 79.4919 18.1432 79.7901 18.2653C80.0883 18.3875 80.3431 18.5934 80.5222 18.8573C80.7014 19.1212 80.797 19.4312 80.7971 19.7483C80.7929 20.1763 80.6166 20.5854 80.3065 20.8864C79.9963 21.1874 79.5776 21.3559 79.1414 21.3553Z" fill="#3866AF"/>
                      <path d="M134.391 21.3553C134.068 21.3514 133.753 21.2538 133.487 21.0749C133.22 20.896 133.013 20.6436 132.892 20.3497C132.772 20.0557 132.742 19.7332 132.807 19.4228C132.873 19.1124 133.03 18.8279 133.26 18.6051C133.49 18.3823 133.782 18.2312 134.099 18.1708C134.416 18.1104 134.744 18.1434 135.043 18.2656C135.341 18.3877 135.595 18.5937 135.774 18.8575C135.953 19.1214 136.049 19.4313 136.049 19.7483C136.045 20.1767 135.868 20.586 135.558 20.8871C135.247 21.1882 134.828 21.3565 134.391 21.3553V21.3553Z" fill="#3866AF"/>
                      <path d="M88.997 21.4655C85.1568 21.4655 82.3428 18.5658 82.3428 14.9846V14.9384C82.3428 11.3572 85.1344 8.41138 89.0463 8.41138C91.4525 8.41138 92.9559 9.205 94.1478 10.5153L91.9387 12.8566C91.1277 12.0124 90.3166 11.476 89.0261 11.476C87.2136 11.476 85.9253 13.0434 85.9253 14.8923V14.9384C85.9253 16.8577 87.1912 18.4009 89.1695 18.4009C90.3861 18.4009 91.2195 17.8865 92.1023 17.0665L94.224 19.1748C92.9783 20.507 91.5511 21.4655 88.997 21.4655Z" fill="#414141"/>
                      <path d="M101.777 21.4655C97.8208 21.4655 94.8857 18.5878 94.8857 14.9846V14.9384C94.8857 11.3353 97.8409 8.41138 101.831 8.41138C105.822 8.41138 108.725 11.2891 108.725 14.8923V14.9384C108.718 18.5416 105.761 21.4655 101.777 21.4655ZM105.138 14.9384C105.138 13.0896 103.778 11.476 101.777 11.476C99.7028 11.476 98.4615 13.0434 98.4615 14.8923V14.9384C98.4615 16.7873 99.8215 18.4009 101.822 18.4009C103.897 18.4009 105.138 16.8335 105.138 14.9846V14.9384Z" fill="#414141"/>
                      <path d="M126.51 21.1863V14.1888C126.51 12.5048 125.746 11.6386 124.389 11.6386C123.031 11.6386 122.193 12.5048 122.193 14.1888V21.1863H118.57V14.1888C118.57 12.5048 117.806 11.6386 116.446 11.6386C115.086 11.6386 114.253 12.5048 114.253 14.1888V21.1863H110.63V8.64441H114.253V10.4229C115.088 9.36988 116.186 8.41138 118.021 8.41138C119.69 8.41138 120.954 9.13465 121.622 10.3899C122.742 9.10387 124.086 8.41138 125.82 8.41138C128.509 8.41138 130.133 10.0008 130.133 13.028V21.1951L126.51 21.1863Z" fill="#414141"/>
                      <path d="M160.06 21.186V19.4074C159.224 20.4605 158.151 21.419 156.316 21.419C153.573 21.419 151.974 19.6405 151.974 16.7628V8.64404H155.601V15.6394C155.601 17.3234 156.41 18.1895 157.794 18.1895C159.179 18.1895 160.06 17.3234 160.06 15.6394V8.64404H163.682V21.186H160.06Z" fill="#414141"/>
                      <path d="M32.6079 26.2841C32.6079 27.8001 31.9942 29.2539 30.9017 30.3259C29.8093 31.3978 28.3276 32 26.7826 32H5.82524C4.28029 32 2.79862 31.3978 1.70617 30.3259C0.613728 29.2539 0 27.8001 0 26.2841V5.71586C0 4.19992 0.613728 2.74607 1.70617 1.67413C2.79862 0.602203 4.28029 0 5.82524 0H26.7871C28.3321 0 29.8137 0.602203 30.9062 1.67413C31.9986 2.74607 32.6124 4.19992 32.6124 5.71586L32.6079 26.2841Z" fill="#3866AF"/>
                      <path d="M11.1854 15.8591C11.3768 15.4704 11.6687 15.1376 12.0319 14.8938C12.395 14.6501 12.8169 14.5039 13.2556 14.4697H18.0816C18.3917 14.4792 18.7006 14.4274 18.99 14.3175C19.2794 14.2076 19.5433 14.0418 19.7661 13.8299C19.9889 13.6179 20.166 13.3643 20.287 13.0839C20.4079 12.8035 20.4703 12.5022 20.4703 12.1977C20.4703 11.8932 20.4079 11.5919 20.287 11.3115C20.166 11.0311 19.9889 10.7774 19.7661 10.5655C19.5433 10.3536 19.2794 10.1878 18.99 10.0779C18.7006 9.96793 18.3917 9.91617 18.0816 9.92564H15.5117V5.02759H17.8127C20.4699 5.02759 23.3332 5.17928 25.0405 7.0831C26.9494 9.21775 27.0771 12.8605 25.1839 15.7096C23.0487 18.9369 19.4415 20.212 15.9867 20.2823H14.0218L9.87918 20.3505C9.87918 20.3505 8.70742 20.3087 9.34147 19.1721L11.1854 15.8591Z" fill="white"/>
                      <path d="M15.5701 5.02759H10.1594C10.0608 5.03216 9.96472 5.0599 9.87933 5.10849C9.79394 5.15708 9.7217 5.22509 9.66869 5.30679C9.52306 5.65853 9.78743 6.01028 10.1482 6.65661C10.8427 7.9119 10.9816 8.19549 11.5686 9.11443C12.0167 9.68162 12.5387 9.90365 13.4708 9.94762H15.9846V5.02759H15.5701Z" fill="white"/>
                      <path d="M14.1916 21.0742C13.8712 22.8637 13.5486 24.695 13.2259 26.4867C13.1976 26.6201 13.1246 26.7403 13.0187 26.8283C12.9128 26.9163 12.7799 26.9671 12.6412 26.9726H7.42758C6.56724 26.9726 6.32526 26.8912 6.17067 26.7527C6.01608 26.6142 6.05193 26.379 6.19756 26.0272C6.19756 26.0272 7.26627 23.4046 7.87343 22.2548C8.4806 21.105 9.65237 21.0369 10.3962 21.0369C11.14 21.0369 14.1445 21.072 14.1445 21.072L14.1916 21.0742Z" fill="#6DB3D6"/>
                    </svg>
                </div>
                <div class="points-indicator">
                    <div class="points-content">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                          <path d="M16.5003 7.33341H15.5837V5.50008C15.5837 2.97008 13.5303 0.916748 11.0003 0.916748C8.47033 0.916748 6.41699 2.97008 6.41699 5.50008V7.33341H5.50033C4.49199 7.33341 3.66699 8.15841 3.66699 9.16675V18.3334C3.66699 19.3417 4.49199 20.1667 5.50033 20.1667H16.5003C17.5087 20.1667 18.3337 19.3417 18.3337 18.3334V9.16675C18.3337 8.15841 17.5087 7.33341 16.5003 7.33341ZM11.0003 15.5834C9.99199 15.5834 9.16699 14.7584 9.16699 13.7501C9.16699 12.7417 9.99199 11.9167 11.0003 11.9167C12.0087 11.9167 12.8337 12.7417 12.8337 13.7501C12.8337 14.7584 12.0087 15.5834 11.0003 15.5834ZM13.842 7.33341H8.15866V5.50008C8.15866 3.93258 9.43283 2.65841 11.0003 2.65841C12.5678 2.65841 13.842 3.93258 13.842 5.50008V7.33341Z" fill="#00ACC1"/>
                        </svg>
                        <span class="points-text">0 pts</span>
                    </div>
                </div>
            </div>

            <div class="main-card">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>

                <h2 class="section-title">Let's get to know you</h2>
                <p class="section-subtitle">You are a...</p>

                <span class="label-title">Select one</span>

                <div class="options-list">
                    ${listHtml}
                </div>
            </div>
        `;

        // Content is injected into #view-port inside #app-container
        container.style.padding = '0';
    },

    renderPaymentMethodSelection(container) {
        const methods = [
            { id: 'amex', label: 'Amex', isPopular: true },
            { id: 'bank', label: 'Bank transfer' },
            { id: 'visa', label: 'Visa' },
            { id: 'mastercard', label: 'Mastercard' },
            { id: 'other', label: 'Other' }
        ];

        const listHtml = methods.map(method => {
            const isSelected = this.state.paymentMethods.includes(method.id);
            const popularBadge = method.isPopular ? '<div class="popular-badge">Popular</div>' : '';
            // For multi-select, we might just keep the Plus, or change it? Design shows Plus.
            // If selected, typically it changes to check or highlights. Image shows Plus.
            // Assuming click selects it. 
            // Design image shows "Amex" with a Plus. We'll stick to Plus for now.
            const rightIcon = this.getIcon('plus');

            return `
            <button class="option-btn ${isSelected ? 'selected' : ''}" onclick="App.togglePaymentMethod('${method.id}')" style="position: relative;">
                ${popularBadge}
                <div class="option-content">
                    <span class="option-icon">${this.getIcon(method.id)}</span>
                    <span class="option-text">${method.label}</span>
                </div>
                <div class="option-arrow">
                    <span style="display:flex; justify-content:center; align-items:center;">${rightIcon}</span>
                </div>
            </button>
            `;
        }).join('');

        container.innerHTML = `
            <!-- Header -->
            <div class="app-header">
                <div class="logo-container">
                    <svg xmlns="http://www.w3.org/2000/svg" width="164" height="32" viewBox="0 0 164 32" fill="none" fill-rule="evenodd">
                      <path d="M143.827 8.50344C147.786 8.50344 149.527 10.515 149.527 13.9093V21.186H146.023V19.8296C145.138 20.7881 143.924 21.4191 142.158 21.4191C139.75 21.4191 137.771 20.0627 137.771 17.5829V17.5345C137.771 14.7975 139.893 13.5334 142.925 13.5334C143.993 13.5226 145.055 13.6975 146.061 14.05V13.8302C146.061 12.355 145.131 11.5372 143.319 11.5372H139.678V8.45947L143.827 8.50344ZM146.093 16.1319C145.365 15.8167 144.578 15.6571 143.783 15.6636C142.23 15.6636 141.276 16.2704 141.276 17.3938V17.4422C141.276 18.4007 142.087 18.9613 143.256 18.9613C144.948 18.9613 146.093 18.0489 146.093 16.7628V16.1319Z" fill="#414141"/>
                      <path d="M45.0671 21.4193C43.1358 21.4193 41.9438 20.5532 41.0857 19.5463V24.928H37.4629V8.64441H41.0768V10.4449C41.9595 9.27535 43.1739 8.41138 45.0581 8.41138C48.0402 8.41138 50.8833 10.7021 50.8833 14.8923V14.9384C50.8878 19.1264 48.0962 21.4193 45.0671 21.4193ZM47.2627 14.8923C47.2627 12.8104 45.8333 11.4298 44.1261 11.4298C42.4188 11.4298 41.0275 12.8104 41.0275 14.8923V14.9384C41.0275 17.0203 42.4345 18.4009 44.1261 18.4009C45.8176 18.4009 47.2627 17.0445 47.2627 14.9384V14.8923Z" fill="#414141"/>
                      <path d="M58.1361 8.50344C62.095 8.50344 63.8359 10.515 63.8359 13.9093V21.186H60.3318V19.8296C59.4468 20.7881 58.2324 21.4191 56.4669 21.4191C54.0584 21.4191 52.0801 20.0627 52.0801 17.5829V17.5345C52.0801 14.7975 54.2018 13.5334 57.2332 13.5334C58.3016 13.5226 59.3636 13.6975 60.3698 14.05V13.8302C60.3698 12.355 59.44 11.5372 57.6275 11.5372H53.9867V8.45947L58.1361 8.50344ZM60.4012 16.1319C59.6738 15.8167 58.8864 15.6571 58.0913 15.6636C56.5386 15.6636 55.5842 16.2704 55.5842 17.3938V17.4422C55.5842 18.4007 56.3952 18.9613 57.5648 18.9613C59.2563 18.9613 60.4012 18.0489 60.4012 16.7628V16.1319Z" fill="#414141"/>
                      <path d="M68.8237 25.0004H65.1694L65.6377 22.0436H68.3688C68.9894 22.0436 69.3255 21.8589 69.6347 21.2258L64.625 8.6377H68.4652L71.3778 17.1785L74.1694 8.6377H77.9379L73.0245 21.483C72.0477 24.0331 70.9969 25.0004 68.8281 25.0004" fill="#414141"/>
                      <path d="M79.1414 21.3553C78.8182 21.3519 78.5033 21.2547 78.2364 21.076C77.9694 20.8973 77.7623 20.6451 77.6411 20.3512C77.5199 20.0573 77.49 19.7347 77.5552 19.4241C77.6204 19.1136 77.7778 18.8289 78.0075 18.6059C78.2372 18.3829 78.5291 18.2316 78.8463 18.171C79.1635 18.1104 79.4919 18.1432 79.7901 18.2653C80.0883 18.3875 80.3431 18.5934 80.5222 18.8573C80.7014 19.1212 80.797 19.4312 80.7971 19.7483C80.7929 20.1763 80.6166 20.5854 80.3065 20.8864C79.9963 21.1874 79.5776 21.3559 79.1414 21.3553Z" fill="#3866AF"/>
                      <path d="M134.391 21.3553C134.068 21.3514 133.753 21.2538 133.487 21.0749C133.22 20.896 133.013 20.6436 132.892 20.3497C132.772 20.0557 132.742 19.7332 132.807 19.4228C132.873 19.1124 133.03 18.8279 133.26 18.6051C133.49 18.3823 133.782 18.2312 134.099 18.1708C134.416 18.1104 134.744 18.1434 135.043 18.2656C135.341 18.3877 135.595 18.5937 135.774 18.8575C135.953 19.1214 136.049 19.4313 136.049 19.7483C136.045 20.1767 135.868 20.586 135.558 20.8871C135.247 21.1882 134.828 21.3565 134.391 21.3553V21.3553Z" fill="#3866AF"/>
                      <path d="M88.997 21.4655C85.1568 21.4655 82.3428 18.5658 82.3428 14.9846V14.9384C82.3428 11.3572 85.1344 8.41138 89.0463 8.41138C91.4525 8.41138 92.9559 9.205 94.1478 10.5153L91.9387 12.8566C91.1277 12.0124 90.3166 11.476 89.0261 11.476C87.2136 11.476 85.9253 13.0434 85.9253 14.8923V14.9384C85.9253 16.8577 87.1912 18.4009 89.1695 18.4009C90.3861 18.4009 91.2195 17.8865 92.1023 17.0665L94.224 19.1748C92.9783 20.507 91.5511 21.4655 88.997 21.4655Z" fill="#414141"/>
                      <path d="M101.777 21.4655C97.8208 21.4655 94.8857 18.5878 94.8857 14.9846V14.9384C94.8857 11.3353 97.8409 8.41138 101.831 8.41138C105.822 8.41138 108.725 11.2891 108.725 14.8923V14.9384C108.718 18.5416 105.761 21.4655 101.777 21.4655ZM105.138 14.9384C105.138 13.0896 103.778 11.476 101.777 11.476C99.7028 11.476 98.4615 13.0434 98.4615 14.8923V14.9384C98.4615 16.7873 99.8215 18.4009 101.822 18.4009C103.897 18.4009 105.138 16.8335 105.138 14.9846V14.9384Z" fill="#414141"/>
                      <path d="M126.51 21.1863V14.1888C126.51 12.5048 125.746 11.6386 124.389 11.6386C123.031 11.6386 122.193 12.5048 122.193 14.1888V21.1863H118.57V14.1888C118.57 12.5048 117.806 11.6386 116.446 11.6386C115.086 11.6386 114.253 12.5048 114.253 14.1888V21.1863H110.63V8.64441H114.253V10.4229C115.088 9.36988 116.186 8.41138 118.021 8.41138C119.69 8.41138 120.954 9.13465 121.622 10.3899C122.742 9.10387 124.086 8.41138 125.82 8.41138C128.509 8.41138 130.133 10.0008 130.133 13.028V21.1951L126.51 21.1863Z" fill="#414141"/>
                      <path d="M160.06 21.186V19.4074C159.224 20.4605 158.151 21.419 156.316 21.419C153.573 21.419 151.974 19.6405 151.974 16.7628V8.64404H155.601V15.6394C155.601 17.3234 156.41 18.1895 157.794 18.1895C159.179 18.1895 160.06 17.3234 160.06 15.6394V8.64404H163.682V21.186H160.06Z" fill="#414141"/>
                      <path d="M32.6079 26.2841C32.6079 27.8001 31.9942 29.2539 30.9017 30.3259C29.8093 31.3978 28.3276 32 26.7826 32H5.82524C4.28029 32 2.79862 31.3978 1.70617 30.3259C0.613728 29.2539 0 27.8001 0 26.2841V5.71586C0 4.19992 0.613728 2.74607 1.70617 1.67413C2.79862 0.602203 4.28029 0 5.82524 0H26.7871C28.3321 0 29.8137 0.602203 30.9062 1.67413C31.9986 2.74607 32.6124 4.19992 32.6124 5.71586L32.6079 26.2841Z" fill="#3866AF"/>
                      <path d="M11.1854 15.8591C11.3768 15.4704 11.6687 15.1376 12.0319 14.8938C12.395 14.6501 12.8169 14.5039 13.2556 14.4697H18.0816C18.3917 14.4792 18.7006 14.4274 18.99 14.3175C19.2794 14.2076 19.5433 14.0418 19.7661 13.8299C19.9889 13.6179 20.166 13.3643 20.287 13.0839C20.4079 12.8035 20.4703 12.5022 20.4703 12.1977C20.4703 11.8932 20.4079 11.5919 20.287 11.3115C20.166 11.0311 19.9889 10.7774 19.7661 10.5655C19.5433 10.3536 19.2794 10.1878 18.99 10.0779C18.7006 9.96793 18.3917 9.91617 18.0816 9.92564H15.5117V5.02759H17.8127C20.4699 5.02759 23.3332 5.17928 25.0405 7.0831C26.9494 9.21775 27.0771 12.8605 25.1839 15.7096C23.0487 18.9369 19.4415 20.212 15.9867 20.2823H14.0218L9.87918 20.3505C9.87918 20.3505 8.70742 20.3087 9.34147 19.1721L11.1854 15.8591Z" fill="white"/>
                      <path d="M15.5701 5.02759H10.1594C10.0608 5.03216 9.96472 5.0599 9.87933 5.10849C9.79394 5.15708 9.7217 5.22509 9.66869 5.30679C9.52306 5.65853 9.78743 6.01028 10.1482 6.65661C10.8427 7.9119 10.9816 8.19549 11.5686 9.11443C12.0167 9.68162 12.5387 9.90365 13.4708 9.94762H15.9846V5.02759H15.5701Z" fill="white"/>
                      <path d="M14.1916 21.0742C13.8712 22.8637 13.5486 24.695 13.2259 26.4867C13.1976 26.6201 13.1246 26.7403 13.0187 26.8283C12.9128 26.9163 12.7799 26.9671 12.6412 26.9726H7.42758C6.56724 26.9726 6.32526 26.8912 6.17067 26.7527C6.01608 26.6142 6.05193 26.379 6.19756 26.0272C6.19756 26.0272 7.26627 23.4046 7.87343 22.2548C8.4806 21.105 9.65237 21.0369 10.3962 21.0369C11.14 21.0369 14.1445 21.072 14.1445 21.072L14.1916 21.0742Z" fill="#6DB3D6"/>
                    </svg>
                </div>
                <div class="points-indicator">
                    <div class="points-content">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                          <path d="M16.5003 7.33341H15.5837V5.50008C15.5837 2.97008 13.5303 0.916748 11.0003 0.916748C8.47033 0.916748 6.41699 2.97008 6.41699 5.50008V7.33341H5.50033C4.49199 7.33341 3.66699 8.15841 3.66699 9.16675V18.3334C3.66699 19.3417 4.49199 20.1667 5.50033 20.1667H16.5003C17.5087 20.1667 18.3337 19.3417 18.3337 18.3334V9.16675C18.3337 8.15841 17.5087 7.33341 16.5003 7.33341ZM11.0003 15.5834C9.99199 15.5834 9.16699 14.7584 9.16699 13.7501C9.16699 12.7417 9.99199 11.9167 11.0003 11.9167C12.0087 11.9167 12.8337 12.7417 12.8337 13.7501C12.8337 14.7584 12.0087 15.5834 11.0003 15.5834ZM13.842 7.33341H8.15866V5.50008C8.15866 3.93258 9.43283 2.65841 11.0003 2.65841C12.5678 2.65841 13.842 3.93258 13.842 5.50008V7.33341Z" fill="#00ACC1"/>
                        </svg>
                        <span class="points-text">1500 pts</span>
                    </div>
                </div>
            </div>

            <div class="main-card">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 50%;"></div>
                </div>

                <h2 class="section-title">Now let's unlock your rewards</h2>
                <p class="section-subtitle">How does your business pay?</p>

                <div class="helper-container">
                    <span class="label-title">Select multiple</span>
                    <div class="helper-link">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
                        <span>Why we need this</span>
                    </div>
                </div>

                <div class="options-list">
                    ${listHtml}
                </div>
            </div>

            <!-- Sticky Footer -->
            <div class="sticky-footer">
                <button class="footer-back-btn" onclick="App.state.currentScreen='roleSelection'; App.render();">
                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="12" viewBox="0 0 8 12" fill="none">
                      <path d="M7.41 1.41L6 0L0 6L6 12L7.41 10.59L2.83 6L7.41 1.41Z" fill="#3866B0"/>
                    </svg>
                </button>
                <button class="footer-confirm-btn ${this.state.paymentMethods.length > 0 ? 'active' : ''}">Confirm</button>
            </div>
        `;

        container.style.padding = '0';
    }
};

window.App = App;

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
