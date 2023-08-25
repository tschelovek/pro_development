// import {el} from './libs/redom.es'

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
        autoplay: {
            delay: 3000,
        },
        navigation: {
            nextEl: '#btn_gallery_1_next',
            prevEl: '#btn_gallery_1_prev',
        },
        speed: 1000,
        slidesPerView: 1,
    })

    //* Инициализируем второй слайдер в Галерее и сразу его дисейблим
    const swiper3 = new Swiper('#slider_gallery_2', {
        loop: true,
        autoplay: {
            delay: 2000,
        },
        navigation: {
            nextEl: '#btn_gallery_2_next',
            prevEl: '#btn_gallery_2_prev',
        },
        speed: 1000,
        slidesPerView: 1,
    }).disable()

    const swiper4 = new Swiper('#slider_projects', {
        loop: true,
        autoplay: {
            delay: 2000,
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

    /**
     * Переключение слайдеров в разделе "Галерея"
     */
    const tabButtons = document.querySelectorAll('section.gallery button[data-tab-index]');

    tabButtons.forEach(tabBtn => tabBtn.addEventListener('click', e => {
        const target = e.currentTarget;

        if (target.classList.contains('active')) return;

        tabButtons.forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');

        document.querySelectorAll('section.gallery .swiper')
            .forEach(slider => {
                    if (slider.dataset.target === target.dataset.tabIndex) {
                        slider.style.display = 'block'
                        slider.swiper.enable();
                        slider.swiper.update();
                        slider.swiper.autoplay.resume();
                    } else {
                        slider.swiper.disable();
                        slider.style.display = 'none'
                    }
                }
            )
    }))

    /**
     * Карта
     *
     */

    const ZOOM_INCREMENT = 1.1;
    const ZOOM_DECREMENT = 0.9;
    const canvas = document.getElementById('canvas');
    const canvasSvg = document.getElementById('canvas_svg');
    const zoomPlusBtn = document.getElementById('zoom_plus');
    const zoomMinusBtn = document.getElementById('zoom_minus');
    let state = {
        scale: 1,
        setScale: ({number, direction}) => {
            if (direction === 'plus') {
                state.scale = number
            } else if (direction === 'minus') {
                if ((parseInt(canvas.style.width) * number * ZOOM_DECREMENT) <= window.visualViewport.width) {
                    state.scale = 1;
                    return
                }
                state.scale = number
            }
        },
        getScale: () => {
            return state.scale
        },
    }

    zoomPlusBtn.addEventListener('click', handlerZoomPlusBtn);
    zoomMinusBtn.addEventListener('click', handlerZoomMinusBtn);

    function handlerZoomPlusBtn() {
        const viewPortWidth = window.visualViewport.width;
        const {width: canvasWidth, height: canvasHeight} = canvas.getBoundingClientRect();

        state.setScale({
            number: state.getScale() * ZOOM_INCREMENT,
            direction: 'plus'
        })
        // canvas.style.width = (viewPortWidth * state.scale).toString()
        // canvas.style.width === '100%'
        //     ? canvas.style.width = `${viewPortWidth}px`
        //     : null
        canvas.style.width = (canvasWidth * state.scale).toString() + 'px';
        canvas.style.height = (canvasHeight * state.scale).toString() + 'px';

        console.log(state)
    }

    function handlerZoomMinusBtn() {
        const viewPortWidth = window.visualViewport.width;
        const {width: canvasWidth, height: canvasHeight} = canvas.getBoundingClientRect();

        state.setScale({
            number: state.getScale() * ZOOM_DECREMENT,
            direction: 'minus'
        })

        // canvas.style.width = (parseInt(canvas.style.width) * state.scale).toString()
        canvas.style.width = (canvasWidth * state.scale).toString() + 'px';
        canvas.style.height = (canvasHeight * state.scale).toString() + 'px';

        console.log(state)
    }

    //* Disable browser own drag’n’drop support for images
    canvasSvg.ondragstart = function() {
        return false;
    };

    canvas.addEventListener('mousedown', handlerMouseDrag);

    function handlerMouseDrag(event) {
        const map = event.currentTarget;

        let currentCanvasLeft = Number(map.style.left.replace('px', ''));
        let currentCanvasTop = Number(map.style.top.replace('px', ''));
        let startCursorOffsetX = event.clientX;
        let startCursorOffsetY = event.clientY;

        map.addEventListener('mousemove', onMouseMove);
        map.addEventListener('mouseup', stopUsingDrag);

        moveAt(event.clientX, event.clientY);

        function moveAt(pageX, pageY) {
            const { height: mapHeight, width: mapWidth } = map.getBoundingClientRect();
            const { height: wrapperHeight, width: wrapperWidth } = map.closest('.genplan__wrapper').getBoundingClientRect();
            let mapOffsetX = currentCanvasLeft - startCursorOffsetX + pageX;
            let mapOffsetY = currentCanvasTop - startCursorOffsetY + pageY;

            if (mapWidth <= (wrapperWidth - mapOffsetX)) {
                mapOffsetX = wrapperWidth - mapWidth
            }
            if (mapHeight <= (wrapperHeight - mapOffsetY)) {
                mapOffsetY = wrapperHeight - mapHeight
            }

            map.style.left = mapOffsetX < 0 ? mapOffsetX + 'px' : '0px';
            map.style.top = mapOffsetY < 0 ? mapOffsetY + 'px' : '0px';
        }

        function onMouseMove(ev) {
            moveAt(ev.clientX, ev.clientY);
        }

        function stopUsingDrag() {
            map.removeEventListener('mousemove', onMouseMove);
            map.removeEventListener('mouseup', stopUsingDrag);
        }

    }

    canvasSvg.querySelector('path[data-landplot]').addEventListener('click', () => {
        console.log('success')
    })

    /**
     * Конец анимации карты
     */

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

        // projectsSpecsNest.append(projectsSpecsClone);

        if (modalView.classList.contains('open')) {
            closeModalView()
            return
        }

        const layout = el('container',
            el('modal_view__wrapper', [
                    el('modal_view__block_left',
                        el('modal_view__block_left__controls'), [
                            el('button.btn', {type: "button", id: "close_modal_view"}, "Close"),
                            el('a.logo__link', {href: "/"},
                                el('', {src: "./images/logo_x2.png"}
                                )
                            )
                        ]
                    ),
                    el('modal_view__block_right', [
                            el('modal_view__block_right__controls'),
                            el('modal_view__block_right__info',
                                el('modal_view__block_right__specs-nest',
                                    // projectsSpecsClone
                                )
                            )
                        ]
                    )
                ]
            )
        )


        // <div className="container">
        //     <div className="modal_view__wrapper">
        //         <div className="modal_view__block_left">
        //             <div className="modal_view__block_left__controls">
        //                 <button className="btn" type="button" id="close_modal_view">close</button>
        //                 <a href="/" className="logo__link">
        //                     <img srcSet="./images/logo.png, ./images/logo_x2.png x2"
        //                          src="./images/logo_x2.png"
        //                          alt=""
        //                          title=""
        //                     >
        //                 </a>
        //             </div>
        //         </div>
        //         <div className="modal_view__block_right">
        //             <div className="modal_view__block_right__controls">
        //
        //             </div>
        //             <div className="modal_view__block_right__info">
        //                 <div className="modal_view__block_right__specs-nest"></div>
        //             </div>
        //         </div>
        //     </div>
        // </div>

        modalView.classList.add('open')
    }

    function closeModalView() {
        modalView.classList.remove('open')
        modalView.querySelector('.modal_view__block_right__specs-nest').innerHTML = '';
    }

    /**
     *
     * Бургер меню
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
