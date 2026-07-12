// Split a CSV line into fields, respecting double-quoted values (so addresses
// containing commas stay in a single column). Supports "" as an escaped quote.
export function parseCsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

// Validate a contact date in mm-dd or mm-dd-yyyy form (birthdays/anniversaries
// don't require a year). Rejects impossible calendar dates such as 02-30 or 13-40.
export function isValidContactDate(str) {
  let month, day, year;

  if (/^\d{1,2}-\d{1,2}$/.test(str)) {
    [month, day] = str.split("-").map(Number);
    year = 2000; // leap year reference so 02-29 is accepted when no year given
  } else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(str)) {
    [month, day, year] = str.split("-").map(Number);
  } else {
    return false;
  }

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

// Break a single address string into structured parts, e.g.
//   "Street[, Apt/Suite], City, State ZIP"
export function parseAddress(raw) {
  const result = { street: "", unit: "", city: "", state: "", zip: "" };
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!parts.length) return result;

  const tail = parts[parts.length - 1];
  const stateZip = tail.match(/^([A-Za-z]{2})\s+(\d{5})$/);
  if (stateZip) {
    result.state = stateZip[1].toUpperCase();
    result.zip = stateZip[2];
  }

  result.street = parts[0] || "";
  if (parts.length >= 2) result.city = parts[parts.length - 2];
  if (parts.length >= 4) result.unit = parts.slice(1, parts.length - 2).join(", ");

  return result;
}

export const SAMPLE_CSV = `Mom,Jane,Doe,"23 Maine St, Apt 4, Lisbon, ME 04250",03-12,06-20
Dad,John,Doe,"500 Pine Ave, Austin, TX 73301",12-25,
Bestie,Sarah,Connor,,08-01-1982,09-15
,Mike,Jones,"42 Pigeon Ave, Austin, TX 73301",07-04,
Sis,Emma,Stone,"Just a street name",02-30,13-40`;

export function validateCsv(rawText) {
  const lines = rawText.split("\n").filter((line) => line.trim());

  return lines.map((line, index) => {
    const columns = parseCsvLine(line);
    const rowNum = index + 1;

    const nickname = (columns[0] || "").trim();
    const firstName = (columns[1] || "").trim();
    const lastName = (columns[2] || "").trim();
    const address = (columns[3] || "").trim();
    const birthday = (columns[4] || "").trim();
    const anniversary = (columns[5] || "").trim();

    const errors = {};
    if (!nickname) errors.nickname = "Required";
    if (!firstName) errors.firstName = "Required";
    if (!lastName) errors.lastName = "Required";

    let parsedAddress = null;
    const addrErrors = {};
    if (address) {
      parsedAddress = parseAddress(address);
      if (!parsedAddress.city) addrErrors.city = "Missing city";
      if (!/^[A-Z]{2}$/.test(parsedAddress.state)) addrErrors.state = "Missing state";
      if (!/^\d{5}$/.test(parsedAddress.zip)) addrErrors.zip = "Missing ZIP";
      if (Object.keys(addrErrors).length) errors.address = true;
    }

    if (birthday && !isValidContactDate(birthday)) errors.birthday = "Invalid date";
    if (anniversary && !isValidContactDate(anniversary)) errors.anniversary = "Invalid date";

    return {
      rowNum,
      nickname,
      firstName,
      lastName,
      address,
      parsedAddress,
      addrErrors,
      birthday,
      anniversary,
      errors,
      isValid: Object.keys(errors).length === 0,
    };
  });
}
