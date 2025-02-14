document.addEventListener("DOMContentLoaded", function () {
    const pmInput = document.getElementById("pmValue");
    const trainingFrequencySelect = document.getElementById("trainingFrequency");
    const updateBtn = document.getElementById("updateBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const tableBody = document.getElementById("trainingTable");

    // Функция для загрузки сохраненных данных
    function loadSavedData() {
        const savedPM = localStorage.getItem("pmValue");
        const savedFrequency = localStorage.getItem("trainingFrequency");
        const savedTable = localStorage.getItem("trainingTable");

        if (savedPM) pmInput.value = savedPM;
        if (savedFrequency) trainingFrequencySelect.value = savedFrequency;
        if (savedTable) {
            tableBody.innerHTML = savedTable;
            addInputListeners(); // Повторно привязываем обработчики ввода
        }
    }

    // Функция для сохранения данных в локальное хранилище
    function saveData() {
        localStorage.setItem("pmValue", pmInput.value);
        localStorage.setItem("trainingFrequency", trainingFrequencySelect.value);
        localStorage.setItem("trainingTable", tableBody.innerHTML);
    }

    // Функция расчета рабочего веса и объема
    function calculateWeightAndVolume(pm, percentage, setsInput, repsInput) {
        const weight = (pm * (percentage / 100)).toFixed(1); // Рассчитываем вес

        // Преобразуем введенные данные (например, "1+2+3" → [1, 2, 3])
        const sets = setsInput.split("+").map(Number);
        const reps = repsInput.split("+").map(Number);

        if (sets.includes(NaN) || reps.includes(NaN)) return ["Ошибка", "Ошибка"];

        const totalSets = sets.reduce((sum, num) => sum + num, 0);
        const totalReps = reps.reduce((sum, num) => sum + num, 0);
        const volume = totalSets * totalReps;

        return [weight, volume];
    }

    // Функция обновления таблицы
    function updateTable() {
        const trainingFrequency = parseInt(trainingFrequencySelect.value);
        const pm = parseFloat(pmInput.value);

        tableBody.innerHTML = ""; // Очищаем таблицу

        for (let week = 1; week <= 4; week++) {
            for (let day = 1; day <= trainingFrequency; day++) {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>Неделя ${week}</td>
                    <td>Тренировка ${day}</td>
                    <td><input type="text" class="percentage" placeholder="%" size="4"></td>
                    <td><input type="text" class="sets" placeholder="Подходы" size="6"></td>
                    <td><input type="text" class="reps" placeholder="Повторения" size="6"></td>
                    <td class="kg">-</td>
                    <td class="volume">-</td>
                `;

                tableBody.appendChild(row);
            }
        }
        addInputListeners();
        saveData();
    }

    // Функция привязки обработчиков ввода
    function addInputListeners() {
        const percentageInputs = document.querySelectorAll(".percentage");
        const setsInputs = document.querySelectorAll(".sets");
        const repsInputs = document.querySelectorAll(".reps");

        function recalculate() {
            const pm = parseFloat(pmInput.value);
            const rows = document.querySelectorAll("#trainingTable tr");

            rows.forEach(row => {
                const percentage = row.querySelector(".percentage").value;
                const sets = row.querySelector(".sets").value;
                const reps = row.querySelector(".reps").value;
                const kgCell = row.querySelector(".kg");
                const volumeCell = row.querySelector(".volume");

                if (percentage && sets && reps) {
                    const [weight, volume] = calculateWeightAndVolume(pm, parseFloat(percentage), sets, reps);
                    kgCell.textContent = `${weight} кг`;
                    volumeCell.textContent = `${volume} повторений`;
                } else {
                    kgCell.textContent = "-";
                    volumeCell.textContent = "-";
                }
            });

            saveData();
        }

        percentageInputs.forEach(input => input.addEventListener("input", recalculate));
        setsInputs.forEach(input => input.addEventListener("input", recalculate));
        repsInputs.forEach(input => input.addEventListener("input", recalculate));
    }

    // Функция скачивания таблицы в CSV
    function downloadTable() {
        let csv = "Неделя,Тренировка,ПМ (%),Подходы,Повторения,Кг,Объем\n";
        document.querySelectorAll("#trainingTable tr").forEach(row => {
            let rowData = [];
            row.querySelectorAll("td, input").forEach(cell => {
                if (cell.tagName === "INPUT") {
                    rowData.push(cell.value);
                } else {
                    rowData.push(cell.textContent);
                }
            });
            csv += rowData.join(",") + "\n";
        });

        // Создание CSV файла и инициирование скачивания
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "training_plan.csv";
        document.body.appendChild(a); // Нужно добавить на страницу перед нажатием
        a.click();
        document.body.removeChild(a); // Удаляем ссылку после скачивания
        URL.revokeObjectURL(url); // Отзываем URL для освобождения ресурсов
    }

    // Слушатели событий
    updateBtn.addEventListener("click", updateTable);
    downloadBtn.addEventListener("click", downloadTable);
    pmInput.addEventListener("input", saveData);
    trainingFrequencySelect.addEventListener("change", saveData);

    loadSavedData();
    updateTable();
});