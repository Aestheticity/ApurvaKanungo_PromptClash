let inventory = JSON.parse(localStorage.getItem("inventory")) || [];

/* ---------- STORAGE ---------- */
function saveData() {
    localStorage.setItem("inventory", JSON.stringify(inventory));
}

/* ---------- ADD ITEM ---------- */
function addItem() {
    const name = document.getElementById("name").value.trim();
    const category = document.getElementById("category").value;
    const quantity = document.getElementById("quantity").value;
    const expiry = document.getElementById("expiry").value;

    if (!name || !category || !quantity || !expiry) {
        alert("Please fill all fields");
        return;
    }

    inventory.push({
        id: Date.now(), // UNIQUE ID (CRITICAL FIX)
        name,
        category,
        quantity,
        expiry
    });

    saveData();
    clearForm();
    updateCategoryFilter();
    renderTable();
}

/* ---------- CLEAR FORM ---------- */
function clearForm() {
    document.getElementById("name").value = "";
    document.getElementById("category").value = "";
    document.getElementById("quantity").value = "";
    document.getElementById("expiry").value = "";
}

/* ---------- DELETE ---------- */
function deleteItem(id) {
    if (!confirm("Delete this item?")) return;

    inventory = inventory.filter(item => item.id !== id);
    saveData();
    updateCategoryFilter();
    renderTable();
}

/* ---------- DATE LOGIC ---------- */
function daysLeft(expiry) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const exp = new Date(expiry);
    exp.setHours(0, 0, 0, 0);

    return Math.floor((exp - today) / (1000 * 60 * 60 * 24));
}

function getStatus(days) {
    if (days < 0) return "expired";
    if (days <= 5) return "warning";
    return "safe";
}

/* ---------- CATEGORY FILTER ---------- */
function updateCategoryFilter() {
    const filter = document.getElementById("categoryFilter");
    const categories = [...new Set(inventory.map(item => item.category))];

    filter.innerHTML = `<option value="all">All Categories</option>`;
    categories.forEach(cat => {
        filter.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
}

/* ---------- RENDER TABLE ---------- */
function renderTable() {
    const table = document.getElementById("tableBody");
    table.innerHTML = "";

    const filterValue = document.getElementById("categoryFilter").value;
    const sortOrder = document.getElementById("sortOrder").value;

    let viewData = [...inventory];

    /* FILTER */
    if (filterValue !== "all") {
        viewData = viewData.filter(item => item.category === filterValue);
    }

    /* SORT */
    if (sortOrder === "asc") {
        viewData.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
    } else if (sortOrder === "desc") {
        viewData.sort((a, b) => new Date(b.expiry) - new Date(a.expiry));
    }

    /* DASHBOARD COUNTS (GLOBAL, NOT FILTERED) */
    let safe = 0, warning = 0, expired = 0;

    inventory.forEach(item => {
        const d = daysLeft(item.expiry);
        const status = getStatus(d);

        if (status === "safe") safe++;
        else if (status === "warning") warning++;
        else expired++;
    });

    /* TABLE ROWS */
    viewData.forEach(item => {
        const days = daysLeft(item.expiry);
        const status = getStatus(days);

        const daysText =
            days < 0 ? "Expired" :
            days === 0 ? "Today" :
            `${days} days`;

        table.innerHTML += `
            <tr class="${status}">
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.quantity}</td>
                <td>${item.expiry}</td>
                <td>${daysText}</td>
                <td>${status.toUpperCase()}</td>
                <td>
                    <button class="delete-btn" onclick="deleteItem(${item.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });

    /* UPDATE DASHBOARD */
    document.getElementById("totalCount").innerText = inventory.length;
    document.getElementById("safeCount").innerText = safe;
    document.getElementById("warningCount").innerText = warning;
    document.getElementById("expiredCount").innerText = expired;
}

/* ---------- INIT ---------- */
updateCategoryFilter();
renderTable();

function toggleTheme() {
    document.body.classList.toggle("dark-mode");

    const button = document.getElementById("themeToggle");

    if (document.body.classList.contains("dark-mode")) {
        button.textContent = "☀";
    } else {
        button.textContent = "🌙";
    }
}
function toggleTheme() {
    document.body.classList.toggle("dark");

    // Save preference
    localStorage.setItem(
        "theme",
        document.body.classList.contains("dark") ? "dark" : "light"
    );
}
// Restore saved theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}