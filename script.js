const apiUrl = "https://script.google.com/macros/s/AKfycbxwkv_Yh7hAKUkEasPiBk6o0Ql2ywoAcLJ-zOzzRNZPVHabd2tqA7jTct_qKJHINlWSAA/exec";//這邊請換成自己部署的app script網址

const form = document.getElementById("recordForm");
const recordsContainer = document.getElementById("records");

// 載入 Google Sheet 中的資料
async function loadRecords() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const recordsContainer = document.getElementById("records");
        const monthSelect = document.getElementById("monthSelect");
        const totalAmountDisplay = document.getElementById("totalAmount");

        recordsContainer.innerHTML = "";

        const records = data.slice(1).map(([date, category, amount, note]) => ({
            date,
            category,
            amount: Number(amount),
            note
        }));

        // 取得所有月份
        const months = [...new Set(records.map(r => r.date.slice(0, 7)))];
        monthSelect.innerHTML = `<option value="all">全部</option>` + months.map(m => `<option value="${m}">${m}</option>`).join("");

        // 顯示紀錄（依選擇月份）
        function renderRecords(monthFilter = "all") {
            recordsContainer.innerHTML = "";
            let total = 0;

            records.forEach((r, index) => {
                if (monthFilter === "all" || r.date.startsWith(monthFilter)) {
                    const recordElement = document.createElement("div");
                    recordElement.classList.add("record");
                    recordElement.innerHTML = `
                        <p><strong>日期：</strong>${r.date}</p>
                        <p><strong>類別：</strong>${r.category}</p>
                        <p><strong>金額：</strong>${r.amount}</p>
                        <p><strong>備註：</strong>${r.note}</p>
                    `;
                    recordsContainer.appendChild(recordElement);
                    total += r.amount;
                }
            });

            totalAmountDisplay.textContent = `總支出：$${total}`;
        }

        renderRecords();

        // 當選擇月份改變時重新渲染
        monthSelect.addEventListener("change", () => {
            renderRecords(monthSelect.value);
        });

    } catch (error) {
        console.error("讀取紀錄時發生錯誤：", error);
    }
}


// 新增資料（使用 no-cors）
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const date = document.getElementById("date").value;
    const category = document.getElementById("category").value;
    const amount = Number(document.getElementById("amount").value);
    const note = document.getElementById("note").value;

    const newRecord = { date, category, amount, note };

    await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newRecord),
        mode: "no-cors" // 重要：解決跨域問題
    });

    alert("資料已成功送出！請到試算表查看結果");
    form.reset();

    // 可選：2 秒後重新載入資料（伺服器未保證已寫入）
    setTimeout(loadRecords, 2000);
});

window.addEventListener("load", loadRecords);


/* 以下是APP Script的內容
// GET：讀取所有記帳資料
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// POST：新增一筆資料
function doPost(e) {
  const sheet = SpreadsheetApp.openById(id).getActiveSheet();
  const params = JSON.parse(e.postData.contents);

  sheet.appendRow([params.date, params.category, params.amount, params.note]);

  const response = {
    status: "success",
    message: "Data added successfully"
  };

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

*/