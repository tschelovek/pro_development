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
        // autoplay: {
        //     delay: 2000,
        // },
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

    function createHTMLElement({tag, text, classNameArr}) {
        const element = document.createElement(tag);

        element.textContent = text || '';

        classNameArr.map(styleClass => {
            styleClass.includes(' ')
                ? styleClass.split(' ').map(style => element.classList.add(style.toString()))
                : element.classList.add(styleClass)
        });

        if (tag === 'button') {
            element.type = 'button'
        }

        return element;
    }


    /**
     * Карта (зум, перетаскивание)
     *
     */

    const canvas = document.getElementById('canvas');
    const canvasSvg = document.getElementById('canvas_svg');
    const zoomPlusBtn = document.getElementById('zoom_plus');
    const zoomMinusBtn = document.getElementById('zoom_minus');
    let state = {
        zoomStep: 1,
        getZoomStep: () => {
            return state.zoomStep
        },
        setZoomStep: number => {
            if (number < 1) {
                state.zoomStep = 1;
                return
            }
            if (number > Object.keys(state.zoomStepRatio).length) {
                state.zoomStep = Object.keys(state.zoomStepRatio).length;
                return
            }
            state.zoomStep = number;
        },
        zoomStepRatio: {
            1: 1,
            2: 1.1,
            3: 1.3,
            4: 1.5,
            5: 2
        },
        popups: {
            1: {
                isShown: false
            },
        }
    }

    zoomPlusBtn.addEventListener('click', handlerZoomPlusBtn);
    zoomMinusBtn.addEventListener('click', handlerZoomMinusBtn);

    function handlerZoomPlusBtn() {
        const {height: wrapperHeight} = canvas.closest('.genplan__wrapper').getBoundingClientRect();

        state.setZoomStep(state.getZoomStep() + 1);

        canvas.style.height = (wrapperHeight * state.zoomStepRatio[state.getZoomStep()]).toString() + 'px';

        //TODO Make additional offset to center view frame

        console.log(state)
    }

    function handlerZoomMinusBtn() {
        const {height: wrapperHeight} = canvas.closest('.genplan__wrapper').getBoundingClientRect();

        state.setZoomStep(state.getZoomStep() - 1);

        canvas.style.height = (wrapperHeight * state.zoomStepRatio[state.getZoomStep()]).toString() + 'px';

        //TODO Make empty offset checking

        console.log(state)
    }

    //* Disable browser own drag’n’drop support for images
    canvasSvg.ondragstart = function () {
        return false;
    };

    canvas?.addEventListener('mousedown', handlerMouseDrag);
    canvas?.addEventListener('touchstart', handlerTouchDrag);

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
            const {height: mapHeight, width: mapWidth} = map.getBoundingClientRect();
            const {
                height: wrapperHeight,
                width: wrapperWidth
            } = map.closest('.genplan__wrapper').getBoundingClientRect();
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

    function handlerTouchDrag(event) {
        const map = event.currentTarget;

        let currentCanvasLeft = Number(map.style.left.replace('px', ''));
        let currentCanvasTop = Number(map.style.top.replace('px', ''));
        let startCursorOffsetX = event.targetTouches[0].clientX;
        let startCursorOffsetY = event.targetTouches[0].clientY;

        map.addEventListener('touchmove', onMouseMove);
        map.addEventListener('touchend', stopUsingDrag);

        moveAt(event.targetTouches[0].clientX, event.targetTouches[0].clientY);

        function moveAt(pageX, pageY) {
            const {height: mapHeight, width: mapWidth} = map.getBoundingClientRect();
            const {
                height: wrapperHeight,
                width: wrapperWidth
            } = map.closest('.genplan__wrapper').getBoundingClientRect();
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
            moveAt(ev.targetTouches[0].clientX, ev.targetTouches[0].clientY);
        }

        function stopUsingDrag() {
            map.removeEventListener('mousemove', onMouseMove);
            map.removeEventListener('mouseup', stopUsingDrag);
        }
    }

    // canvasSvg.querySelector('path[data-landplot]').addEventListener('click', () => {
    //     console.log('success')
    // })

    /**
     * Конец анимации карты
     */

        // Fancybox.show([{ src: "#dialog-content", type: "inline" }]);

    const modalView = document.getElementById('modal_view');

    /**
     * Всплывающее окно в слайдере "Проекты"
     */

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
     * Popup window on map
     */

    canvasSvg.querySelector('path[data-landplot="8"]').addEventListener('mouseover', handlerMapPopup);

    function handlerMapPopup(event) {
        const target = event.currentTarget;
        const id = target.dataset.landplot;

        if (state.popups[id]?.isShown === true) {
            return
        }

        target.style.fill = '#61CAE6';

        const popup = createPopupWindow(target);
        canvas.closest('.genplan__wrapper').append(popup);

        Object.hasOwn(state.popups, id)
            ? state.popups[id].isShown = true
            : Object.assign(state.popups, {
                [id]: {isShown: true}
            })

        target.addEventListener('mouseout', handlerMouseout)

        function handlerMouseout() {
            target.removeEventListener('mouseout', handlerMouseout);
            state.popups[id].isShown = false
            setTimeout(() => closePopupMouseout({popup, target}), 1000)
        }
    }

    function closePopupMouseout({popup, target, id}) {
        !target ? target = canvasSvg.querySelector(`path[data-landplot="${id}"]`) : null;
        !id ? id = target.dataset.landplot : null;
        console.log('closePopupMouseout')
        console.log(!state.popups[id].isShown)

        setTimeout(() => {
            if (!state.popups[id].isShown) {
                console.log('setTimeout closePopupMouseout')
                target.style.fill = '#F5F5F5';
                popup.remove()
            }
        }, 10)
    }

    function createPopupWindow(target) {
        const {
            title,
            cost,
            imageSrc,
            square,
            floors,
            bedrooms,
            garage,
            landplot: id
        } = target.dataset;
        // TODO Переделать на createHTMLElement
        const windowDiv = document.createElement('div');
        const image = document.createElement('img');
        const textBlockDiv = document.createElement('div');
        const titleH3 = document.createElement('h3');
        const priceDiv = document.createElement('div');
        const featuresDiv = document.createElement('div');
        const button = createHTMLElement({
            tag: 'button',
            text: 'Подробнее',
            classNameArr: ['btn', 'btn_blue'],
        });

        windowDiv.classList.add('genplan__popup');
        textBlockDiv.classList.add('genplan__popup__info');
        priceDiv.classList.add('genplan__popup__price');
        featuresDiv.classList.add('genplan__popup__features');

        image.src = imageSrc;

        titleH3.textContent = title;
        priceDiv.textContent = `${formatNumber(cost)} Руб`;

        textBlockDiv.append(titleH3, priceDiv, featuresDiv, button)
        windowDiv.append(image, textBlockDiv);

        windowDiv.addEventListener('mouseover', handlerMouseOver);
        function handlerMouseOver(event) {
            // console.log('currentTarget', event.currentTarget)
            // console.log('target', event.target)
            const outTarget = event.currentTarget
            state.popups[id].isShown = true
            console.log(state)

            event.currentTarget.addEventListener('mouseout', handlerMouseOut, {once: true});
            function handlerMouseOut(ev) {
                const curTarget = ev.target;
                // let related = ev.relatedTarget ? ev.relatedTarget.id : "unknown";
                let related = ev.relatedTarget
                console.log('curTarget', curTarget)
                console.log('ev.relatedTarget', ev.relatedTarget)
                // console.log('related', related)
                // console.log(windowDiv)
                // console.log('Array.from', Array.from(windowDiv.childNodes))
                console.log('windowDiv.querySelectorAll', Array.from(windowDiv.querySelectorAll("*")).includes(related))
                // if(related === windowDiv || Array.from(windowDiv.childNodes).includes(related)) {
                if(related === windowDiv || Array.from(windowDiv.querySelectorAll("*")).includes(related)) {
                    console.log('lol')
                    return
                }

                console.log('tutut')
                state.popups[id].isShown = false
                closePopupMouseout({popup: windowDiv, id})
            }
        }

        return windowDiv
    }

    /**
     * _END_ popup window on map
     */

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
    /**
     * Конец скукоживателя шапки при прокрутке
     */

    const formatter = new Intl.NumberFormat("ru-RU", {})

    function formatNumber(value) {
        return formatter.format(Number(value))
    }

})
