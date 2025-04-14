//https://script.google.com/macros/s/AKfycbz7Bw9Axs2LUUTizEas02zk8FUnnti2Xfz5bV26xID2leeDUTqCtJEuF0P-n-HF5_pntQ/exec/exec
const apiUrl = "https://script.google.com/macros/s/AKfycbwyRMfEDjHqxoubWcTvpQECIIPbdmv6Y4voYDZVNidBPTNCLVgLfC_6RCqZiINuj6QaNw/exec";

const form = document.getElementById("recordForm");
const recordsContainer = document.getElementById("records");

// 讀取並顯示 Google Sheets 上的資料
async function loadRecords() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        displayRecords(data);
    } catch (error) {
        console.error("讀取紀錄時發生錯誤：", error);
    }
}

// 顯示紀錄資料到網頁
function displayRecords(data) {
    recordsContainer.innerHTML = "";

    for (let i = 1; i < data.length; i++) {
        const [date, category, amount, note] = data[i];

        const recordElement = document.createElement("div");
        recordElement.classList.add("record");
        recordElement.innerHTML = `
            <p><strong>日期：</strong>${date}</p>
            <p><strong>類別：</strong>${category}</p>
            <p><strong>金額：</strong>${amount}</p>
            <p><strong>備註：</strong>${note}</p>
                <button class="delete-btn" data-index="${i + 1}">刪除</button>
        `;

        // 加入刪除按鈕監聽器
        recordElement.querySelector(".delete-btn").addEventListener("click", async (e) => {
            const rowIndex = e.target.dataset.index;
            if (confirm("確定要刪除這筆紀錄嗎？")) {
                await deleteRecord(rowIndex);
                loadRecords();
            }
        });

        recordsContainer.appendChild(recordElement);
    }
}

// 新增資料並即時顯示
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const date = document.getElementById("date").value;
    const category = document.getElementById("category").value;
    const amount = Number(document.getElementById("amount").value);
    const note = document.getElementById("note").value;

    const newRecord = { date, category, amount, note };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            body: JSON.stringify(newRecord),
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json(); // 從伺服器取得更新後的所有紀錄
        displayRecords(data); // 顯示在頁面上
        form.reset();
        alert("記帳成功！");
    } catch (error) {
        console.error("新增記帳時發生錯誤：", error);
    }
});
async function deleteRecord(index) {
    try {
        const response = await fetch(`${apiUrl}?method=delete&index=${index}`);
        const result = await response.text();
        console.log("刪除結果：", result);
    } catch (error) {
        console.error("刪除失敗：", error);
    }

// 初始載入
window.addEventListener("load", loadRecords)}
