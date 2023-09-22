document.addEventListener('DOMContentLoaded', () => {

    /**
     * Инициализация плагинов
     */
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
     * Конец инициализации плагинов
     */

    /**
     * КАРТА (зум, перетаскивание)
     *
     */

    const COLOR_IN_SELL = '#61CAE6';
    const COLOR_SOLD_OUT = '#a9a9a9';
    const SOLD_OUT_TEXT = 'Коттедж продан';
    const canvas = document.getElementById('canvas');
    const canvasSvg = document.getElementById('canvas_svg');
    const containerGenplan = document.getElementById('gp_container');
    const genplanWrapper = containerGenplan.querySelector('.genplan__wrapper');
    const zoomPlusBtn = document.getElementById('zoom_plus');
    const zoomMinusBtn = document.getElementById('zoom_minus');
    let state = {
        get zoomStep() {
            return this._zoomStep
        },
        set zoomStep(number) {
            if (number < 1) {
                this._zoomStep = 1;
                return
            }
            if (number > Object.keys(state.zoomStepRatio).length) {
                this._zoomStep = Object.keys(state.zoomStepRatio).length;
                return
            }
            this._zoomStep = number;
        },
        zoomStepRatio: {
            1: 1,
            2: 1.1,
            3: 1.3,
            4: 1.5,
            5: 2
        },
        popups: {},
        get isMobile() {
            return window.innerWidth < 640
        },
    }
    state.zoomStep = 1;

    zoomPlusBtn.addEventListener('click', handlerZoomPlusBtn);
    zoomMinusBtn.addEventListener('click', handlerZoomMinusBtn);

    function handlerZoomPlusBtn() {
        const {height: wrapperHeight} = genplanWrapper.getBoundingClientRect();

        state.zoomStep++;

        canvas.style.height = (wrapperHeight * state.zoomStepRatio[state.zoomStep]).toString() + 'px';
    }

    function handlerZoomMinusBtn() {
        const {height: wrapperHeight, width: wrapperWidth} = genplanWrapper.getBoundingClientRect();

        state.zoomStep--;

        canvas.style.height = (wrapperHeight * state.zoomStepRatio[state.zoomStep]).toString() + 'px';

        //* Убираем пустые отступы справа и снизу
        const {height: canvasHeight, width: canvasWidth} = canvas.getBoundingClientRect();
        const currentCanvasLeft = parseInt(canvas.style.left);
        const currentCanvasTop = parseInt(canvas.style.top);
        if (canvasWidth - currentCanvasLeft > wrapperWidth) {
            canvas.style.left = wrapperWidth - canvasWidth + 'px'
        }
        if (canvasHeight - currentCanvasTop > wrapperHeight) {
            canvas.style.top = wrapperHeight - canvasHeight + 'px'
        }
    }

    //* Disable browser own drag’n’drop support for images
    canvasSvg.ondragstart = function () {
        return false;
    };

    canvas?.addEventListener('mousedown', handlerMouseDrag);
    canvas?.addEventListener('touchstart', handlerTouchDrag);

    function handlerMouseDrag(event) {
        const map = event.currentTarget;

        let currentCanvasLeft = parseInt(map.style.left);
        let currentCanvasTop = parseInt(map.style.top);
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
            } = genplanWrapper.getBoundingClientRect();
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
            } = genplanWrapper.getBoundingClientRect();
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

    /**
     * Popup земельных участков
     */

    const landplots = canvasSvg.querySelectorAll('path[data-landplot]');
    landplots.forEach(landplot => landplot.addEventListener('mouseover', handlerMapPopup));

    function handlerMapPopup(event) {
        const landplot = event.currentTarget;
        const id = landplot.dataset.landplot;

        if (state.popups[id]?.isShown === true) {
            return
        }

        closeOtherPopups();
        landplot.style.fill = landplot.dataset?.soldout === 'true'
            ? COLOR_SOLD_OUT
            : COLOR_IN_SELL

        const popup = createPopupWindow(landplot);
        if (state.isMobile) {
            containerGenplan.append(popup);
        } else {
            genplanWrapper.append(popup);
        }

        Object.hasOwn(state.popups, id)
            ? state.popups[id].isShown = true
            : Object.assign(state.popups, {
                [id]: {isShown: true}
            })

        landplot.addEventListener('mouseout', handlerMouseout, {once: true})

        function handlerMouseout() {
            state.popups[id].isShown = false
            setTimeout(() => closePopupMouseout({popup, target: landplot}), 1000)
        }
    }

    function closeOtherPopups() {
        for (let key in state.popups) {
            state.popups[key].isShown = false
        }
        landplots.forEach(element => element.style.fill = '#F5F5F5');
        containerGenplan.querySelector('.genplan__popup')?.remove()
    }

    function closePopupMouseout({popup, target, id}) {
        target = target || canvasSvg.querySelector(`path[data-landplot="${id}"]`);
        id = id || target.dataset.landplot;

        if (!state.popups[id].isShown) {
            try {
                popup.remove()
            } finally {
                target.style.fill = '#F5F5F5';
            }
        }
    }

    function createPopupWindow(target) {
        const {
            title,
            cost,
            mortgage,
            imageSrc,
            square,
            floors,
            bedrooms,
            garage,
            optionToShow,
            soldout,
            landplot: id
        } = target.dataset;
        const popupDiv = createHTMLElement({tag: 'div', classNameArr: ['genplan__popup']});
        const textBlockDiv = createHTMLElement({tag: 'div', classNameArr: ['genplan__popup__info']});
        const titleH3 = createHTMLElement({tag: 'h3', text: title});
        const priceDiv = createHTMLElement({tag: 'div', classNameArr: ['genplan__popup__price']});
        const mortgageDiv = createHTMLElement({tag: 'div', classNameArr: ['genplan__popup__mortgage']});
        const featuresDiv = createHTMLElement({tag: 'div', classNameArr: ['genplan__popup__features']});
        const button = createHTMLElement({
            tag: 'button',
            text: 'Подробнее',
            classNameArr: ['btn', 'btn_blue'],
        });
        const image = document.createElement('img');


        image.src = imageSrc || '';

        if (soldout === 'true') {
            priceDiv.textContent = SOLD_OUT_TEXT;
        } else {
            priceDiv.textContent = cost
                ? `${formatNumber(cost)} Руб`
                : 'Уточните цену у менеджера';

            if (mortgage) {
                mortgageDiv.textContent = `Ипотека: от ${formatNumber(mortgage)} руб./мес`;
            }

            switch (optionToShow) {
                case 'square':
                    featuresDiv.textContent = `${square} м2`;
                    break;
                case 'floors':
                    featuresDiv.textContent = `количество этажей: ${floors}`;
                    break;
                case 'bedrooms':
                    featuresDiv.textContent = `количество спален: ${bedrooms}`;
                    break;
                case 'garage':
                    featuresDiv.textContent = garage === 'true' ? 'гараж есть' : 'гаража нет';
                    break
            }
        }

        const insertLayout = document.getElementById('gp_inserts')
                .querySelector(`.genplan__popup__insert_${id}`)
                ?.cloneNode(true)
            || '';

        textBlockDiv.append(titleH3, priceDiv, mortgageDiv, featuresDiv, insertLayout, button);
        popupDiv.append(image, textBlockDiv);

        popupDiv.addEventListener('mouseover', handlerMouseOver);

        function handlerMouseOver(event) {
            state.popups[id].isShown = true;

            event.currentTarget.addEventListener('mouseout', handlerMouseOut, {once: true});

            function handlerMouseOut(ev) {
                let related = ev.relatedTarget;
                if (related === popupDiv
                    || Array.from(popupDiv.querySelectorAll("*")).includes(related)
                ) {
                    return
                }

                state.popups[id].isShown = false
                closePopupMouseout({popup: popupDiv, id})
            }
        }

        return popupDiv
    }

    /**
     * END popup земельных участков
     */
    /**
     * Конец анимации карты
     */

    /**
     * Всплывающее окно в слайдере "Проекты"
     */

    const FALLBACK_IMG_SRC = ''
    const modalView = document.getElementById('modal_view');

    document.querySelectorAll('a.projects__item__title')
        .forEach(link => link.addEventListener('click', e => {
            e.preventDefault();

            handlerProjectLink(e);
        }))

    function handlerProjectLink(e) {
        const item = e.currentTarget.closest('.projects__item');
        const btnClose = document.getElementById('close_modal_view');
        const projectsSpecsClone = item.querySelector('.projects__specs').cloneNode(true);
        const projectsSpecsNest = modalView.querySelector('.modal_view__block_right__specs-nest');
        const projectLink = modalView.querySelector('a.project-link');
        const img = document.createElement('img');
        let img2 = '';

        if (modalView.classList.contains('open')) {
            closeModalView()
            // return
        }

        img.src = e.currentTarget.dataset.image || FALLBACK_IMG_SRC;
        if (e.currentTarget.dataset.image2) {
            img2 = document.createElement('img');
            img2.src = e.currentTarget.dataset.image2 || FALLBACK_IMG_SRC;
        }
        projectLink.href = e.currentTarget.dataset.link || '/';

        modalView.querySelector('.modal_view__block_left__content__image').append(img, img2);
        projectsSpecsNest.append(projectsSpecsClone);

        btnClose.addEventListener('click', handlerCloseBtn);
        document.addEventListener('keydown', handlerEsc);
        setTimeout(() => modalView.addEventListener('click', handlerOutclick), 50);

        modalView.classList.add('open');
        document.body.classList.add('stop-scrolling');

        function handlerCloseBtn() {
            closeModalView()
        }

        function handlerEsc(event) {
            if (event.key === "Escape") closeModalView()
        }

        function handlerOutclick(event) {
            if (event.target === event.currentTarget) closeModalView()
        }

        function closeModalView() {
            btnClose.removeEventListener('click', handlerCloseBtn);
            document.removeEventListener('keydown', handlerEsc);
            modalView.removeEventListener('click', handlerOutclick);
            modalView.classList.remove('open');
            document.body.classList.remove('stop-scrolling');
            modalView.querySelector('.modal_view__block_right__specs-nest').innerHTML = '';
            modalView.querySelector('.modal_view__block_left__content__image').innerHTML = '';
        }
    }

    /**
     * ~~МЕЛКИЕ СКРИПТЫ~~
     * =============
     */
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
     * ~~КОНЕЦ МЕЛКИХ СКРИПТОВ~~
     * =============
     */

    /**
     *
     * UTILS
     */

    const formatter = new Intl.NumberFormat("ru-RU", {})

    function formatNumber(value) {
        return formatter.format(Number(value))
    }

    function createHTMLElement({tag, text, classNameArr}) {
        const element = document.createElement(tag);

        element.textContent = text || '';

        classNameArr?.map(styleClass => {
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
     *
     * END UTILS
     */
})
