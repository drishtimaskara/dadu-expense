import { useState } from "react";
import Tesseract from "tesseract.js";

function BillScanner({ onExtract }) {
  const [loading, setLoading] = useState(false);

  // ---------------- SAFE NUMBER CLEANER ----------------
  const normalizeNumber = (str) => {
    if (!str) return "";

    return str
      .replace(/\s/g, "")
      .replace(/,/g, "")
      .replace(/[^0-9.]/g, "");
  };

    // ---------------- IMAGE PREPROCESSING ----------------
  const preprocessImage = (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // 2x upscale
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;

      ctx.drawImage(
        img,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const gray =
          0.299 * data[i] +
          0.587 * data[i + 1] +
          0.114 * data[i + 2];

        // Increase contrast
        const value =
          gray > 140 ? 255 : 0;

        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
      }

      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob(
        (blob) => resolve(blob),
        "image/png",
        1
      );
    };
  });
  };

  // ---------------- OCR SCAN (IMPORTANT FIX HERE) ----------------
  const scanBill = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      const processedImage =
  await preprocessImage(file);

        const result = await Tesseract.recognize( processedImage, "eng",{
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log("OCR Progress:", Math.round(m.progress * 100) + "%");
          }
        },

        tessedit_pageseg_mode: 6, // uniform block of text

        preserve_interword_spaces: "1",
      });

     let text = result.data.text;
const confidence = result.data.confidence;

// Fix common OCR currency symbol mistakes
text = text
  .replace(/\b8(?=\d{2,}[.,]?\d*)/g, "$")
  .replace(/\b2(?=\d{2,}[.,]?\d*)/g, "₹");

    console.log("OCR TEXT:", text);
    console.log("OCR CONFIDENCE:", confidence);

    extractExpense(text, confidence);
    } catch (err) {
      console.error(err);
      alert("OCR failed. Try clearer image.");
    }

    setLoading(false);
  };

  // ---------------- EXPENSE EXTRACTION ----------------
  const extractExpense = (text, confidence) => {
    const lines = text
      .toLowerCase()
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    let bestAmount = "";
    let bestScore = -1;

    for (let line of lines) {
      // 🔥 IMPORTANT: do NOT fragment numbers
      const numbers = line.match(/\d+(?:[.,]?\d+)*/g);
      if (!numbers) continue;

      const rawValue = numbers[numbers.length - 1];
      const value = normalizeNumber(rawValue);

      const num = Number(value);
      if (!num || num <= 0 || num > 1000000) continue;

      let score = 0;

      if (line.includes("grand")) score += 15;
      if (line.includes("total")) score += 12;
      if (line.includes("amount")) score += 6;
      if (line.includes("subtotal")) score -= 25;

      if (score > bestScore) {
        bestScore = score;
        bestAmount = value;
      }
    }

    // fallback
    if (!bestAmount) {
      const all = text.match(/\d+(?:[.,]?\d+)*/g) || [];
      bestAmount = normalizeNumber(all[all.length - 1] || "");
    }

    // ---------------- CATEGORY ----------------
    const lower = text.toLowerCase();

    let category = "Other";

    if (
      lower.includes("pizza") ||
      lower.includes("restaurant") ||
      lower.includes("food") ||
      lower.includes("dominos") ||
      lower.includes("mcdonald")
    ) {
      category = "Food";
    } else if (
      lower.includes("uber") ||
      lower.includes("ola") ||
      lower.includes("bus") ||
      lower.includes("train")
    ) {
      category = "Travel";
    } else if (
      lower.includes("amazon") ||
      lower.includes("flipkart")
    ) {
      category = "Shopping";
    }else if (
    lower.includes("medicine") ||
    lower.includes("medical") ||
    lower.includes("hospital") ||
    lower.includes("hospitals") ||
    lower.includes("clinic") ||
    lower.includes("doctor") ||
    lower.includes("pharmacy") ||
    lower.includes("chemist") ||
    lower.includes("apollo") ||
    lower.includes("fortis") ||
    lower.includes("ils")
  ) {
    category = "Medical";
  }
    onExtract({
      amount: bestAmount,
      category,
      description: text.split("\n")[0] || "Scanned Bill",
      confidence,
    });
  };

  return (
    <div className="border rounded-xl p-5 shadow mb-6 bg-white">
      <h2 className="text-xl font-bold mb-2">🧾 Smart Receipt Scanner</h2>

      <p className="text-gray-600 mb-4">
        Upload a receipt or bill — we extract accurate totals automatically.
      </p>

      <label
        htmlFor="bill-upload"
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg cursor-pointer inline-block transition"
      >
        📸 Scan Receipt
      </label>

      <input
        id="bill-upload"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={scanBill}
        className="hidden"
      />

      {loading && (
        <div className="mt-4">
          <p className="text-blue-600 font-semibold">
            🔍 Scanning receipt...
          </p>

          <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
            <div className="bg-blue-600 h-3 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillScanner;