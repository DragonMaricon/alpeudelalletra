import { marked } from "marked";

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[character]);
}

function safeUrl(value, allowContactProtocols = false) {
    const url = String(value || "").trim();
    if (!url) return null;

    try {
        const protocol = new URL(url, "https://markdown.local").protocol;
        const allowedProtocols = allowContactProtocols
            ? ["http:", "https:", "mailto:", "tel:"]
            : ["http:", "https:"];
        return allowedProtocols.includes(protocol) ? url : null;
    } catch {
        return null;
    }
}

export function renderMarkdown(markdown) {
    // antes marked aceptaba html y enlaces tal cual; ahora se conserva el formato y se filtran etiquetas y protocolos peligrosos
    const renderer = new marked.Renderer();
    renderer.html = ({ text }) => escapeHtml(text);
    renderer.link = function ({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const safeHref = safeUrl(href, true);
        if (!safeHref) return text;

        const titleAttribute = title ? ` title="${escapeHtml(title)}"` : "";
        return `<a href="${escapeHtml(safeHref)}"${titleAttribute} rel="nofollow noopener noreferrer">${text}</a>`;
    };
    renderer.image = ({ href, title, text }) => {
        const safeSrc = safeUrl(href);
        if (!safeSrc) return escapeHtml(text);

        const titleAttribute = title ? ` title="${escapeHtml(title)}"` : "";
        return `<img src="${escapeHtml(safeSrc)}" alt="${escapeHtml(text)}"${titleAttribute}>`;
    };

    return marked.parse(markdown || "", { async: false, renderer });
}
