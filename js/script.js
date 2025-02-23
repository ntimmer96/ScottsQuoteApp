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
      data[key] = [value];
    } else {
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
          inputs[0].value = Array.isArray(data[key]) ? data[key][0] : data[key];
        }
      });
    };
    reader.readAsText(file);
  }
}

function populateRows(sectionId, data, ...keys) {
  const section = document.getElementById(sectionId);
  section.innerHTML = ""; // Clear existing rows

  for (let i = 0; i < data[keys[0]].length; i++) {
    const row = document.createElement("tr");

    keys.forEach((key) => {
      const cell = document.createElement("td");
      const input = document.createElement("input");
      input.type = "text";
      input.name = key;

      if (data[key] && Array.isArray(data[key])) {
        input.value = data[key][i] || "";
      } else {
        input.value = data[key] || "";
      }

      cell.appendChild(input);
      row.appendChild(cell);
    });

    section.appendChild(row);
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
          ZIP Code: ${formData.get("company-zip-code") || "N/A"}<br>
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
  const formattedSubTotal = formatCurrency(subTotal);
  const formattedSalesTax = formatCurrency(salesTax);
  const formattedTotalRebate = formatCurrency(totalRebate);
  const formattedFinalPrice = formatCurrency(finalPrice);

  let summary = `
    <h2>Summary</h2>
    <table>
        <tr><td>Sub Total:</td><td>$${formattedSubTotal}</td></tr>
        <tr><td>Sales Tax:</td><td>$${formattedSalesTax}</td></tr>
  `;

  if (totalRebate > 0) {
    summary += `<tr><td>Rebate:</td><td>-$${formattedTotalRebate}</td></tr>`;
  }

  summary += `
        <tr><td><strong>Final Price:</strong></td><td class="highlight">$${formattedFinalPrice}</td></tr>
    </table>
  `;

  // Generate signature section
  const signatureSection = `
    <h2>Authorized Signature</h2>
    <div style="display: flex; justify-content: center; margin-top: 20px;">
      <div style="text-align: right;">
        <div style="margin-bottom: 5px;">
          Name: _________________________
        </div>
        <div style="margin-bottom: 5px;">
          Title: _________________________
        </div>
        <div style="margin-bottom: 5px;">
          Date: _________________________
        </div>
      </div>
    </div>
    <p>Quote is valid for 30 days from Date of Issuance.</p>
  `;

  // Footer section with custom text
  const footerSection = `
  <div style="text-align: center; margin-top: 20px; font-size: 12px;">
    <p>For further details regarding our terms and policies, please reference our <a href='https://www.stewartandstevenson.com/terms-of-sale/' target='_blank'>terms and conditions page</a>.</p>
  </div>
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
            h1, h2 { text-align: center; font-size: 16px; }
            img { position: absolute; top: 20px; left: 20px; width: 200px; height: auto; }
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
          ${footerSection}
        </div>
        ${printButton}
    </body>
    </html>
  `);
  quoteWindow.document.close();
}

function generateCostSheet() {
  console.log("generateCostSheet function called"); // Logging for troubleshooting

  const form = document.getElementById("quote-form");
  if (!form) {
    console.error("Quote form not found");
    return;
  }

  const formData = new FormData(form);

  function formatCurrency(value) {
    return parseFloat(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }

  function parseNumber(value) {
    return parseFloat(value.replace(/,/g, "")) || 0;
  }

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
          ZIP Code: ${formData.get("company-zip-code") || "N/A"}<br>
      </p>
    </div>
  `;

  const machineDetailsRows = Array.from(
    document.querySelectorAll("#machine-details tr")
  )
    .map((row) => {
      const categoryInput = row.querySelector('input[name="category[]"]');
      const equipmentInput = row.querySelector('input[name="equipment[]"]');
      if (!categoryInput || !equipmentInput) return ""; // Skip invalid rows

      const category = categoryInput.value.trim() || "N/A";
      const equipment = equipmentInput.value.trim() || "N/A";
      const assetId =
        row.querySelector('input[name="asset-id[]"]')?.value.trim() || "N/A";
      const serialNumber =
        row.querySelector('input[name="serial-number[]"]')?.value.trim() ||
        "N/A";
      const price = formatCurrency(
        parseNumber(
          row.querySelector('input[name="price[]"]')?.value.trim() || "0"
        )
      );
      const freight = formatCurrency(
        parseNumber(
          row.querySelector('input[name="freight[]"]')?.value.trim() || "0"
        )
      );
      const margin =
        row.querySelector('input[name="margin[]"]')?.value.trim() || "N/A";
      const specifics =
        row.querySelector('input[name="machine-specifics[]"]')?.value.trim() ||
        "N/A";

      return `<tr>
        <td>${category}</td>
        <td>${equipment}</td>
        <td>${assetId}</td>
        <td>${serialNumber}</td>
        <td>${price}</td>
        <td>${freight}</td>
        <td>${margin}</td>
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
                <th>Category</th>
                <th>Equipment</th>
                <th>Asset ID</th>
                <th>Serial Number</th>
                <th>Cost</th>
                <th>Freight</th>
                <th>Margin</th>
                <th>Specifics</th>
            </tr>
        </thead>
        <tbody>
            ${machineDetailsRows}
        </tbody>
    </table>
  `
    : "";

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
      const assetId =
        row
          .querySelector('input[name="attachment-asset-id[]"]')
          ?.value.trim() || "N/A";
      const serialNumber =
        row
          .querySelector('input[name="attachment-serial-number[]"]')
          ?.value.trim() || "N/A";
      const price = formatCurrency(
        parseNumber(
          row.querySelector('input[name="attachment-price[]"]')?.value.trim() ||
            "0"
        )
      );
      const freight = formatCurrency(
        parseNumber(
          row
            .querySelector('input[name="attachment-freight[]"]')
            ?.value.trim() || "0"
        )
      );
      const margin =
        row.querySelector('input[name="attachment-margin[]"]')?.value.trim() ||
        "N/A";

      return `<tr>
        <td>${attachment}</td>
        <td>${brand}</td>
        <td>${type}</td>
        <td>${assetId}</td>
        <td>${serialNumber}</td>
        <td>${price}</td>
        <td>${freight}</td>
        <td>${margin}</td>
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
                <th>Asset ID</th>
                <th>Serial Number</th>
                <th>Cost</th>
                <th>Freight</th>
                <th>Margin</th>
            </tr>
        </thead>
        <tbody>
            ${attachmentRows}
        </tbody>
    </table>
  `
    : "";

  const branchLocationServicesRows = `
    <tr>
      <td>Delivery to Customer</td>
      <td>${formatCurrency(
        parseNumber(formData.get("delivery-to-customer")) || "0"
      )}</td>
    </tr>
    <tr>
      <td>PDI</td>
      <td>${formatCurrency(parseNumber(formData.get("pdi")) || "0")}</td>
    </tr>
    <tr>
      <td>Fuel</td>
      <td>${formatCurrency(parseNumber(formData.get("fuel")) || "0")}</td>
    </tr>
    <tr>
      <td>Rebate</td>
      <td>${formatCurrency(parseNumber(formData.get("rebate")) || "0")}</td>
    </tr>
  `;

  const branchLocationServices = `
    <h2>Branch Location Services</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <thead>
            <tr>
                <th style="padding: 2px; background-color: #f2f2f2;">Service</th>
                <th style="padding: 2px; background-color: #f2f2f2;">Value</th>
            </tr>
        </thead>
        <tbody>
            ${branchLocationServicesRows}
        </tbody>
    </table>
  `;

  // Calculate Totals for Summary Section
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

  const deliveryToCustomer =
    parseNumber(formData.get("delivery-to-customer")) || 0;
  const pdi = parseNumber(formData.get("pdi")) || 0;
  const fuel = parseNumber(formData.get("fuel")) || 0;
  const totalRebate = parseNumber(formData.get("rebate")) || 0;

  const subTotal =
    machineTotal + attachmentTotal + deliveryToCustomer + pdi + fuel;
  const salesTaxRate =
    parseNumber(document.getElementById("billing-tax-rate").value) / 100;
  const salesTax = subTotal * salesTaxRate;
  const finalPrice = subTotal + salesTax - totalRebate;

  // Generate Summary Section with Formatted Numbers
  const formattedSubTotal = formatCurrency(subTotal);
  const formattedSalesTax = formatCurrency(salesTax);
  const formattedTotalRebate = formatCurrency(totalRebate);
  const formattedFinalPrice = formatCurrency(finalPrice);

  let summary = `
      <h2>Summary</h2>
      <table>
          <tr><td>Sub Total:</td><td>${formattedSubTotal}</td></tr>
          <tr><td>Sales Tax:</td><td>${formattedSalesTax}</td></tr>
    `;

  if (totalRebate > 0) {
    summary += `<tr><td>Rebate:</td><td>-${formattedTotalRebate}</td></tr>`;
  }

  summary += `
          <tr><td><strong>Final Price:</strong></td><td class="highlight">${formattedFinalPrice}</td></tr>
      </table>
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
      ">Print Cost Sheet</button>
    `;

  // Open New Window for Cost Sheet
  const costSheetWindow = window.open("", "", "width=800,height=600");
  costSheetWindow.document.write(`
      <html>
      <head>
          <title>Cost Sheet</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 15mm; }
              h1, h2 { text-align: center; font-size: 16px; }
              img { position: absolute; top: 20px; left: 20px; width: 200px; height: auto; }
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
          <div class="container">
            <h1>Cost Sheet</h1>
            ${customerInfo}
            ${companyInfo}
            ${machineDetails}
            ${attachments}
            ${branchLocationServices}
            ${summary}
          </div>
          ${printButton}
      </body>
      </html>
    `);
  costSheetWindow.document.close();
}
