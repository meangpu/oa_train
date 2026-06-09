/* eslint-disable react-refresh/only-export-components */
export function formatDate(dateInput: string | number | Date): string {
  if (!dateInput || dateInput === "") {
    return "";
  }

  let date;
  if (typeof dateInput === "number") {
    date = new Date(dateInput);
  } else if (typeof dateInput === "string") {
    date = new Date(dateInput);
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    console.warn("Invalid dateInput type:", typeof dateInput, dateInput);
    return "";
  }

  if (isNaN(date.getTime())) {
    console.warn("Invalid date value:", dateInput);
    return "";
  }

  // Format the date
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day} ${month} ${year} ${hours}:${minutes}`;
}

export function getItemImageByName(name: string) {
  const imageUrl = import.meta.env.DEV
    ? // ? "https://cdn-icons-png.freepik.com/256/17018/17018802.png?semt=ais_hybrid"
      `https://168.222.21.2/items/${name}.png`
    : `nui://vorp_inventory/html/img/items/${name}.png`;
  return imageUrl;
}

export const getRandomValue = (min: number, max: number) => {
  return min + Math.random() * (max - min);
};

export const copyToClipboard = (text: string) => {
  try {
    // Create a text area element to copy from
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Make the textarea invisible
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";

    // Add it to the document
    document.body.appendChild(textArea);

    // Select and copy the text
    textArea.select();
    document.execCommand("copy");

    // Remove the textarea
    document.body.removeChild(textArea);

    // toast.success(`Copied "${text}" to clipboard!`);
  } catch (err) {
    console.error("Failed to copy text: ", err);
    // toast.error("Failed to copy to clipboard");
  }
};

// อันนี้ต้องคงไว้แบบนี้ ห้ามเปลี่ยนเป็นพิมพ์เล็กเพราะว่าเป็น builtin ของ redM
export const GetParentResourceName = (): string => {
  return typeof window.GetParentResourceName === "function"
    ? window.GetParentResourceName()
    : "mock-resource-name";
};
