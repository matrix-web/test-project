/** 
    * Функция определения события swipe на элементе.
    * @param {Object} el - элемент DOM
    * @param {Object} settings - объект с предварительными настройками
*/
const swipe = function (el, setting) {
    // Настройки по умолчанию
    const settings = Object.assign({}, {
        minDist: 60, // Минимальная дистанция, которую должен пройти указатель, чтобы жесть считался как свайп (px)
        maxDist: 120, // Максимальная дистанция, не превышая которую может пройти указатель, чтобы жест считался как свайп (px)
        maxTime: 700, // Максимальное время, за которое должен быть совершен свайп(ms)
        minTime: 50 // Минимальное время, за которое должен быть совершен свайп (ms)
    }, setting)

    // Коррекция времени при ошибочных значениях
    if (settings.maxTime < settings.minTime) {
        settings.maxTime = settings.minTime + 500
    }

    if (settings.maxTime < 100 || settings.minTime < 50) {
        settings.maxTime = 700
        settings.minTime = 50
    }

    let events = null
    let dir // направление свайпа (horizontal, vertical)
    let swipeType // тип свайпа (up, down, left, right)
    let dist // дистанция, пройденная указателем
    let isMouse = false // поддержка мыши (не используется тач-событий)
    let isMouseDown = false // указание на активное нажатие мыши (Не используется для тач-событий)
    let startX = 0 // Начало координат по оси X (pageX)
    let distX = 0 // Дистанция, пройденная указателем по оси X
    let startY = 0 // Начало координат по оси Y (pageY)
    let distY = 0 // Дистанция, пройденная указателем по оси Y
    let startTime = 0 // Время начала касания
    let support = { // поддерживаемые браузером типы событий
        pointer: !!("PointerEvent" in window || ("msPointerEnabled" in window.navigator)),
        touch: !!(typeof window.orientation !== "undefined" || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || "ontouchstart" in window || navigator.msMaxTouchPoints || "maxTouchPoints" in window.navigator > 1 || "msMaxTouchPoints" in window.navigator > 1)
    };

    /**
     * Опредление доступных в браузере событий: pointer, touch и mouse.
     * @returns {Object} - возвращает объект с доступными событиями.
    */
    const getSupportedEvents = function () {

        switch(true) {
            case support.pointer:
                events = {
                    type: 'pointer',
                    start: 'PointerDown',
                    move: 'PointerMove',
                    end: 'PointerUp',
                    cancel: 'PointerCancel',
                    leave: 'PointerLeave'
                }

                // Добавление префиксов для IE10
                let ie10 = (window.navigator.msPointerEnabled && Function('/*@cc_on return document.documentMode===10@*/')())
                for(let value in events) {
                    if (value === 'type') continue
                    events[value] = (ie10) ? 'MS' + events[value] : events[value].toLowerCase()
                }
            break
            case support.touch:
                events = {
                    type: 'touch',
                    start: 'touchstart',
                    move: 'touchmove',
                    end: 'touchend',
                    cancel: 'touchcancel'
                }
            break
            default:
                events = {
                    type: "mouse",
                    start: 'mousedown',
                    move: 'mousemove',
                    end: 'mouseup',
                    leave: 'mouseleave'
                }
            break
        }

        return events
    }

    /**
        * Объединение событий mouse/pointer и touch
        * @param e {object} - принимает в качестве аргумента событие
        * @returns {TouchList|e} возвращает либо TouchList, либо оставляет событие без изменения
    */
    const eventsUnify = function (e) {
        return e.changedTouches ? e.changedTouches[0] : e
    }

    /**
     * Обрабочик начала касания указателем.
     * @param e {Event} - получает событие.
    */
    const checkStart = function (e) {
        let event = eventsUnify(e)

        if (support.touch && typeof e.touches !== 'undefined' && e.touches.length !== 1) {
            return //игнорирование касания несколькими пальцами
        }
        dir = 'none'
        swipeType = 'none'
        dist = 0
        startX = event.pageX
        startY = event.pageY
        startTime = new Date().getTime()
        if (isMouse) {
            isMouseDown = true // поддержка мыши
        }
    }

    /**
     * Обработчик движения указателя.
     * @param e {Event} - получает событие.
    */
    const checkMove = function (e) {
        // Выход из функции, если мышь перестала быть активна во время движения
        if (isMouse && !isMouseDown) {
            return
        }

        let event = eventsUnify(e)
        distX = event.pageX - startX
        distY = event.pageY - startY
        if (Math.abs(distX) > Math.abs(distY)) {
            dir = (distX < 0) ? 'left' : 'right'
        } else {
            dir = (distY < 0) ? 'up' : 'down'
        }
    }

    /**
     * Обработчик окончания касания указателем.
     * @param e {Event} - получает событие.
     */
    const checkEnd = function (e) {
        // Выход из функции и сброс проверки нажатия мыши
        if (isMouse && !isMouseDown) {
            isMouseDown = false
            return
        }
        let endTime = new Date().getTime()
        let time = endTime - startTime
        // Проверка времени жеста
        if (time >= settings.minTime && time <= settings.maxTime) {
            if (Math.abs(distX) >= settings.minDist && Math.abs(distY) <= settings.maxDist) {
                swipeType = dir // Определение типа свайпа как "left" или "right"
            } else if (Math.abs(distY) >= settings.minDist && Math.abs(distX) <= settings.maxDist) {
                swipeType = dir // Определение типа свайпа как "top" или "down"
            }
        }
        dist = (dir === 'left' || dir === 'right') ? Math.abs(distX) : Math.abs(distY) // Определение пройденной указателем дистанции

        // Генерация кастомного события swipe
        if (swipeType !== 'none' && dist >= settings.minDist) {
            let swipeEvent = new CustomEvent('swipe', {
                bubbles: true,
                cancelable: true,
                detail: {
                    full: e, // Полное событие Event
                    dir: swipeType, // направление свайпа
                    dist: dist, // дистанция свайпа
                    time: time // время, потраченное на свайп
                }
            })
            el.dispatchEvent(swipeEvent)
        }
    }

    // Добавление поддерживаемых событий
    let  = getSupportedEvents()

    // Провека наличия мыши
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

const mainElement = document.querySelector('main')
const sidebar = document.querySelector('.sidebar')
// const mediaQuery = window.matchMedia('(min-width: 968px)')
swipe(mainElement, {maxTime: 1000, minTime: 100, maxDist: 150, minDist: 60})

// Обработка свайпов
// event is worked
mainElement.addEventListener('swipe', function (e) {
    console.log(e.detail)

    if (e.detail.dir === 'right') {
        console.log('true')
        sidebar.classList.add('sidebar--active')
    } else if (e.detail.dir === 'left') {
        sidebar.classList.remove('sidebar--active')
    }
})

const mediaQuery = window.matchMedia('(min-width: 968px)')
 
if (mediaQuery.matches) {
    console.log('Media Query Matched!')
}