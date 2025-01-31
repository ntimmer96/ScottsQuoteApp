function addRow(tableId) {
  const table = document.getElementById(tableId);
  if (!table) {
    console.error(`Table with id "${tableId}" not found.`);
    return;
  }

  const newRow = table.insertRow();
  const fieldNames =
    tableId === "machine-details"
      ? [
          "category[]",
          "equipment[]",
          "asset-id[]",
          "serial-number[]",
          "price[]",
          "freight[]",
          "margin[]",
          "machine-specifics[]",
        ]
      : [
          "attachment-name[]",
          "attachment-brand[]",
          "attachment-type[]",
          "attachment-asset-id[]",
          "attachment-serial-number[]",
          "attachment-price[]",
          "attachment-freight[]",
          "attachment-margin[]",
        ];

  let rowContent = "";
  fieldNames.forEach((name) => {
    if (name.includes("margin[]")) {
      rowContent += `<td><input type="text" name="${name}" required oninput="formatPercent(this)" /></td>`;
    } else if (name.includes("price[]") || name.includes("freight[]")) {
      rowContent += `<td><input type="text" name="${name}" required oninput="formatNumber(this)" /></td>`;
    } else {
      rowContent += `<td><input type="text" name="${name}" required /></td>`;
    }
  });
  rowContent += `<td><button type="button" onclick="removeRow(this)">Remove</button></td>`;

  newRow.innerHTML = rowContent;
}

function removeRow(button) {
  const row = button.closest("tr");
  const table = row.closest("table");
  const rowCount = table.rows.length;

  if (rowCount <= 1) {
    Array.from(row.querySelectorAll("input")).forEach((input) => {
      input.value = ""; // Clear the input fields
    });
  } else {
    row.remove(); // Remove the row if more than one exists
  }

  if (table.rows.length === 0) {
    addRow(table.id); // Add a new row if the table is empty
  }
}

function formatNumber(input) {
  let cursorPosition = input.selectionStart;
  let value = input.value.replace(/,/g, "");
  let formattedValue = Number(value).toLocaleString("en-US");
  input.value = formattedValue;
  let diff = formattedValue.length - value.length;
  input.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
}

function formatPercent(input) {
  let cursorPosition = input.selectionStart;
  let value = input.value.replace(/[^0-9.]/g, "");
  if (!/^\d*\.?\d*$/.test(value)) return;
  let formattedValue = value ? value + "%" : "";
  input.value = formattedValue;
  input.setSelectionRange(
    cursorPosition + (formattedValue.length - value.length),
    cursorPosition + (formattedValue.length - value.length)
  );
}

function exportData() {
  const form = document.getElementById("quote-form");
  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => {
    if (!data[key]) {
      data[key] = value;
    } else {
      if (!Array.isArray(data[key])) {
        data[key] = [data[key]];
      }
      data[key].push(value);
    }
  });

  const fileName = prompt("Enter the name of the file to save:", "quote-data");
  if (!fileName) {
    alert("File name is required.");
    return;
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.json`;
  link.click();
}

function importData() {
  document.getElementById("import-file").click();
}

function handleFile(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = JSON.parse(e.target.result);
      console.log("Imported Data: ", data); // Debugging line

      Object.keys(data).forEach((key) => {
        const inputs = document.getElementsByName(key);
        if (
          Array.isArray(data[key]) &&
          (key.includes("category") ||
            key.includes("equipment") ||
            key.includes("asset-id") ||
            key.includes("serial-number") ||
            key.includes("price") ||
            key.includes("freight") ||
            key.includes("margin") ||
            key.includes("machine-specifics"))
        ) {
          populateRows(
            "machine-details",
            data,
            "category[]",
            "equipment[]",
            "asset-id[]",
            "serial-number[]",
            "price[]",
            "freight[]",
            "margin[]",
            "machine-specifics[]"
          );
        } else if (
          Array.isArray(data[key]) &&
          (key.includes("attachment-name") ||
            key.includes("attachment-brand") ||
            key.includes("attachment-type") ||
            key.includes("attachment-asset-id") ||
            key.includes("attachment-serial-number") ||
            key.includes("attachment-price") ||
            key.includes("attachment-freight") ||
            key.includes("attachment-margin"))
        ) {
          populateRows(
            "attachments",
            data,
            "attachment-name[]",
            "attachment-brand[]",
            "attachment-type[]",
            "attachment-asset-id[]",
            "attachment-serial-number[]",
            "attachment-price[]",
            "attachment-freight[]",
            "attachment-margin[]"
          );
        } else if (inputs.length > 0) {
          inputs[0].value = data[key];
        }
      });
    };
    reader.readAsText(file);
  }
}

function populateRows(tableId, data, ...fields) {
  const table = document.getElementById(tableId);
  table.innerHTML = "";
  const rowCount = data[fields[0]].length;

  for (let i = 0; i < rowCount; i++) {
    const newRow = table.insertRow();
    fields.forEach((field) => {
      const cell = newRow.insertCell();
      cell.innerHTML = `<input type="text" name="${field}" value="${
        data[field][i] || ""
      }" required />`;
    });
    const actionCell = newRow.insertCell();
    actionCell.innerHTML = `<button type="button" onclick="removeRow(this)">Remove</button>`;
  }
}

function generateQuote() {
  const form = document.getElementById("quote-form");
  const formData = new FormData(form);

  function formatCurrency(value) {
    return parseFloat(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
    });
  }

  function parseNumber(value) {
    return parseFloat(value.replace(/,/g, "")) || 0;
  }

  // URL of the image you want to include
  const imageUrl = "./images/SandS.png"; // Replace with your image URL

  // Collect Customer Information
  const customerInfo = `
    <h2>Customer Information</h2>
    <div style="display: grid; grid-auto-flow: column;">
      <p>
          <br>
          Business Name: ${formData.get("account-business-name") || "N/A"}<br>
          First Name: ${formData.get("account-first-name") || "N/A"}<br>
          Last Name: ${formData.get("account-last-name") || "N/A"}<br>
          Email: ${formData.get("account-email") || "N/A"}<br>
          Contact Number: ${formData.get("account-contact-number") || "N/A"}<br>
      </p>
      <p>
          <u>Billing Address</u><br>
          Address: ${formData.get("account-address") || "N/A"}<br>
          City: ${formData.get("account-city") || "N/A"}<br>
          State: ${formData.get("account-state") || "N/A"}<br>
          ZIP Code: ${formData.get("account-zip-code") || "N/A"}<br>
      </p>
    </div>
  `;

  // Collect Company Information
  const companyInfo = `
    <h2>Company Information</h2>
    <div style="display: grid; grid-auto-flow: column;">
      <p>
          <br>
          Sales Representative: ${
            formData.get("company-first-name") +
              " " +
              formData.get("company-last-name") || "N/A"
          }<br>
          E-Mail: ${formData.get("company-email") || "N/A"}<br>
          Contact Number: ${formData.get("company-contact-number") || "N/A"}<br>
      </p>
      <p>
          <u>Branch Location</u><br>
          Address: ${formData.get("company-address") || "N/A"}<br>
          City: ${formData.get("company-city") || "N/A"}<br>
          State: ${formData.get("company-state") || "N/A"}<br>
          ZIP Code: ${formData.get("company-zip") || "N/A"}<br>
      </p>
    </div>
  `;

  // Collect Machine Details
  const machineDetailsRows = Array.from(
    document.querySelectorAll("#machine-details tr")
  )
    .map((row) => {
      const categoryInput = row.querySelector('input[name="category[]"]');
      const equipmentInput = row.querySelector('input[name="equipment[]"]');
      if (!categoryInput || !equipmentInput) return ""; // Skip invalid rows

      const category = categoryInput.value.trim() || "N/A";
      const equipment = equipmentInput.value.trim() || "N/A";
      const serialNumber =
        row.querySelector('input[name="serial-number[]"]')?.value.trim() ||
        "N/A";
      const originalPrice =
        parseNumber(row.querySelector('input[name="price[]"]')?.value) || 0;
      const freight =
        parseNumber(row.querySelector('input[name="freight[]"]')?.value) || 0;
      const marginPercent =
        parseNumber(row.querySelector('input[name="margin[]"]')?.value) || 0;

      const subtotal = (originalPrice + freight).toFixed(2);
      const margin = (subtotal * (marginPercent / 100)).toFixed(2);
      const price = (parseFloat(subtotal) + parseFloat(margin)).toFixed(2);

      const specifics =
        row.querySelector('input[name="machine-specifics[]"]')?.value.trim() ||
        "N/A";

      return `<tr>
        <td>${category} ${equipment}</td>
        <td>${serialNumber}</td>
        <td>$${formatCurrency(price)}</td>
        <td>${specifics}</td>
      </tr>`;
    })
    .filter((row) => row !== "")
    .join("");

  const machineDetails = machineDetailsRows
    ? `
    <h2>Machine Details</h2>
    <table>
        <thead>
            <tr>
                <th>Machine</th>
                <th>Serial Number</th>
                <th>Price</th>
                <th>Specifics</th>
            </tr>
        </thead>
        <tbody>
            ${
              machineDetailsRows ||
              "<tr><td colspan='4'>No machine details available</td></tr>"
            }
        </tbody>
    </table>
  `
    : "";

  // Collect Attachment Details
  const attachmentRows = Array.from(
    document.querySelectorAll("#attachments tr")
  )
    .map((row) => {
      const attachmentInput = row.querySelector(
        'input[name="attachment-name[]"]'
      );
      const brandInput = row.querySelector('input[name="attachment-brand[]"]');
      if (!attachmentInput || !brandInput) return ""; // Skip invalid rows

      const attachment = attachmentInput.value.trim() || "N/A";
      const brand = brandInput.value.trim() || "N/A";
      const type =
        row.querySelector('input[name="attachment-type[]"]')?.value.trim() ||
        "N/A";
      const serialNumber =
        row
          .querySelector('input[name="attachment-serial-number[]"]')
          ?.value.trim() || "N/A";
      const originalPrice =
        parseNumber(
          row.querySelector('input[name="attachment-price[]"]')?.value
        ) || 0;
      const freight =
        parseNumber(
          row.querySelector('input[name="attachment-freight[]"]')?.value
        ) || 0;
      const marginPercent =
        parseNumber(
          row.querySelector('input[name="attachment-margin[]"]')?.value
        ) || 0;

      const subtotal = (originalPrice + freight).toFixed(2);
      const margin = (subtotal * (marginPercent / 100)).toFixed(2);
      const price = (parseFloat(subtotal) + parseFloat(margin)).toFixed(2);

      return `<tr>
        <td>${attachment}</td>
        <td>${brand}</td>
        <td>${type}</td>
        <td>${serialNumber}</td>
        <td>$${formatCurrency(price)}</td>
      </tr>`;
    })
    .filter((row) => row !== "")
    .join("");

  const attachments = attachmentRows
    ? `
    <h2>Attachments</h2>
    <table>
        <thead>
            <tr>
                <th>Attachment</th>
                <th>Brand</th>
                <th>Type</th>
                <th>Serial Number</th>
                <th>Price</th>
            </tr>
        </thead>
        <tbody>
            ${
              attachmentRows ||
              "<tr><td colspan='5'>No attachment details available</td></tr>"
            }
        </tbody>
    </table>
  `
    : "";

  // Calculate Total Rebate
  const rebateInputs = document.querySelectorAll('input[name="rebate"]');
  const totalRebate = Array.from(rebateInputs).reduce(
    (sum, input) => sum + parseNumber(input.value),
    0
  );

  // Collect Branch Location Services
  const deliveryToCustomer =
    parseNumber(formData.get("delivery-to-customer")) || 0;
  const pdi = parseNumber(formData.get("pdi")) || 0;
  const fuel = parseNumber(formData.get("fuel")) || 0;

  // Calculate Subtotals using updated price values
  const machineTotal = Array.from(
    document.querySelectorAll("#machine-details tr")
  ).reduce((sum, row) => {
    const originalPrice =
      parseNumber(row.querySelector('input[name="price[]"]')?.value) || 0;
    const freight =
      parseNumber(row.querySelector('input[name="freight[]"]')?.value) || 0;
    const marginPercent =
      parseNumber(row.querySelector('input[name="margin[]"]')?.value) || 0;

    const subtotal = originalPrice + freight;
    const margin = subtotal * (marginPercent / 100);
    const price = subtotal + margin;

    return sum + price;
  }, 0);

  const attachmentTotal = Array.from(
    document.querySelectorAll("#attachments tr")
  ).reduce((sum, row) => {
    const originalPrice =
      parseNumber(
        row.querySelector('input[name="attachment-price[]"]')?.value
      ) || 0;
    const freight =
      parseNumber(
        row.querySelector('input[name="attachment-freight[]"]')?.value
      ) || 0;
    const marginPercent =
      parseNumber(
        row.querySelector('input[name="attachment-margin[]"]')?.value
      ) || 0;

    const subtotal = originalPrice + freight;
    const margin = subtotal * (marginPercent / 100);
    const price = subtotal + margin;

    return sum + price;
  }, 0);

  // Compute Final Calculations
  const subTotal =
    machineTotal + attachmentTotal + deliveryToCustomer + pdi + fuel;
  const salesTaxRate =
    parseNumber(document.getElementById("billing-tax-rate").value) / 100;
  const salesTax = subTotal * salesTaxRate;
  const finalPrice = subTotal + salesTax - totalRebate;

  // Generate Summary Section with Formatted Numbers
  let summary = `
    <h2>Summary</h2>
    <table>
        <tr><td>Sub Total:</td><td>$${subTotal.toFixed(2)}</td></tr>
        <tr><td>Sales Tax:</td><td>$${salesTax.toFixed(2)}</td></tr>
  `;

  if (totalRebate > 0) {
    summary += `<tr><td>Rebate:</td><td>-$${totalRebate.toFixed(2)}</td></tr>`;
  }

  summary += `
        <tr><td><strong>Final Price:</strong></td><td class="highlight">$${finalPrice.toFixed(
          2
        )}</td></tr>
    </table>
  `;

  // Signature Section
  const signatureSection = `
    <h2>Signature</h2>
    <p>______________________________</p>
    <p>Authorized Signature</p>
  `;

  // Print Button
  const printButton = `
    <button id='printButton' onclick="window.print()" style="
        display: block;
        margin: 20px auto;
        padding: 10px 20px;
        background-color: #28a745;
        color: white;
        border: none;
        cursor: pointer;
        border-radius: 4px;
    ">Print Quote</button>
  `;

  // Open New Window for Generated Quote
  const quoteWindow = window.open("", "", "width=800,height=600");
  quoteWindow.document.write(`
    <html>
    <head>
        <title>Equipment Sales Quote</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 15mm; }
            h1 { text-align: center; font-size: 20px; }
            h2 { text-align: center; font-size: 16px; padding-top: 15px }
            img { position: absolute; top: 30px; left: 30px; width: 150px; height: auto; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12px; }
            table, th, td { border: 1px solid #ddd; }
            th, td { padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .highlight { background-color: yellow; font-weight: bold; }
            p { text-align: center; font-size: 12px; }
            @media print {
              @page { size: A4; margin: 15mm; }
              body { margin: 0; }
              #printButton { display: none !important; }
              .container { page-break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <img src="${imageUrl}" alt="Company Logo" />
        <div class="container">
          <h1>Equipment Sales Quote</h1>
          ${customerInfo}
          ${companyInfo}
          ${machineDetails}
          ${attachments}
          ${summary}
          ${signatureSection}
        </div>
        ${printButton}
    </body>
    </html>
  `);
  quoteWindow.document.close();
}
