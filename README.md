# Тестовое задание

## ТЗ
Выполните адаптивную верстку фрагмента сайта 1 в 1 (Pixel Perfect) с макетом, который находится по представленной ссылке.
Необходимо учесть адаптив. Макетов для адаптивной верстки нет. Как это будет выглядеть - на ваше усмотрение, но страница должна отображаться
аккуратно на всех возможных экранах. Можно использовать bootstrap или просто media-запросы.

**Учитывайте кроссбраузерность**: Opera, IE11+, FFox, Chrome, Safari (для мобильных).

**Комментарии**:
Фильтр не должен фильтровать объекты недвижимости!
Важно показать ваше умение работать с кастомными элементами.

**Подробнее по элементам**:

При нажатии "Показать еще", должна по явится еще одна строка с объектами недвижимости (в строке 3 объекта).

Блоки "Близость к метро", "Срок сдачи" и "Дополнительные опции" должны сворачиваться при клике на их название.

Элементы в блоке "Близость к метро" должны работать как checkbox - возможность выбора нескольких элементов.

При выборе "Любая" - остальные элементы этого блока очищаются и выбирается только "Любая".

Элементы в блоке "Срок сдачи" должны работать как radiobutton - возможность выбора только одного элемента из данного блока.

В блоке "Дополнительные опции", при клике "Показать еще", должно появится еще 3 элемента checkbox.

Кнопка "Сбросить фильтры" должна сбрасывать все выбранные параметры фильтра.

***

Тестовое задание выполнено по ТЗ. Дополнительно реализовано пользовательское событие **swipe** для открытия блока с фильтром на мобильных устройствах с помощью свайпа(касания по экрану) вправо и закрытия блока свайпом влево.

Функционал Открытия/Закрытия виджетов в сайдбаре можно реализовать без JavaScript используя HTML-элементы ```<details></details>``` и ```<summary></summary>```. В данном тестовом задании реализовать с помощью данных элементов виджеты не получилось из-за кроссбраузерности т.к. по ТЗ требуется поддержка браузера IE11+, а эти элементы не поддерживаюся данным браузером.

Дополнительно прилагается реализация:

**Разметка**
```html
<details class="widget">
        <summary class="widget__title">Близость к метро</summary>
        <div class="widget__body">
            <!-- location -->
            <div class="location">
                <div class="location__row">
                        <input type="checkbox" data-location id="location-01" class="location__checkbox">
                        <label class="location__btn" for="location-01">&lt; 10</label>

                        <input type="checkbox" data-location id="location-02" class="location__checkbox">
                        <label class="location__btn" for="location-02">10-20</label>

                        <input type="checkbox" data-location id="location-03" class="location__checkbox">
                        <label class="location__btn" for="location-03">20-30</label>

                        <input type="checkbox" data-location id="location-04" class="location__checkbox">
                        <label class="location__btn" for="location-04">30+</label>
                    </div>
                    <div class="location__row">
                        <input type="checkbox" id="location-05" class="location__checkbox">
                        <label class="location__btn location__btn--font-size" for="location-05">Любая</label>
                    </div>
            </div>
            <!-- location -->
        </div>
</details>
```

**Стили**
```css
details.widget + details.widget {
    margin-top: 32px;
}

summary {
    outline: none;
}

.widget__title, summary.widget__title {
    position: relative;
    margin-bottom: 20px;
    font-size: 1.125rem;
    line-height: 1.16;
    font-weight: 700;
    color: #000;
    cursor: pointer;
}

summary.widget__title::-webkit-details-marker {
    display: none;
}

summary.widget__title::after {
    content: '';
    display: inline-block;
    position: absolute;
    right: -2px;
    top: -3px;
    width: 24px;
    height: 24px;
    background-image: url('./../../img/icons/chevron-up.svg');
    background-repeat: no-repeat;
    background-size: initial;
    background-position: center;
    transition: transform .3s ease-in 0s;
}

details[open] summary.widget__title::after {
    transform: rotate(180deg);
}
```

[Demo верстки](https://matrix-web.github.io/test-project/.)

[Ссылка на макет Figma](https://www.figma.com/file/0RscNCpGBdNs83Gab7EVrM/Макет-тестовое-HTML-верстальщик---WebCademy.ru-(Copy))