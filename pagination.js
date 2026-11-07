/* =====================================
   HANDWRITING PRO
   AUTOMATIC UNLIMITED PAGINATION
===================================== */

(() => {
    "use strict";

    const input = document.getElementById("textInput");
    const container = document.getElementById("previewContainer");
    const counter = document.getElementById("pageCounter");

    if (!input || !container) {
        console.error("Pagination elements not found.");
        return;
    }

    const originalPage = container.querySelector(".page");

    if (!originalPage) return;

    const originalPreview = originalPage.querySelector(".page-content");

    if (!originalPreview) return;

    const pages = [originalPage];

    let updating = false;

    /* Create additional pages */

    function createPage() {

        const page = originalPage.cloneNode(true);

        page.querySelectorAll("[id]").forEach(el => {
            el.removeAttribute("id");
        });

        const content = page.querySelector(".page-content");

        content.textContent = "";

        container.appendChild(page);

        pages.push(page);

        return content;
    }

    /* Remove unnecessary pages */

    function clearExtraPages() {

        while (pages.length > 1) {

            const page = pages.pop();

            page.remove();

        }

    }

    /* Measure text height */

    function createMeasurementElement(content) {

        const measure = document.createElement("div");

        const style = getComputedStyle(content);

        measure.style.cssText = `
            position: fixed;
            left: -10000px;
            top: 0;
            visibility: hidden;
            width: ${content.clientWidth}px;
            height: auto;
            min-height: 0;
            padding: 0;
            margin: 0;
            border: 0;
            box-sizing: border-box;
            font-family: ${style.fontFamily};
            font-size: ${style.fontSize};
            font-weight: ${style.fontWeight};
            font-style: ${style.fontStyle};
            line-height: ${style.lineHeight};
            letter-spacing: ${style.letterSpacing};
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            word-break: normal;
            direction: ${style.direction};
        `;

        document.body.appendChild(measure);

        return measure;
    }

    /* Find text that fits on one page */

    function splitText(text, content) {

        if (!text) return [""];

        const measure = createMeasurementElement(content);

        const maxHeight = content.clientHeight;

        const characters = Array.from(text);

        const result = [];

        let position = 0;

        while (position < characters.length) {

            let low = 1;

            let high = characters.length - position;

            let best = 0;

            while (low <= high) {

                const middle = Math.floor((low + high) / 2);

                measure.textContent =
                    characters.slice(position, position + middle).join("");

                if (measure.scrollHeight <= maxHeight) {

                    best = middle;

                    low = middle + 1;

                } else {

                    high = middle - 1;

                }
            }

            if (best === 0) best = 1;

            let end = position + best;

            if (end < characters.length) {

                const section = characters
                    .slice(position, end)
                    .join("");

                const lastSpace = Math.max(
                    section.lastIndexOf(" "),
                    section.lastIndexOf("\n"),
                    section.lastIndexOf("\t")
                );

                if (lastSpace > 0) {
                    end = position + lastSpace + 1;
                }
            }

            result.push(
                characters.slice(position, end).join("")
            );

            position = end;
        }

        measure.remove();

        return result;
    }

    /* Generate all pages */

    function updatePages() {

        if (updating) return;

        updating = true;

        try {

            const text = input.value;

            clearExtraPages();

            const firstContent = originalPage.querySelector(".page-content");

            firstContent.textContent = "";

            const chunks = splitText(text, firstContent);

            chunks.forEach((chunk, index) => {

                let content;

                if (index === 0) {

                    content = firstContent;

                } else {

                    content = createPage();

                }

                if (window.renderHandwritingText) {
                    window.renderHandwritingText(content, chunk);
                } else {
                    content.textContent = chunk;
                }

            });

            if (counter) {

                counter.textContent =
                    `Page 1 of ${pages.length}`;

            }

        } finally {

            updating = false;

        }
    }

    /* Update page counter while scrolling */

    function updateCounter() {

        const pageHeight = originalPage.getBoundingClientRect().height;

        const containerTop = container.getBoundingClientRect().top;

        let current = 1;

        pages.forEach((page, index) => {

            const distance = Math.abs(
                page.getBoundingClientRect().top - containerTop
            );

            if (distance < pageHeight / 2) {
                current = index + 1;
            }

        });

        if (counter) {
            counter.textContent =
                `Page ${current} of ${pages.length}`;
        }
    }

    /* Recalculate when writing changes */

    input.addEventListener("input", updatePages);

    input.addEventListener("change", updatePages);

    window.addEventListener("resize", updatePages);

    /* Export all pages to PDF */

    const pdfButton = document.getElementById("pdfBtn");

    if (pdfButton) {

        pdfButton.addEventListener("click", async event => {

            event.stopImmediatePropagation();

            try {

                if (!window.html2canvas ||
                    !window.jspdf ||
                    !window.jspdf.jsPDF) {

                    throw new Error("Export libraries missing.");

                }

                await document.fonts.ready;

                const { jsPDF } = window.jspdf;

                const pdf = new jsPDF("p", "mm", "a4");

                for (let i = 0; i < pages.length; i++) {

                    const canvas = await html2canvas(pages[i], {
                        scale: 2,
                        useCORS: true,
                        backgroundColor: null
                    });

                    const image = canvas.toDataURL("image/png");

                    if (i > 0) pdf.addPage("a4", "portrait");

                    pdf.addImage(image, "PNG", 0, 0, 210, 297);

                }

                pdf.save("handwriting-all-pages.pdf");

            } catch (error) {

                console.error(error);

                alert("PDF export failed. Please try again.");

            }

        }, true);
    }

    /* Export all pages to DOCX */

    const docxButton = document.getElementById("docxBtn");

    if (docxButton) {

        docxButton.addEventListener("click", event => {

            event.stopImmediatePropagation();

            try {

                if (!window.htmlDocx) {
                    throw new Error("DOCX library missing.");
                }

                const html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    <meta charset="UTF-8">
                    </head>
                    <body>
                    ${pages.map(page => page.outerHTML).join(
                        '<div style="page-break-after:always"></div>'
                    )}
                    </body>
                    </html>
                `;

                const blob = window.htmlDocx.asBlob(html);

                const url = URL.createObjectURL(blob);

                const link = document.createElement("a");

                link.href = url;
                link.download = "handwriting-all-pages.docx";

                link.click();

                setTimeout(() => URL.revokeObjectURL(url), 2000);

            } catch (error) {

                console.error(error);

                alert("DOCX export failed.");

            }

        }, true);
    }

    /* Print all pages */

    const printButton = document.getElementById("printBtn");

    if (printButton) {

        printButton.addEventListener("click", event => {

            event.stopImmediatePropagation();

            window.print();

        }, true);
    }

    /* Initial setup */

    updatePages();

    console.log("Unlimited Multi-Page System Loaded!");

})();