"use strict"

/* 
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


// document.querySelector('.menu-icon').addEventListener('click', function () {
//     const sidebar = document.querySelector('.sidebar')
    
//     if (!this.classList.contains('open')) {
//         this.classList.add('open')
//         sidebar.style.transform = 'translate(0%)'
//     } else {
//         this.classList.remove('open')
//         sidebar.style.transform = 'translate(-150%)'
//     }
    
// })

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
showMoreOptions.addEventListener('click', function () {
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
})