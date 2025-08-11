// Отправка высоты содержимого в родительское окно (Tilda)
function sendHeightToParent() {
    const height = document.body.scrollHeight;
    window.parent.postMessage({
        type: 'setIframeHeight',
        height: height
    }, '*');
}

function setupHighDPICanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Устанавливаем размер canvas в пикселях (с учетом DPR)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Масштабируем контекст
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    // Возвращаем CSS-размеры к исходным
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    return ctx;
}

// Вызываем при:
// 1. Загрузке страницы
window.addEventListener('load', sendHeightToParent);

// 2. Изменении контента (напр. при появлении рекомендаций)
new MutationObserver(sendHeightToParent).observe(document.body, {
    childList: true,
    subtree: true
});

// 3. Ресайзе окна
window.addEventListener('resize', sendHeightToParent);

// Ждем полной загрузки страницы
window.addEventListener('load', function() {
    // Функция инициализации, которая будет вызвана после проверки элементов
    function initWheel() {
        // 1. Инициализация Canvas
        const canvas = document.getElementById('wheel');
        const ctx = setupHighDPICanvas(canvas);
        const wheelContainer = document.querySelector('.wheel-container');
        
        let wheelSize = 700;
        let center = wheelSize / 2;
        let radius = wheelSize * 0.4;
        
        // Создаем спейсер
        const recommendationsContainer = document.getElementById('recommendations-content');
        const spacer = document.createElement('div');
        spacer.id = 'recommendations-spacer';
        spacer.style.minHeight = '0';
        spacer.style.transition = 'min-height 0.3s ease';
        recommendationsContainer.insertAdjacentElement('afterend', spacer);
    
        // 2. Категории и иконки (с раздельными названиями для секторов и рекомендаций)
        const categories = [
            { 
                sectorName: "Здоровье и<br/>физическое состояние", 
                recName: "Здоровье и физическое состояние",
                icon: "https://static.tildacdn.com/tild3737-6366-4339-b034-636463343939/photo.png" 
            },
            { 
                sectorName: "Жизненная<br/>энергия", 
                recName: "Жизненная энергия",
                icon: "https://static.tildacdn.com/tild3330-3431-4363-b833-323564633966/photo.png" 
            },
            { 
                sectorName: "Внешний вид<br/>и уверенность в себе", 
                recName: "Внешний вид и уверенность в себе",
                icon: "https://static.tildacdn.com/tild3239-3336-4131-b761-376634653362/-.png" 
            },
            { 
                sectorName: "Семейные<br/>отношения", 
                recName: "Семейные отношения",
                icon: "https://static.tildacdn.com/tild3064-3830-4630-b831-326364306633/photo.png" 
            },
            { 
                sectorName: "Социальные связи<br/>и отношения", 
                recName: "Социальные связи и отношения",
                icon: "https://static.tildacdn.com/tild3632-3634-4333-a464-343934303539/photo.png" 
            },
            { 
                sectorName: "Личностный рост<br/>и развитие", 
                recName: "Личностный рост и развитие",
                icon: "https://static.tildacdn.com/tild3830-3532-4662-b037-623336353038/photo.png" 
            },
            { 
                sectorName: "Работа<br/>и карьера", 
                recName: "Работа и карьера",
                icon: "https://static.tildacdn.com/tild3731-3065-4436-b365-623062663037/photo.png" 
            },
            { 
                sectorName: "Финансовое<br/>благополучие", 
                recName: "Финансовое благополучие",
                icon: "https://static.tildacdn.com/tild6365-3563-4238-b530-633230343162/photo.png" 
            },
            { 
                sectorName: "Отдых и<br/>восстановление", 
                recName: "Отдых и восстановление",
                icon: "https://static.tildacdn.com/tild3633-6565-4239-a137-333265383366/photo.png" 
            },
            { 
                sectorName: "Духовное<br/>развитие<br/>и ценности", 
                recName: "Духовное развитие и ценности",
                icon: "https://static.tildacdn.com/tild3363-6365-4938-a262-656331383232/photo.png" 
            }
        ];

        // 3. Начальные значения
        const values = Array(categories.length).fill(0);

        // 4. Полные рекомендации
        const fullRecommendations = [
            { // Здоровье и физическое состояние
                1: `<ul><li><b>Реабилитолог:</b> поможет устранить болевые синдромы, восстановить двигательную активность, укрепить спину и другие группы мышц.</li>
<li><b>Тренер:</b> сформирует программу тренировок для укрепления мышечного каркаса и повышения функциональности тела.</li>
<li><b>Нутрициолог-эндокринолог:</b> скорректирует питание, устранит дефициты, нормализует гормональный фон для общего улучшения здоровья.</li></ul>`,
                5: `<ul><li><b>Реабилитолог:</b> оптимизирует состояние мышечного каркаса и скорректирует остаточные нарушения в осанке.</li>
<li><b>Тренер:</b> повысит физическую выносливость и поможет достичь более выраженного рельефа.</li>
<li><b>Нутрициолог-эндокринолог:</b> поможет поддержать сбалансированное питание и здоровье организма для повышения энергичности.</li></ul>`,
                9: `<ul><li><b>Реабилитолог:</b> усовершенствует работу мышц и суставов, предотвратит возможные осложнения.</li>
<li><b>Тренер:</b> поддержит уже достигнутую физическую форму через вариативные тренировки и мотивацию.</li>
<li><b>Нутрициолог-эндокринолог:</b> адаптирует питание для поддержания высокого уровня здоровья и энергии.</li></ul>`
            },
            { // Жизненная энергия
                1: `<ul><li><b>Психолог:</b> устранит тревожность, поможет справляться с эмоциональным выгоранием, восстановить ментальную устойчивость.</li>
<li><b>Нутрициолог:</b> устранит биохимические причины усталости, скорректирует питание для повышения уровня энергии.</li></ul>`,
                5: `<ul><li><b>Психолог:</b> поможет избавиться от остаточных стрессовых факторов, выстроит эффективные механизмы управления энергией.</li>
<li><b>Нутрициолог:</b> поможет поддерживать баланс нутриентов и повысить общий тонус организма.</li></ul>`,
                9: `<ul><li><b>Психолог:</b> поможет поддерживать эмоциональную устойчивость, развить навыки предотвращения стресса.</li>
<li><b>Нутрициолог:</b> внедрит дополнительные корректировки для оптимального уровня энергии.</li></ul>`
            },
            { // Внешний вид и уверенность в себе
                1: `<ul><li><b>Психолог:</b> поможет стать увереннее, устранит внутренние блоки и негативное восприятие внешности.</li>
<li><b>Тренер:</b> поможет улучшить физическую форму, укрепить тело и повысить его привлекательность.</li>
<li><b>Нутрициолог:</b> скорректирует питание для улучшения состояния кожи, волос и общего внешнего вида.</li></ul>`,
                5: `<ul><li><b>Психолог:</b> поможет углубленно проработать укрепление самооценки и развить позитивное отношения к себе.</li>
<li><b>Тренер:</b> поможет достичь более выраженных результатов в улучшении физической форме.</li>
<li><b>Нутрициолог:</b> поддержит оптимальное состояние организма через питание и устранение скрытых дефицитов.</li></ul>`,
                9: `<ul><li><b>Психолог:</b> поможет усовершенствовать эмоциональное восприятие своего образа.</li>
<li><b>Тренер:</b> поддержит имеющийся результат, добавляя вариативность и стимулируя мотивацию.</li>
<li><b>Нутрициолог:</b> поможет сохранить и улучшить достигнутый уровень внешнего вида (ведь совершенству нет предела).</li></ul>`
            },
            { // Семейные отношения
                1: `<ul><li><b>Психолог:</b> поможет наладить коммуникацию в семье, разобраться в эмоциональных конфликтах и улучшить взаимопонимание.</li>
<li><b>Нутрициолог:</b> устранит гормональные дисбалансы, влияющие на эмоциональное состояние и терпимость в отношениях.</li></ul>`,
                5: `<ul><li><b>Психолог:</b> поможет углубить эмоциональную близость, поможет развивать позитивные семейные привычки.</li>
<li><b>Нутрициолог:</b> поможет поддерживать стабильное эмоциональное состояние через сбалансированное питание.</li></ul>`,
                9: `<ul><li><b>Психолог:</b> поможет сохранять гармонию в отношениях через регулярные сессии.</li>
<li><b>Нутрициолог:</b> составит варианты питания для поддержания гормонального баланса и эмоционального равновесия.</li></ul>`
            },
            { // Социальные связи и отношения
                1: `<ul><li><b>Психолог:</b> поможет развить социальные навыки и устранить тревожности при общении.</li>
<li><b>Тренер:</b> поможет обрести уверенность в себе через улучшение физической формы.</li>
<li><b>Нутрициолог:</b> устранит биохимические причины перепадов настроения, способствующих ухудшению коммуникации с окружением.</li></ul>`,
                5: `<ul><li><b>Психолог:</b> поможет углубить социальные связи и улучшить работу над построением крепких отношений.</li>
<li><b>Тренер:</b> поможет поддержать уверенность в физической форме и мотивирует к активности.</li>
<li><b>Нутрициолог:</b> поможет стабилизировать гормональный баланс для поддержания социальной активности.</li></ul>`,
                9: `<ul><li><b>Психолог:</b> поможет укрепить уже существующие социальные связи.</li>
<li><b>Тренер:</b> поможет поддержать высокую физическую активность для уверенности.</li>
<li><b>Нутрициолог:</b> поможет сохранить эмоциональную стабильность.</li></ul>`
            },
            { // Личностный рост и развитие
                1: `<ul><li><b>Психолог:</b> поможет разобраться с внутренними блоками, страхами и неуверенностью, мешающими росту.</li></ul>`,
                5: `<ul><li><b>Психолог:</b> поможет в развитие новых навыков, определять и достигать личных целей.</li></ul>`,
                9: `<ul><li><b>Психолог:</b> поможет стимулировать личностный рост через новые задачи и вызовы.</li></ul>`
            },
            { // Работа и карьера
                1: `<ul><li><b>Психолог:</b> поможет устранить внутренние барьеры, влияющие на профессиональное развитие, провеет работу с мотивацией и стрессом.</li></ul>`,
                5: `<ul><li><b>Психолог:</b> поможет развивать лидерские качества, выстроить баланс между работой и личной жизнью.</li></ul>`,
                9: `<ul><li><b>Психолог:</b> поддержит на пути профессионального совершенствования и работы с карьерными амбициями.</li></ul>`
            },
            { // Финансовое благополучие
                1: `<ul><li><b>Психолог:</b> проработает ограничивающие убеждения, связанные с деньгами, поможет наладить финансовое мышление.</li></ul>`,
                5: `<ul><li><b>Психолог:</b> поддержит в формировании стратегий достижения финансовых целей и сохранении мотивации.</li></ul>`,
                9: `<ul><li><b>Психолог:</b> поможет улучшить финансовое мышление, укрепляя долгосрочные стратегии.</li></ul>`
            },
            { // Отдых и восстановление
                1: `<ul><li><b>Тренер:</b> поможет внедрить активный отдых через упражнения и движения.</li>
<li><b>Нутрициолог:</b> поможет наладить режим питания и восстановление для повышения качества сна и отдыха.</li></ul>`,
                5: `<ul><li><b>Тренер:</b> поможет улучшить уровень физической активности для отдыха.</li>
<li><b>Нутрициолог:</b> поможет поддерживать высокий уровень энергии через правильное питание.</li></ul>`,
                9: `<ul><li><b>Тренер:</b> поможет поддерживать активность и предоставит вариативность выбора активности для отдыха.</li>
<li><b>Нутрициолог:</b> поможет обеспечить баланс питательных веществ для качественного восстановления.</li></ul>`
            },
            { // Духовное развитие и ценности
                1: `<ul><li><b>Психолог:</b> поможет разобраться с жизненными приоритетами, осознать внутренние потребности и ценности.</li></ul>`,
                5: `<ul><li><b>Психолог:</b> поддержит в развитии осознанности, поможет выстроить гармонию между внутренним и внешним миром.</li></ul>`,
                9: `<ul><li><b>Психолог:</b> поможет раскрыть глубинный потенциал через расширение осознанности и гармонии.</li></ul>`
            }
        ];

        // 5. Цвета категорий
        function getCategoryColor(categoryName) {
            const colorMap = {
                "Жизненная<br/>энергия": {hue: 30, saturation: 100, lightness: 50},
                "Здоровье и<br/>физическое состояние": {hue: 120, saturation: 100, lightness: 40},
                "Духовное<br/>развитие<br/>и ценности": {hue: 60, saturation: 100, lightness: 50},
                "Отдых и<br/>восстановление": {hue: 350, saturation: 100, lightness: 80},
                "Финансовое<br/>благополучие": {hue: 80, saturation: 100, lightness: 30},
                "Личностный рост<br/>и развитие": {hue: 270, saturation: 100, lightness: 50},
                "Социальные связи<br/>и отношения": {hue: 180, saturation: 100, lightness: 70},
                "Семейные<br/>отношения": {hue: 0, saturation: 100, lightness: 50},
                "Внешний вид<br/>и уверенность в себе": {hue: 240, saturation: 100, lightness: 50},
                "Работа<br/>и карьера": {hue: 200, saturation: 100, lightness: 50}
            };
            return colorMap[categoryName] || {hue: 0, saturation: 0, lightness: 50};
        }

        function getSectorColor(value, maxValue, categoryName) {
            const intensity = value / maxValue;
            const baseColor = getCategoryColor(categoryName);
            const lightness = baseColor.lightness - (20 * intensity);
            return `hsl(${baseColor.hue}, ${baseColor.saturation}%, ${lightness}%)`;
        }

        // 6. Переменные для взаимодействия
        let hoveredSector = null;
        let hoveredValue = null;
        let draggedCircle = null;
        let isDragging = false;
        let lastHoveredSector = null;

        // 7. Функция позиционирования меток категорий
        function positionCategoryLabels() {
            document.querySelectorAll('.category-label').forEach(el => el.remove());
            
            const labelDistance = radius * 0.25;
            const labelWidth = wheelSize * 0.24;
            const labelHeight = wheelSize * 0.1;
            
            for (let i = 0; i < categories.length; i++) {
                const sectorAngle = (2 * Math.PI) / categories.length;
                const angle = i * sectorAngle + sectorAngle / 2;
                
                const circleX = center + Math.cos(angle) * (radius + labelDistance);
                const circleY = center + Math.sin(angle) * (radius + labelDistance);
                
                const labelEl = document.createElement('div');
                labelEl.className = 'category-label';
                
                const iconEl = document.createElement('img');
                iconEl.className = 'category-icon';
                iconEl.src = categories[i].icon;
                iconEl.alt = categories[i].recName;
                iconEl.style.width = `${wheelSize * 0.055}px`;
                iconEl.style.height = `${wheelSize * 0.055}px`;
                labelEl.appendChild(iconEl);
                
                const nameEl = document.createElement('div');
                nameEl.className = 'category-name';
                nameEl.innerHTML = categories[i].sectorName;
                nameEl.style.fontSize = `${wheelSize * 0.018}px`;
                labelEl.appendChild(nameEl);
                
                labelEl.style.left = `${circleX - labelWidth/2}px`;
                labelEl.style.top = `${circleY - labelHeight/2}px`;
                labelEl.style.width = `${labelWidth}px`;
                labelEl.style.height = `${labelHeight}px`;
                
                document.querySelector('.wheel-container').appendChild(labelEl);
            }
        }

// 8. Функция отрисовки колеса
function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Включение сглаживания
    ctx.imageSmoothingEnabled = true;
    ctx.webkitImageSmoothingEnabled = true;
    ctx.mozImageSmoothingEnabled = true;
        
    const angle = (2 * Math.PI) / categories.length;
    const segmentWidth = radius / 10;
    
    // Рисуем сектора
    for (let ring = 1; ring <= 10; ring++) {
        const innerRadius = (ring - 1) * segmentWidth;
        const outerRadius = ring * segmentWidth;
        
        for (let i = 0; i < categories.length; i++) {
            ctx.beginPath();
            ctx.arc(center, center, outerRadius, i * angle, (i + 1) * angle);
            ctx.arc(center, center, innerRadius, (i + 1) * angle, i * angle, true);
            ctx.closePath();
            
            const isActive = values[i] >= ring;
            ctx.fillStyle = isActive ? getSectorColor(ring, 10, categories[i].sectorName) : '#363436';
            ctx.fill();
            
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
    }
    
    positionCategoryLabels();
    
    // Отрисовываем цифры значений (всегда видимые)
    for (let i = 0; i < categories.length; i++) {
        if (values[i] > 0) {
            const valueAngle = i * angle + angle / 2;
            const valueRadius = (values[i] / 10) * radius - 15;
            
            const x = center + Math.cos(valueAngle) * valueRadius;
            const y = center + Math.sin(valueAngle) * valueRadius;
            
            // Сама цифра
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(values[i], x, y);
        }
    }
    
    // Рисуем hover-эффект и динамическую цифру
    if (hoveredSector !== null && !isDragging) {
        const sectorAngle = (2 * Math.PI) / categories.length;
        const angleStart = hoveredSector * sectorAngle;
        const angleEnd = (hoveredSector + 1) * sectorAngle;
        const valueRadius = (hoveredValue / 10) * radius;

        // Полупрозрачный слой
        ctx.beginPath();
        ctx.arc(center, center, valueRadius, angleStart, angleEnd);
        ctx.lineTo(center, center);
        ctx.closePath();
        ctx.fillStyle = 'rgba(167, 61, 189, 0.2)';
        ctx.fill();

        // Контур
        ctx.beginPath();
        ctx.arc(center, center, valueRadius, angleStart, angleEnd);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#A73DBD';
        ctx.stroke();
        
        // Динамическая цифра при наведении
        const hoverX = center + Math.cos(hoveredSector * angle + angle / 2) * (valueRadius - 15);
        const hoverY = center + Math.sin(hoveredSector * angle + angle / 2) * (valueRadius - 15);
        
        // Белый кружок под цифрой
        //ctx.beginPath();
        //ctx.arc(hoverX, hoverY, 10, 0, Math.PI * 2);
        //ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        //ctx.fill();
        
        // Сама цифра
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hoveredValue, hoverX, hoverY);
    }
}
        
        
        // 9. Функция получения рекомендаций
        function getRecommendation(categoryIndex, value) {
            const recommendations = fullRecommendations[categoryIndex];
            window.parent.postMessage({
                type: 'getRecommendation',
                height: [recommendations, value, recommendations[value]]
            }, '*');
            if (value <= 4) return recommendations[1];
            if (value <= 8) return recommendations[5];
            return recommendations[9];
        }

        // 10. Функция обновления результатов
function updateResults() {
    const resultsContainer = document.getElementById('results-container');
    const recommendationsContent = document.getElementById('recommendations-content');
    resultsContainer.style.opacity = '0';
    recommendationsContent.style.opacity = '0';
    setTimeout(() => {
        let resultsHTML = '';
        let recommendationsHTML = '';
        let hasResults = false;
        for (let i = 0; i < categories.length; i++) {
            if (values[i] > 0) {
                hasResults = true;
                resultsHTML += `
                    <div class="result-item">
                        <span class="result-category">${categories[i].recName}</span>
                        <span class="result-value">${values[i]}/10</span>
                    </div>
                `;

                const recommendation = getRecommendation(i, values[i]);

                // Получаем цвет категории
const categoryColor = getCategoryColor(categories[i].sectorName);
const bgColor = `hsl(${categoryColor.hue}, ${categoryColor.saturation}%, ${categoryColor.lightness}%)`;


                recommendationsHTML += `
                    <div class="category" style="background-color: ${bgColor}; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
                        <h3>${categories[i].recName} (${values[i]}/10)</h3>
                        <div class="recommendation-text">${recommendation}</div>
                    </div>
                `;
            }
        }

        // Добавляем заголовок после всех result-item
        resultsHTML += '<p class="recommendations-title">Как специалисты True Team улучшат ваши сферы жизни:</p>';

        if (hasResults) {
            const recommendationCount = (recommendationsHTML.match(/class="category"/g) || []).length;
            document.getElementById('recommendations-spacer').style.minHeight = `${recommendationCount * 1}px`;
        } else {
            document.getElementById('recommendations-spacer').style.minHeight = '0';
        }

        resultsContainer.innerHTML = resultsHTML;
        recommendationsContent.innerHTML = recommendationsHTML;

        setTimeout(() => {
            resultsContainer.style.opacity = '1';
            recommendationsContent.style.opacity = '1';
        }, 50);
    }, 300);
}

        // 11. Обработчики событий
        canvas.addEventListener('mousemove', function(e) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (isDragging && draggedCircle !== null) {
                const dx = x - center;
                const dy = y - center;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                const newDistance = Math.min(distance, radius);
                const value = Math.min(10, Math.max(1, Math.round((newDistance / radius) * 10)));
                
                values[draggedCircle] = value;
                drawWheel();
                updateResults();
                return;
            }
            
            const dx = x - center;
            const dy = y - center;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > radius) {
                hoveredSector = null;
                hoveredValue = null;
                if (lastHoveredSector !== null) {
                    lastHoveredSector = null;
                    drawWheel();
                }
                return;
            }
            
            let angle = Math.atan2(dy, dx);
            if (angle < 0) angle += 2 * Math.PI;
            
            const sectorAngle = (2 * Math.PI) / categories.length;
            const sectorIndex = Math.floor(angle / sectorAngle);
            const value = Math.min(10, Math.max(1, Math.ceil((distance / radius) * 10)));
            
            if (hoveredSector !== sectorIndex || hoveredValue !== value) {
                hoveredSector = sectorIndex;
                hoveredValue = value;
                lastHoveredSector = sectorIndex;
                drawWheel();
            }
        });

        canvas.addEventListener('mousedown', function(e) {
            if (hoveredSector !== null) {
                draggedCircle = hoveredSector;
                isDragging = true;
                values[hoveredSector] = hoveredValue;
                drawWheel();
                updateResults();
            }
        });

        canvas.addEventListener('mouseup', function() {
            isDragging = false;
            draggedCircle = null;
        });

        canvas.addEventListener('mouseleave', function() {
            isDragging = false;
            draggedCircle = null;
            hoveredSector = null;
            hoveredValue = null;
            if (lastHoveredSector !== null) {
                lastHoveredSector = null;
                drawWheel();
            }
        });

        // 12. Обработчик изменения размера окна
        function handleResize() {
            const containerWidth = document.querySelector('.container').clientWidth;
            
    if (containerWidth >= 1024) wheelSize = 700; // Было 600
    else if (containerWidth >= 768) wheelSize = 600; // Было 500
    else if (containerWidth >= 600) wheelSize = 500; // Новый breakpoint
    else if (containerWidth >= 480) wheelSize = 400; // Было 300
    else wheelSize = 350;
            
            // Применяем высокое DPI при ресайзе
            setupHighDPICanvas(canvas);
            
            center = wheelSize / 2;
            radius = wheelSize * 0.4;
            
            wheelContainer.style.width = wheelSize + 'px';
            wheelContainer.style.height = wheelSize + 'px';
            
            drawWheel();
        }

        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 100);
        });

        // 14. Инициализация
        handleResize();
        updateResults();

        // Переносим вызов функций инициализации в конец
        function init() {
            handleResize();
            updateResults();
        }

        // Запускаем инициализацию
        init();
        handleResize();
        updateResults();
    }

    // Проверяем наличие элементов с задержкой для Tilda
    function checkElements() {
        const neededElements = [
            '.wheel-container',
            '#wheel',
            '#recommendations-content',
            '#results-container'
        ];
        
        const allExist = neededElements.every(selector => {
            return document.querySelector(selector) !== null;
        });
        
        if (allExist) {
            initWheel();
        } else {
            // Повторяем проверку через 100мс, если элементы не найдены
            setTimeout(checkElements, 100);
        }
    }

    // Начинаем проверку элементов
    checkElements();
});
