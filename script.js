let totalEarnings = 0;
let totalExpenses = 0;
let workDays = [];

function addWorkDay() {
    const workDayId = `work-day-${workDays.length}`;
    const workDayDiv = document.createElement('div');
    workDayDiv.className = 'work-day-entry';
    workDayDiv.id = workDayId;
    
    workDayDiv.innerHTML = `
        <label>Date:</label>
        <input type="date" class="work-day-date">
        <label>Start Time:</label>
        <input type="time" class="work-day-start-time">
        <label>End Time:</label>
        <input type="time" class="work-day-end-time">
        <label>Hourly Rate (€):</label>
        <input type="number" class="work-day-hourly-rate" placeholder="15" value="15">
        <span class="delete-icon" onclick="removeWorkDay('${workDayId}')">✖</span>
    `;
    document.getElementById('work-day-list').appendChild(workDayDiv);
    workDays.push(workDayDiv);
}

function removeWorkDay(id) {
    const workDayDiv = document.getElementById(id);
    workDayDiv.remove();
    workDays = workDays.filter(day => day.id !== id);
    calculateTotalEarnings();
}

function calculateTotalEarnings() {
    totalEarnings = 0;
    workDays.forEach(day => {
        const startTime = day.querySelector('.work-day-start-time').value;
        const endTime = day.querySelector('.work-day-end-time').value;
        const hourlyRate = parseFloat(day.querySelector('.work-day-hourly-rate').value) || 15;

        if (startTime && endTime) {
            const start = new Date(`1970-01-01T${startTime}:00`);
            const end = new Date(`1970-01-01T${endTime}:00`);
            const hoursWorked = (end - start) / (1000 * 60 * 60);
            const totalHours = Math.floor(hoursWorked);
            const totalMinutes = Math.round((hoursWorked - totalHours) * 60);
            const earnings = hoursWorked * hourlyRate;

            totalEarnings += earnings;

            day.summary = `
                ${day.querySelector('.work-day-date').value} | 
                ${startTime} - ${endTime} | 
                ${totalHours} hrs ${totalMinutes} min | 
                <strong>€${earnings.toFixed(2)}</strong>
            `;
        }
    });
    updateGrandTotal();
}

function updateGrandTotal() {
    const grandTotal = totalEarnings + totalExpenses;
    document.getElementById('grand-total').textContent = `Grand Total: €${grandTotal.toFixed(2)}`;
}

function exportToJPG() {
    const summaryView = document.getElementById("summary-view");

    document.getElementById("summary-work-days").innerHTML = workDays.map(day => {
        return `<div>${day.summary || ""}</div>`;
    }).join("");

    document.getElementById("summary-want-to-buy").innerHTML = Array.from(document.getElementById("want-to-buy-list").children)
        .map(item => `<li>${item.textContent.replace(" ✖", "")}</li>`)
        .join("");

    document.getElementById("summary-expenses").innerHTML = Array.from(document.getElementById("expenses-list").children)
        .map(item => `<li>${item.textContent.replace(" ✖", "")}</li>`)
        .join("");

    document.getElementById("total-work-earnings").innerHTML = `<strong>${totalEarnings.toFixed(2)}</strong>`;
    document.getElementById("total-additional-expenses").textContent = totalExpenses.toFixed(2);

    const grandTotal = totalEarnings + totalExpenses;
    document.getElementById("summary-grand-total").textContent = grandTotal.toFixed(2);

    summaryView.style.display = "block";
    html2canvas(summaryView).then(canvas => {
        const link = document.createElement("a");
        link.download = "summary.jpg";
        link.href = canvas.toDataURL("image/jpeg", 0.9);
        link.click();
        summaryView.style.display = "none"; // Hide summary after export
    });
}

function addToList(listId, inputId) {
    const list = document.getElementById(listId);
    const item = document.getElementById(inputId).value;
    if (item) {
        const listItem = document.createElement('li');
        listItem.textContent = item;

        const deleteIcon = document.createElement('span');
        deleteIcon.textContent = " ✖";
        deleteIcon.classList.add('delete-icon');
        deleteIcon.onclick = () => listItem.remove();

        listItem.appendChild(deleteIcon);
        list.appendChild(listItem);

        document.getElementById(inputId).value = '';
    }
}

function addExpense() {
    const item = document.getElementById('expense-item').value;
    const cost = parseFloat(document.getElementById('expense-cost').value);

    if (item && cost) {
        const expensesList = document.getElementById('expenses-list');
        const listItem = document.createElement('li');
        listItem.textContent = `${item} - €${cost.toFixed(2)}`;

        const deleteIcon = document.createElement('span');
        deleteIcon.textContent = " ✖";
        deleteIcon.classList.add('delete-icon');
        deleteIcon.onclick = () => {
            listItem.remove();
            totalExpenses -= cost;
            updateGrandTotal();
        };

        listItem.appendChild(deleteIcon);
        expensesList.appendChild(listItem);

        totalExpenses += cost;
        document.getElementById('expense-item').value = '';
        document.getElementById('expense-cost').value = '';
        updateGrandTotal();
    }
}

function clearForm() {
    document.getElementById('work-day-list').innerHTML = '';
    document.getElementById('want-to-buy-list').innerHTML = '';
    document.getElementById('expenses-list').innerHTML = '';
    totalEarnings = 0;
    totalExpenses = 0;
    updateGrandTotal();
    workDays = [];
}

function newForm() {
    if (confirm("Are you sure you want to create a new form? This will clear all current data.")) {
        clearForm();
    }
}

function saveData() {
    const workDaysData = workDays.map(day => ({
        date: day.querySelector('.work-day-date').value,
        startTime: day.querySelector('.work-day-start-time').value,
        endTime: day.querySelector('.work-day-end-time').value,
        hourlyRate: day.querySelector('.work-day-hourly-rate').value
    }));
    
    const wantToBuyItems = Array.from(document.getElementById('want-to-buy-list').children)
        .map(item => item.textContent.replace(" ✖", ""));

    const additionalExpenses = Array.from(document.getElementById('expenses-list').children)
        .map(item => item.textContent.replace(" ✖", ""));

    const data = {
        workDaysData,
        wantToBuyItems,
        additionalExpenses,
        totalEarnings,
        totalExpenses
    };

    localStorage.setItem("formData", JSON.stringify(data));
    alert("Data saved successfully!");
}

function loadData() {
    const savedData = JSON.parse(localStorage.getItem("formData"));

    if (savedData) {
        savedData.workDaysData.forEach(dayData => {
            addWorkDay();
            const lastWorkDay = workDays[workDays.length - 1];
            lastWorkDay.querySelector('.work-day-date').value = dayData.date;
            lastWorkDay.querySelector('.work-day-start-time').value = dayData.startTime;
            lastWorkDay.querySelector('.work-day-end-time').value = dayData.endTime;
            lastWorkDay.querySelector('.work-day-hourly-rate').value = dayData.hourlyRate;
        });

        savedData.wantToBuyItems.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = item;

            const deleteIcon = document.createElement('span');
            deleteIcon.textContent = " ✖";
            deleteIcon.classList.add('delete-icon');
            deleteIcon.onclick = () => listItem.remove();

            listItem.appendChild(deleteIcon);
            document.getElementById('want-to-buy-list').appendChild(listItem);
        });

        savedData.additionalExpenses.forEach(expense => {
            const listItem = document.createElement('li');
            listItem.textContent = expense;

            const deleteIcon = document.createElement('span');
            deleteIcon.textContent = " ✖";
            deleteIcon.classList.add('delete-icon');
            deleteIcon.onclick = () => listItem.remove();

            listItem.appendChild(deleteIcon);
            document.getElementById('expenses-list').appendChild(listItem);
        });

        totalEarnings = savedData.totalEarnings;
        totalExpenses = savedData.totalExpenses;
        updateGrandTotal();
    }
}

window.onload = loadData;
