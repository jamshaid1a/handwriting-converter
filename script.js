/* =====================================================
   HANDWRITING CONVERTER PRO
   Version 11.0 — Professional JavaScript
   Part 1: Initialization, Preview, Paper & Effects
===================================================== */

(() => {
"use strict";

/* ---------- ELEMENT SELECTOR ---------- */

const $ = id => document.getElementById(id);

const E = {
    text: $("textInput"),
    preview: $("preview"),
    font: $("fontSelect"),
    ink: $("inkColor"),
    paper: $("paperColor"),
    paperStyle: $("paperStyle"),
    inkEffect: $("inkEffect"),
    watermark: $("watermarkText"),

    signature: $("signatureUpload"),
    signaturePreview: $("signaturePreview"),

    student: $("studentName"),
    school: $("schoolName"),
    date: $("documentDate"),

    convert: $("convertBtn"),
    png: $("downloadBtn"),
    pdf: $("pdfBtn"),
    docx: $("docxBtn"),
    print: $("printBtn"),
    copyText: $("copyTextBtn"),
    copyImage: $("copyImageBtn"),
    reset: $("resetBtn"),
    theme: $("themeBtn"),
    start: $("heroStartBtn")
};

const page = document.querySelector(".page");

if (!page || Object.values(E).some(element => !element)) {
    console.error("Handwriting Converter: HTML elements are missing.");
    return;
}

/* ---------- SETTINGS ---------- */

const STORAGE_KEY = "handwriting-converter-v11";

let signatureData = "";

const DEFAULTS = {
    ink: "#000000",
    paper: "#fffef5",
    paperStyle: "plain",
    inkEffect: "normal"
};

/* ---------- CREATE DOCUMENT HEADER ---------- */

let header = $("documentHeader");

if (!header) {
    header = document.createElement("div");
    header.id = "documentHeader";
    header.className = "document-header";
    page.insertBefore(header, E.preview);
}

/* ---------- CREATE SIGNATURE AREA ---------- */

let signatureArea = $("signatureOutput");

if (!signatureArea) {
    signatureArea = document.createElement("div");
    signatureArea.id = "signatureOutput";
    signatureArea.className = "signature-output";
    page.appendChild(signatureArea);
}

/* ---------- DOCUMENT INFORMATION ---------- */

function updateDocumentDetails() {

    header.replaceChildren();

    const school = E.school.value.trim();
    const student = E.student.value.trim();
    const date = E.date.value;

    if (!school && !student && !date) {
        header.style.display = "none";
        return;
    }

    header.style.display = "block";

    if (school) {
        const schoolName = document.createElement("h3");

        schoolName.textContent = school;
        schoolName.style.textAlign = "center";
        schoolName.style.marginBottom = "12px";

        header.appendChild(schoolName);
    }

    const information = document.createElement("div");

    information.style.display = "flex";
    information.style.justifyContent = "space-between";
    information.style.flexWrap = "wrap";
    information.style.gap = "10px";
    information.style.fontFamily = "Arial, sans-serif";
    information.style.fontSize = "14px";

    if (student) {
        const name = document.createElement("span");
        name.textContent = "Student: " + student;
        information.appendChild(name);
    }

    if (date) {
        const dateText = document.createElement("span");
        dateText.textContent = "Date: " + date;
        information.appendChild(dateText);
    }

    header.appendChild(information);
}

/* ---------- SIGNATURE ---------- */

function updateSignature() {

    signatureArea.replaceChildren();

    if (!signatureData) return;

    const image = document.createElement("img");

    image.src = signatureData;
    image.alt = "Uploaded signature";
    image.className = "signature-on-page";

    signatureArea.appendChild(image);
}

/* ---------- WATERMARK ---------- */

function updateWatermark() {

    const old = page.querySelector(".watermark");

    if (old) old.remove();

    const value = E.watermark.value.trim();

    if (!value) return;

    const mark = document.createElement("div");

    mark.className = "watermark";
    mark.textContent = value;

    page.appendChild(mark);
}

/* ---------- SAFE MARKDOWN-LIKE HANDWRITING FORMATTER ---------- */

function renderHandwritingText(target, text) {
    target.replaceChildren();
    const lines = String(text || "").split("\n");
    lines.forEach(line => {
        const match = /^(#{1,3})\s+(.*)$/.exec(line);
        const element = match
            ? document.createElement("h" + match[1].length)
            : document.createElement("div");
        const content = match ? match[2] : line;
        const parts = content.split(/(\*\*[^*]+\*\*)/g);
        parts.forEach(part => {
            if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
                const strong = document.createElement("strong");
                strong.textContent = part.slice(2, -2);
                element.appendChild(strong);
            } else {
                element.appendChild(document.createTextNode(part));
            }
        });
        if (!line) element.appendChild(document.createElement("br"));
        target.appendChild(element);
    });
}
window.renderHandwritingText = renderHandwritingText;

/* ---------- MAIN PREVIEW ---------- */

function updatePreview() {

    const text = E.text.value;

    renderHandwritingText(
        E.preview,
        text || "Your handwriting will appear here..."
    );

    E.preview.style.fontFamily = E.font.value;
    E.preview.style.color = E.ink.value;

    // Support English and Urdu automatically.
    E.preview.dir = "auto";

    updateDocumentDetails();
    updateSignature();
    updateWatermark();
    applyPaperStyle();
    applyInkEffect();
}

/* ---------- FONT SIZE CONTROLLER ---------- */

const fontSlider = document.getElementById("fontSizeSlider");
const fontValue = document.getElementById("fontSizeValue");
const decreaseFont = document.getElementById("decreaseFont");
const increaseFont = document.getElementById("increaseFont");

let currentFontSize = 36;

function changeFontSize(size) {

    currentFontSize = Math.max(12, Math.min(60, size));

    E.preview.style.fontSize = currentFontSize + "px";

    fontSlider.value = currentFontSize;

    fontValue.textContent = currentFontSize + "px";
}

fontSlider.addEventListener("input", () => {
    changeFontSize(Number(fontSlider.value));
});

decreaseFont.addEventListener("click", () => {
    changeFontSize(currentFontSize - 2);
});

increaseFont.addEventListener("click", () => {
    changeFontSize(currentFontSize + 2);
});

changeFontSize(36);

/* ---------- PAPER STYLE ---------- */

function applyPaperStyle() {

   const styles = [
    "paper-notebook",
    "paper-ruled",
    "paper-graph",
    "paper-dotted",
    "paper-exam",
    "paper-register",
    "paper-vintage",
    "paper-plain"
];

    page.classList.remove(...styles);

    const selected = E.paperStyle.value;

    if (selected !== "plain") {
        page.classList.add("paper-" + selected);
    }
}

/* ---------- INK EFFECT ---------- */

function applyInkEffect() {

    const effects = [
        "ink-pencil",
        "ink-ballpen",
        "ink-fountain",
        "ink-gel",
        "ink-marker"
    ];

    E.preview.classList.remove(...effects);

    const selected = E.inkEffect.value;

    if (selected !== "normal") {
        E.preview.classList.add("ink-" + selected);
    }
}

/* ---------- FONT LOADING ---------- */

async function waitForFonts() {

    if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
    }
}

/* ---------- SIGNATURE UPLOAD ---------- */

E.signature.addEventListener("change", event => {

    const file = event.target.files[0];

    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
        alert("Please select PNG, JPG or WEBP signature image.");
        E.signature.value = "";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("Signature image must be smaller than 5 MB.");
        E.signature.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = event => {

        signatureData = event.target.result;

        if (E.signaturePreview) {
            E.signaturePreview.src = signatureData;
            E.signaturePreview.style.display = "block";
        }

        updateSignature();
    };

    reader.onerror = () => {
        alert("Unable to read signature image.");
    };

    reader.readAsDataURL(file);
});

/* ---------- HEADING AND BOLD TOOLBAR ---------- */

document.querySelectorAll("[data-format]").forEach(button => {
    button.addEventListener("click", () => {
        const textarea = E.text;
        const format = button.dataset.format;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
        const selected = value.slice(start, end);
        let before = "", after = "", replacement = selected;
        if (format === "bold") {
            before = "**"; after = "**";
            if (!selected) replacement = "bold text";
            textarea.setRangeText(before + replacement + after, start, end, "select");
            if (!selected) textarea.setSelectionRange(start + 2, start + 2 + replacement.length);
        } else {
            const prefix = format === "h1" ? "# " : format === "h2" ? "## " : "### ";
            const lineEndIndex = value.indexOf("\n", start);
            const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
            let line = value.slice(lineStart, lineEnd).replace(/^#{1,3}\s+/, "");
            const updated = prefix + line;
            textarea.setRangeText(updated, lineStart, lineEnd, "select");
            textarea.setSelectionRange(lineStart + prefix.length, lineStart + updated.length);
        }
        textarea.focus();
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
    });
});

/* ---------- LIVE PREVIEW ---------- */

[
    E.text,
    E.font,
    E.ink,
    E.paper,
    E.paperStyle,
    E.inkEffect,
    E.watermark,
    E.student,
    E.school,
    E.date
].forEach(element => {

    element.addEventListener("input", updatePreview);

    element.addEventListener("change", updatePreview);

});

/* ---------- CONVERT BUTTON ---------- */

E.convert.addEventListener("click", () => {

    updatePreview();

    alert("Your handwriting preview has been updated!");

});

/* =====================================================
   END OF PART 1
   DO NOT CLOSE THE MAIN FUNCTION HERE.
===================================================== */
/* =====================================================
   PART 2: EXPORT, DOWNLOAD, THEME, RESET & STORAGE
===================================================== */

/* ---------- PAPER COLOR ---------- */

function updatePaperColor() {
    // Set the background on the whole physical A4 sheet so PDF export captures it.
    page.style.backgroundColor = E.paper.value;
}

E.paper.addEventListener("input", updatePaperColor);
E.paper.addEventListener("change", updatePaperColor);

/* ---------- CHECK EXPORT LIBRARIES ---------- */

function checkHTML2Canvas() {

    if (typeof window.html2canvas !== "function") {
        throw new Error("HTML2Canvas library is not loaded.");
    }
}

function checkPDFLibrary() {

    if (!window.jspdf || !window.jspdf.jsPDF) {
        throw new Error("PDF library is not loaded.");
    }
}

/* ---------- RENDER A4 PAGE ---------- */

async function renderPage() {

    checkHTML2Canvas();

    await waitForFonts();

    return await window.html2canvas(page, {

        scale: 2,

        useCORS: true,

        allowTaint: false,

        backgroundColor: E.paper.value,

        logging: false,

        windowWidth: Math.max(
            document.documentElement.clientWidth,
            page.scrollWidth
        )

    });
}

/* ---------- DOWNLOAD HELPER ---------- */

function downloadFile(url, filename) {

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();
}

/* ---------- PNG DOWNLOAD ---------- */

async function downloadPNG() {

    const button = E.png;

    try {

        button.disabled = true;
        button.textContent = "Preparing PNG...";

        const canvas = await renderPage();

        const image = canvas.toDataURL("image/png");

        downloadFile(image, "handwriting.png");

    } catch (error) {

        console.error("PNG Error:", error);

        alert("PNG download failed. Please check your internet connection.");

    } finally {

        button.disabled = false;
        button.textContent = "🖼️ Download PNG";

    }
}

/* ---------- PDF DOWNLOAD ---------- */

async function downloadPDF() {

    const button = E.pdf;

    try {

        button.disabled = true;
        button.textContent = "Preparing PDF...";

        checkPDFLibrary();

        const canvas = await renderPage();

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF({

            orientation: "portrait",

            unit: "mm",

            format: "a4"

        });

        const image = canvas.toDataURL("image/jpeg", 0.95);

        const pageWidth = 210;
        const pageHeight = 297;

        const imageHeight =
            canvas.height * pageWidth / canvas.width;

        // Fit the A4 preview to the A4 PDF page.
        pdf.addImage(
            image,
            "JPEG",
            0,
            0,
            pageWidth,
            Math.min(imageHeight, pageHeight)
        );

        pdf.save("handwriting.pdf");

    } catch (error) {

        console.error("PDF Error:", error);

        alert("PDF download failed. Please check that the PDF library is loaded.");

    } finally {

        button.disabled = false;
        button.textContent = "📄 Download PDF";

    }
}

/* ---------- DOCX DOWNLOAD ---------- */

function downloadDOCX() {

    try {

        if (
            !window.htmlDocx ||
            typeof window.htmlDocx.asBlob !== "function"
        ) {
            throw new Error("DOCX library is not loaded.");
        }

        const clone = page.cloneNode(true);

        clone.style.width = "794px";
        clone.style.backgroundColor = E.paper.value;

        const documentHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">

            <style>

                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                }

                .page {
                    width: 100%;
                    padding: 30px;
                    background: ${E.paper.value};
                }

                .page-content {
                    white-space: pre-wrap;
                    line-height: 1.8;
                }

                .signature-on-page {
                    max-width: 180px;
                    max-height: 90px;
                }

            </style>

        </head>

        <body>

            ${clone.outerHTML}

        </body>
        </html>
        `;

        const blob = window.htmlDocx.asBlob(documentHTML);

        const url = URL.createObjectURL(blob);

        downloadFile(url, "handwriting.docx");

        setTimeout(() => URL.revokeObjectURL(url), 2000);

    } catch (error) {

        console.error("DOCX Error:", error);

        alert("DOCX download failed. Please check the DOCX library.");

    }
}

/* ---------- PRINT ---------- */

function printDocument() {

    updatePreview();

    window.print();

}

/* ---------- COPY TEXT ---------- */

async function copyText() {

    try {

        await navigator.clipboard.writeText(E.text.value);

        alert("Text copied successfully!");

    } catch (error) {

        console.error(error);

        alert("Text copy failed. Please use HTTPS or localhost.");

    }
}

/* ---------- COPY IMAGE ---------- */

async function copyImage() {

    try {

        if (
            !navigator.clipboard ||
            typeof ClipboardItem === "undefined"
        ) {
            throw new Error("Image clipboard is not supported.");
        }

        const canvas = await renderPage();

        const blob = await new Promise(resolve => {

            canvas.toBlob(resolve, "image/png");

        });

        if (!blob) {
            throw new Error("Unable to create image.");
        }

        await navigator.clipboard.write([

            new ClipboardItem({

                "image/png": blob

            })

        ]);

        alert("Image copied successfully!");

    } catch (error) {

        console.error("Copy Image Error:", error);

        alert("Image copy failed. Please use Chrome on HTTPS or localhost.");

    }
}

/* ---------- DARK MODE ---------- */

function setTheme(theme) {

    const dark = theme === "dark";

    document.body.classList.toggle("dark-mode", dark);

    E.theme.textContent = dark
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";

    try {

        localStorage.setItem("theme", theme);

    } catch (error) {

        console.warn("Theme could not be saved.");

    }
}

E.theme.addEventListener("click", () => {

    const dark = document.body.classList.contains("dark-mode");

    setTheme(dark ? "light" : "dark");

});

/* ---------- START WRITING ---------- */

E.start.addEventListener("click", () => {

    const editor = document.querySelector(".main-layout");

    if (editor) {

        editor.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }

    E.text.focus({ preventScroll: true });

});

/* ---------- AUTO SAVE ---------- */

function saveSettings() {

    const settings = {

        text: E.text.value,

        font: E.font.value,

        ink: E.ink.value,

        paper: E.paper.value,

        paperStyle: E.paperStyle.value,

        inkEffect: E.inkEffect.value,

        watermark: E.watermark.value,

        student: E.student.value,

        school: E.school.value,

        date: E.date.value

    };

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(settings)
        );

    } catch (error) {

        console.warn("Settings could not be saved.");

    }

}

/* ---------- RESTORE SETTINGS ---------- */

function restoreSettings() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) return;

        const data = JSON.parse(saved);

        E.text.value = data.text || "";

        E.font.value = data.font || E.font.value;

        E.ink.value = data.ink || DEFAULTS.ink;

        E.paper.value = data.paper || DEFAULTS.paper;

        E.paperStyle.value =
            data.paperStyle || DEFAULTS.paperStyle;

        E.inkEffect.value =
            data.inkEffect || DEFAULTS.inkEffect;

        E.watermark.value = data.watermark || "";

        E.student.value = data.student || "";

        E.school.value = data.school || "";

        E.date.value = data.date || "";

    } catch (error) {

        console.warn("Could not restore saved settings.");

    }

}

/* ---------- RESET EVERYTHING ---------- */

function resetEverything() {

    const confirmed = confirm(
        "Are you sure you want to reset all settings?"
    );

    if (!confirmed) return;

    E.text.value = "";

    E.font.selectedIndex = 0;

    E.ink.value = DEFAULTS.ink;

    E.paper.value = DEFAULTS.paper;

    E.paperStyle.value = DEFAULTS.paperStyle;

    E.inkEffect.value = DEFAULTS.inkEffect;

    E.watermark.value = "";

    E.student.value = "";

    E.school.value = "";

    E.date.value = "";

    E.signature.value = "";

    signatureData = "";

    E.signaturePreview.removeAttribute("src");

    E.signaturePreview.style.display = "none";

    try {

        localStorage.removeItem(STORAGE_KEY);

    } catch (error) {

        console.warn("Reset storage error:", error);

    }

    updatePreview();

    updatePaperColor();

    setTheme("light");

    alert("All settings have been reset!");

}

/* ---------- BUTTON EVENTS ---------- */

E.png.addEventListener("click", downloadPNG);

E.pdf.addEventListener("click", downloadPDF);

E.docx.addEventListener("click", downloadDOCX);

E.print.addEventListener("click", printDocument);

E.copyText.addEventListener("click", copyText);

E.copyImage.addEventListener("click", copyImage);

E.reset.addEventListener("click", resetEverything);

/* ---------- AUTO SAVE EVENTS ---------- */

[
    E.text,
    E.font,
    E.ink,
    E.paper,
    E.paperStyle,
    E.inkEffect,
    E.watermark,
    E.student,
    E.school,
    E.date

].forEach(element => {

    element.addEventListener("input", saveSettings);

    element.addEventListener("change", saveSettings);

});

/* ---------- INITIALIZE APPLICATION ---------- */

restoreSettings();

try {

    setTheme(localStorage.getItem("theme") || "light");

} catch (error) {

    setTheme("light");

}

updatePreview();

updatePaperColor();

/* ---------- APPLICATION READY ---------- */

console.log(
    "Handwriting Converter Pro Version 11.0 Loaded Successfully!"
);

/* =====================================================
   END OF HANDWRITING CONVERTER PRO
===================================================== */

})();