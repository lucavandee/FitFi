// Minimal, safe-ish markdown → HTML (kopjes, bold/italic, lists, links, linebreaks)
export function mdNova(input: string) {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  let s = esc(input);

  // Headings (##, #) → strong + break (compact in bubbles)
  s = s.replace(/^###?\s+(.+)$/gim, "<strong>$1</strong><br/>");

  // Bold / italic
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Bulleted lists: "- " / "* " / "• " aan het begin van de regel
  s = s.replace(/^(?:-|\*|•)\s+(.+)$/gim, "• $1");

  // Ordered lists: "1. " → "1) "
  s = s.replace(/^(\d+)\.\s+(.+)$/gim, "$1) $2");

  // Autolink (http/https)
  s = s.replace(
    /(https?:\/\/[^\s)<>"']+)/g,
    '<a href="$1" target="_blank" rel="nofollow noopener noreferrer" class="text-[#89CFF0] underline decoration-[#89CFF0] underline-offset-2 hover:opacity-80">$1</a>',
  );

  // Paragraph breaks
  s = s.replace(/\n{2,}/g, "<br/><br/>").replace(/\n/g, "<br/>");
  return s;
}
