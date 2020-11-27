"use strict"

/**
    * NodeList.prototype.forEach() polyfill
    * https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach#Polyfill
*/
if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
        thisArg = thisArg || window

        for (var i = 0; i < this.length; i++) {
            callback.call(thisArg, this[i], i, this)
        }
    }
}

/**
 * Object.assign() polyfill
 */
Object.assign||Object.defineProperty(Object,"assign",{enumerable:!1,configurable:!0,writable:!0,value:function(a,b){"use strict";if(void 0===a||null===a)error("Cannot convert first argument to object");for(var c=Object(a),d=1;d<arguments.length;d++){var e=arguments[d];if(void 0!==e&&null!==e)for(var f=Object.keys(Object(e)),g=0,h=f.length;g<h;g++){var i=f[g],j=Object.getOwnPropertyDescriptor(e,i);void 0!==j&&j.enumerable&&(c[i]=e[i])}}return c}});

/**
 * CustomEvent() polyfill
 */
!function(){if("function"==typeof window.CustomEvent)return;function t(t,e){e=e||{bubbles:!1,cancelable:!1,detail:void 0};var n=document.createEvent("CustomEvent");return n.initCustomEvent(t,e.bubbles,e.cancelable,e.detail),n}t.prototype=window.Event.prototype,window.CustomEvent=t}();

/**  
    * Функция определения события swipe на элементе
    * @param {Object} el - элемент DOM
    * @param {Object} settings - объект с предварительными настройками
*/
const swipe = function(el, settings) {
    let dir // Направление свайпа (horizontal, vertical)
    let swipeType // тип свайпа (up, down, left, right)
    let dist // Дистанция, пройденная указателем
    let isMouse = false // Поддержка мыши (не используется для touch событий)
    let isMouseDown = false // Указание на активное нажатие мыши (не используется для touch событий)
    let startX = 0 // Начало координат по оси X (pageX)
    let distX = 0 // Дистанция, пройденная указателем по оси X
    let startY = 0 // Начало координат по оси Y (pageY)
    let distY = 0 // Дистанция, пройденная указателем по оси Y
    let startTime = 0 // Время начала касания
    const support = { // Поддерживаемые браузером типы событий
        pointer: !!('PointerEvent' in window || ('msPointerEnabled' in window.navigator)),
        touch: !!(typeof window.screen.orientation !== 'undefined' || /Android|webOS|iPhone|iPod|iPad|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 'ontouchstart' in window || navigator.msMaxTouchPoints || 'maxTouchPoints' in window.navigator > 1 || 'msMaxTouchPoints' in window.navigator > 1)
    }

    // Настройки по умолчанию
    const defaultSettings = Object.assign({}, {
        minDist: 60, // Минимальная дистанция, которую должен пройти указатель, чтобы жест считался как свайп (px)
        maxDist: 120, // Максимальная дистанция, которую должен пройти указатель, чтобы жест считался как свайп (px)
        maxTime: 700, // Максимальное время, за которое должен быть совершен свайп (ms)
        minTime: 50 // Минимальное время, за которое должен быть совершен свайп (ms)
    })

    // Коррекция времени при ошибочных значениях
    if (defaultSettings.maxTime < defaultSettings.minTime) {
        defaultSettings.maxTime = defaultSettings.minTime + 500
    }
    if (defaultSettings.maxTime < 100 || defaultSettings.minTime < 50) {
        defaultSettings.maxTime = 700
        defaultSettings.minTime = 50
    }

    /** 
     * Определение доступных в браузере событий: pointer, touch и mouse
     * @returns {Object} - возвращает объект с достными событиями
    */
    const getSupportedEvents = function () {
        let events = {}

        if (support.pointer) {
            events = {
                type:   "pointer",
                start:  "PointerDown",
                move:   "PointerMove",
                end:    "PointerUp",
                cancel: "PointerCancel",
                leave:  "PointerLeave"
            };

            // добавление префиксов для IE10
            const ie10 = (window.navigator.msPointerEnabled && Function('/*@cc_on return document.documentMode===10@*/')())
            
            for (let value in events) {
                if (value === "type") continue
                events[value] = (ie10) ? "MS" + events[value] : events[value].toLowerCase()
            }
        } else if (support.touch) {
            events = {
                type:   'touch',
                start:  'touchstart',
                move:   'touchmove',
                end:    'touchend',
                cancel: 'touchcancel'
            }
        } else {
            events = {
                type:  'mouse',
                start: 'mousedown',
                move:  'mousemove',
                end:   'mouseup',
                leave: 'mouseleave'
            }
        }

        return events
    }

    /**
     * Объединение событий mouse/pointer и touch
     * @param e {Event} - принимает в качестве аргумента событие
     * @returns {TouchList|Event} - возвращает либо TouchList, либо оставляет событие без изменения
     */

    const eventsUnify = function (e) {
        return e.changedTouches ? e.changedTouches[0] : e
    }

    /**
     * Обработчик начала касания указателем
     * @param e {Event} - получает событие
     */

    const checkStart = function (e) {
        const event = eventsUnify(e)

        // Игнорирование касания несколькими пальцами
        if (support.touch && typeof e.touches !== 'undefined' && e.touches.length !== 1) {
            return
        }

        dir = 'none'
        swipeType = 'none'
        dist = 0
        startX = event.pageX
        startY = event.pageY
        startTime = new Date().getTime()

        if (isMouse) {
            isMouseDown = true // поддерка мыши
        }
    }

    /**
     * Обработчик движения указателя
     * @param e {Event} - получает событие
     */
    const checkMove = function (e) {
        // Выход из функции, если мышь перестала быть активна во время движения
        if (isMouse && !isMouseDown) {
            return
        }
        
        const event = eventsUnify(e)
        distX = event.pageX - startX
        distY = event.pageY - startY

        if (Math.abs(distX) > Math.abs(distY)) {
            dir = (distX < 0) ? 'left' : 'right'
        } else {
            dir = (distY < 0) ? 'up' : 'down'
        }
    }

    /**
     * Обработчик окончания касания указателем
     * @param e {Event} - получает событие.
     */
    const checkEnd = function (e) {
        // Выход из функции и сброс проверки нажатия мыши
        if (isMouse && !isMouseDown) {
            isMouseDown = false
            return
        }

        const endTime = new Date().getTime()
        const time = endTime - startTime

        // Проверка времени жеста
        if (time >= defaultSettings.minTime && time <= defaultSettings.maxTime) {
            if (Math.abs(distX) >= defaultSettings.minDist && Math.abs(distY) <= defaultSettings.maxDist) {
                swipeType = dir // определение типа свайпа как "left" или "right"
            } else if (Math.abs(distY) >= defaultSettings.minDist && Math.abs(distX) <= defaultSettings.maxDist) {
                swipeType = dir // Определение типа свайпа как "top" или "down"
            }
        }
        // опредление пройденной указателем дистанции
        dist = (dir === 'left' || dir === 'right') ? Math.abs(distX) : Math.abs(distY)

        // Генерация кастомного события swipe
        if (swipeType !== 'none' && dist >= defaultSettings.minDist) {
            const swipeEvent = new CustomEvent('swipe', {
                bubbles: true,
                cancelable: true,
                detail: {
                    full: e, // Полное событие Event
                    dir: swipeType, // Направление свайпа
                    dist: dist, // Дистанция свайпа
                    time: time // Время, потраченное на свайп
                }
            })

            el.dispatchEvent(swipeEvent)
        }
    }

    // Добавление поддерживаемых событий
    const events = getSupportedEvents()
    
    if ((support.pointer && !support.touch) || events.type === 'mouse') {
        isMouse = true
    }

    // Добавление обработчиков на элемент
    el.addEventListener(events.start, checkStart)
    el.addEventListener(events.move, checkMove)
    el.addEventListener(events.end, checkEnd)

    if (support.pointer && support.touch) {
        el.addEventListener('lostpointercapture', checkEnd)
    }
}

// Отображение скрытого ряда карточек
const btnMore = document.querySelector('.btn-more')
const hiddenCards = document.querySelectorAll('.card-link--hidden')
btnMore.addEventListener('click', function () {
    hiddenCards.forEach(function (card) {
        card.classList.remove('card-link--hidden')
    })
})

// Показать/Скрыть контент внутри виджетов
const widgets = document.querySelectorAll('.widget')
widgets.forEach(function (widget) {
    widget.addEventListener('click', function(event) {
        const target = event.target

        if (target.classList.contains('widget__title')) {
            target.classList.toggle('widget__title--active')
            target.nextElementSibling.classList.toggle('widget__body--hidden')
        }
    })
})

// Location - кнопка "Любая"
const checkboxAny = document.querySelector('#location-05')
const topLocationCheckboxes = document.querySelectorAll('[data-location]')

// Выбор кнопки Любая и отключение других checkbox
checkboxAny.addEventListener('change', function () {
    if (checkboxAny.checked) {
        topLocationCheckboxes.forEach(function (checkbox) {
            checkbox.checked = false
        })
    }
})

// Клик по кнопкам в location. Отключаем кнопку любая при выборе других параметров
topLocationCheckboxes.forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
        checkboxAny.checked = false
    })
})

// Показать еще 3 доп опции с чекбоксами в фильтре
const showMoreOptions = document.querySelector('.widget__show-hidden')
const hiddenOptions = document.querySelectorAll('.checkbox--hidden')

function showOptions () {
    if (showMoreOptions.dataset.options === 'hidden') {
        hiddenOptions.forEach(function (option) {
            option.classList.remove('checkbox--hidden')
        })
        showMoreOptions.dataset.options = 'visible'
        showMoreOptions.innerText = 'Скрыть'
    } else {
        hiddenOptions.forEach(function (option) {
            option.classList.add('checkbox--hidden')
        })
        showMoreOptions.dataset.options = 'hidden'
        showMoreOptions.innerText = 'Показать ещё'
    }
}

showMoreOptions.addEventListener('click', showOptions)

// Реализация открытия сайдбара (фильтра) на мобильных устройствах свайпом по экрану
const main = document.querySelector('main')
const sidebar = document.querySelector('.sidebar')
const mediaQuery = window.matchMedia('(min-width: 968px)')

// Запуск функции для определения события swipe на элементе main
swipe(main, {maxTime: 1000, minTime: 100, maxDist: 150, minDist: 60})

function openMobileSidebar (e) {
    if (e.detail.dir === 'right') {
        sidebar.classList.add('sidebar--active')
    } else if (e.detail.dir === 'left') {
        sidebar.classList.remove('sidebar--active')
    }
}

main.addEventListener('swipe', openMobileSidebar)

// Удаление обработчика события swipe для desktop-ов
if (mediaQuery.matches) {
    console.log('Swipe event handler removed for desktop PCs')
    main.removeEventListener('swipe', openMobileSidebar)
}