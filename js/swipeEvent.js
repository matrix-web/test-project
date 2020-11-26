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

        // console.log(support.touch)
        console.log(support.pointer)

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
            
            for (const value in events) {
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

const main = document.querySelector('main')
const sidebar = document.querySelector('.sidebar')
swipe(main, {maxTime: 1000, minTime: 100, maxDist: 150, minDist: 60})
main.addEventListener('swipe', function(e) {
    console.log(e.detail)

    if (e.detail.dir === 'right') {
        sidebar.classList.add('sidebar--active')
    } else if (e.detail.dir === 'left') {
        sidebar.classList.remove('sidebar--active')
    }
})