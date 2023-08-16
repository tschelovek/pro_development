document.addEventListener('DOMContentLoaded', () => {

    Fancybox.bind('[data-fancybox]', {
        hideScrollbar: false,
    });

    const swiper1 = new Swiper('#slider_news', {
        loop: true,
        // autoplay: {
        //     delay: 3000,
        // },
        speed: 1000,
        pagination: {
            el: '.swiper-pagination',
        },
        slidesPerView: 3,
        breakpoints: {
            // when window width is >= 320px
            320: {
                slidesPerView: 1,
                spaceBetween: 8
            },
            // when window width is >= 640px
            640: {
                slidesPerView: 2,
                spaceBetween: 16,
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 20,
            }
        }
    })

    const swiper2 = new Swiper('#slider_gallery_1', {
        loop: true,
        // autoplay: {
        //     delay: 3000,
        // },
        navigation: {
            nextEl: '#btn_gallery_next',
            prevEl: '#btn_gallery_prev',
        },
        speed: 1000,
        slidesPerView: 1,
    })

    const swiper3 = new Swiper('#slider_projects', {
        loop: true,
        autoplay: {
            delay: 3000,
        },
        speed: 1000,
        // pagination: {
        //     el: '.swiper-pagination',
        // },
        slidesPerView: 1,
        navigation: {
            nextEl: '#btn_projects_next',
            prevEl: '#btn_projects_prev',
        },
        breakpoints: {
            // when window width is >= 320px
            320: {
                slidesPerView: 1,
                spaceBetween: 8
            },
            // when window width is >= 640px
            640: {
                slidesPerView: 2,
                spaceBetween: 16,
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 20,
            }
        }
    })

    // Fancybox.show([{ src: "#dialog-content", type: "inline" }]);

    const modalView = document.getElementById('modal_view');

    document.querySelectorAll('a.projects__item__title')
        .forEach(link => link.addEventListener('click', e => {
            e.preventDefault();

            handlerProjectLink(e.currentTarget);
        }))
    document.getElementById('close_modal_view').addEventListener('click', closeModalView)

    function handlerProjectLink(target) {
        const item = target.closest('.projects__item');
        const projectsSpecsClone = item.querySelector('.projects__specs').cloneNode(true);
        const projectsSpecsNest = modalView.querySelector('.modal_view__block_right__specs-nest');

        projectsSpecsNest.append(projectsSpecsClone);

        if (modalView.classList.contains('open')) {
            closeModalView()
            return
        }

        // modalView.innerHTML = `
        //     <div class="modal_view__wrapper">
        //         <div class="container">
        //             <div class="modal_view__block_left">
        //                 <div class="modal_view__block_left__controls">
        //                     <button class="btn" type="button" id="close_modal_view">close</button>
        //                     <a href="/" class="logo__link">
        //                         <img srcset="./images/logo.png, ./images/logo_x2.png x2"
        //                              src="./images/logo_x2.png"
        //                              alt=""
        //                              title=""
        //                         >
        //                     </a>
        //                 </div>
        //             </div>
        //             <div class="modal_view__block_right">
        //                 <div class="modal_view__block_right__top"></div>
        //                 <div class="modal_view__info">
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        // `;
        modalView.classList.add('open')
    }

    function closeModalView() {
        modalView.classList.remove('open')
        modalView.querySelector('.modal_view__block_right__specs-nest').innerHTML = '';
    }

    /**
     *
     * Бургер меню8`
     */
    document.getElementById('burgerButton')?.addEventListener('click', e => {
        e.preventDefault();
        e.currentTarget.classList.toggle('active');
        document.querySelector('header .header__menu')?.classList.toggle('active');
        document.querySelector('header')?.classList.toggle('menu-open');
    })

    /**
     * Скукоживатель шапки при прокрутке
     */
    window.addEventListener('scroll', () => {
        const header = document.body.querySelector('header');
        if (window.scrollY > 0) {
            !header.classList.contains('shrink') ? header.classList.add('shrink') : null
        } else {
            header.classList.remove('shrink')
        }
    })
//*На случай перезагрузки страницы проверяем положение и если надо вешаем скукоживатель на шапку
    if (window.scrollY > 0) document.body.querySelector('header')?.classList.add('shrink')

})
