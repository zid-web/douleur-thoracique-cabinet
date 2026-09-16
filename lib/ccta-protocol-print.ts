/**
 * Document imprimable du protocole coro-scanner — format A4, marges 12 mm.
 *
 * Feuilles 1 à 3 : protocole de service. Feuille 4 : fiche remise au patient.
 * Chaque feuille tient sur une page : la mise en page est resserrée pour
 * qu'un tirage recto-verso donne exactement le document décrit par la
 * procédure, et non des pages orphelines.
 *
 * Le contenu vient de `ccta-protocol.ts` : ce module ne fait que le mettre
 * en page, de sorte qu'écran et papier ne puissent pas diverger.
 */

import {
  CCTA_PROTOCOL_SHEETS,
  PROTOCOL_DISCLAIMER,
  PROTOCOL_REF,
  PROTOCOL_TITLE,
  PROTOCOL_VERSION,
  type ProtocolBlock,
  type ProtocolSheet,
} from "./ccta-protocol"


function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function blockHTML(block: ProtocolBlock): string {
  switch (block.kind) {
    case "paragraph":
      return `<p class="para">${esc(block.text)}</p>`

    case "bullets":
      return `<ul class="bullets">${block.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`

    case "table2":
    case "table3": {
      const head = (block.head as string[]).map((h) => `<th>${esc(h)}</th>`).join("")
      const rows = (block.rows as string[][])
        .map(
          (row) =>
            `<tr>${row
              .map((cell, j) => `<td class="${j === 0 ? "cell-key" : ""}">${esc(cell)}</td>`)
              .join("")}</tr>`,
        )
        .join("")
      return `<table class="tbl"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`
    }

    case "timeline":
      return block.entries
        .map(
          (e) =>
            `<div class="tl"><div class="tl-head"><span class="tl-tag">${esc(e.tag)}</span><span class="tl-sub">${esc(
              e.tagSub,
            )}</span></div><ul class="bullets">${e.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`,
        )
        .join("")

    case "note":
      return `<div class="note note-${block.tone}"><p class="note-title">${esc(block.title)}</p><p class="note-text">${esc(
        block.text,
      )}</p></div>`

    case "cards":
      return `<div class="cards cards-${block.columns}">${block.items
        .map(
          (c) =>
            `<div class="card"><p class="card-title">${esc(c.title)}${
              c.subtitle ? ` <span class="card-sub">(${esc(c.subtitle)})</span>` : ""
            }</p><ul class="bullets">${c.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`,
        )
        .join("")}</div>`

    case "prescription":
      return `<div class="rx"><p class="rx-title">${esc(block.title)}</p><pre class="rx-body">${esc(
        block.lines.join("\n"),
      )}</pre>${block.note ? `<p class="rx-note">${esc(block.note)}</p>` : ""}</div>`

    case "algorithm":
      return `<div class="algo">${block.rows
        .map((r) => `<div class="algo-row"><span class="algo-band">${esc(r.band)}</span><span>${esc(r.text)}</span></div>`)
        .join("")}</div>`

    case "fields":
      return `<div class="fields">${block.items.map((i) => `<p>${esc(i)}</p>`).join("")}</div>`
  }
}

/**
 * Les ordonnances qui se suivent sont mises côte à côte : empilées, elles
 * faisaient déborder la feuille sur une seconde page pour rien.
 */
function renderBlocks(blocks: ProtocolBlock[]): string {
  let out = ""
  let i = 0
  while (i < blocks.length) {
    if (blocks[i].kind === "prescription") {
      let j = i
      while (j < blocks.length && blocks[j].kind === "prescription") j++
      const group = blocks.slice(i, j).map(blockHTML).join("")
      out += j - i > 1 ? `<div class="rx-grid">${group}</div>` : group
      i = j
      continue
    }
    out += blockHTML(blocks[i])
    i++
  }
  return out
}

function sheetHTML(sheet: ProtocolSheet, position: number, total: number): string {
  const sections = sheet.sections
    .map(
      (s) =>
        `<section class="sec"><h2 class="sec-title">${
          s.index ? `<span class="sec-num">${esc(s.index)}</span>` : ""
        }${esc(s.title)}</h2>${renderBlocks(s.blocks)}</section>`,
    )
    .join("")

  return `<div class="sheet${sheet.audience === "patient" ? " sheet-patient" : ""}">
  <header class="sheet-head">
    <div>
      <p class="eyebrow">${esc(sheet.eyebrow)}</p>
      <h1>${esc(sheet.title)}</h1>
    </div>
    <div class="sheet-meta">
      <p>Réf. ${esc(PROTOCOL_REF)} · ${esc(PROTOCOL_VERSION)}</p>
      ${
        sheet.audience === "patient"
          ? "<p>Fiche d'information — à conserver</p>"
          : "<p>Rédaction : …………………</p><p>Validation : …………………</p>"
      }
    </div>
  </header>
  ${sheet.intro ? `<p class="intro">${esc(sheet.intro)}</p>` : ""}
  ${sections}
  ${
    sheet.audience === "patient"
      ? `<p class="keep">Fiche patient · à conserver jusqu'au jour de l'examen</p>`
      : ""
  }
  <footer class="sheet-foot">
    <span>${esc(PROTOCOL_REF)} · ${esc(sheet.title)}</span>
    <span>Feuille ${position} / ${total}</span>
  </footer>
</div>`
}

export function buildProtocolPrintHTML(ids: ProtocolSheet["id"][]): string {
  const sheets = CCTA_PROTOCOL_SHEETS.filter((s) => ids.includes(s.id))
  const total = sheets.length
  const body = sheets.map((s, i) => sheetHTML(s, i + 1, total)).join("")

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>${esc(PROTOCOL_REF)} — ${esc(PROTOCOL_TITLE)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 9px; color: #1e293b; background: #fff; line-height: 1.38; }
  @page { size: A4; margin: 12mm; }

  .sheet { page-break-after: always; }
  .sheet:last-child { page-break-after: auto; }

  .sheet-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; border-bottom: 2px solid #1e293b; padding-bottom: 5px; margin-bottom: 7px; }
  .eyebrow { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; }
  .sheet-head h1 { font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 1px; }
  .sheet-meta { text-align: right; font-size: 8px; color: #64748b; line-height: 1.7; flex-shrink: 0; }

  .intro { font-size: 8.8px; color: #334155; background: #f8fafc; border-left: 3px solid #1e293b; padding: 5px 7px; margin-bottom: 7px; }

  .sec { margin-bottom: 5px; page-break-inside: avoid; }
  .sec-title { font-size: 10px; font-weight: 800; color: #0f172a; margin-bottom: 4px; display: flex; align-items: center; gap: 5px; }
  .sec-num { display: inline-flex; width: 14px; height: 14px; align-items: center; justify-content: center; border-radius: 3px; background: #1e293b; color: #fff; font-size: 8px; font-weight: 700; flex-shrink: 0; }

  .para { font-size: 8.8px; color: #334155; margin-bottom: 4px; }

  .bullets { list-style: none; margin: 0 0 4px 0; }
  .bullets li { position: relative; padding-left: 9px; font-size: 8.6px; color: #334155; margin-bottom: 1.5px; }
  .bullets li::before { content: ""; position: absolute; left: 2px; top: 5px; width: 2.5px; height: 2.5px; border-radius: 50%; background: #94a3b8; }

  .tbl { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
  .tbl th { text-align: left; font-size: 7.4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; background: #f8fafc; border: 1px solid #e2e8f0; padding: 2.5px 4px; }
  .tbl td { font-size: 8.4px; color: #334155; border: 1px solid #e2e8f0; padding: 2px 4px; vertical-align: top; }
  .tbl td.cell-key { font-weight: 700; color: #1e293b; width: 26%; }

  .tl { border: 1px solid #e2e8f0; border-radius: 4px; margin-bottom: 4px; page-break-inside: avoid; }
  .tl-head { background: #f1f5f9; padding: 2px 6px; display: flex; align-items: baseline; gap: 6px; }
  .tl-tag { font-size: 10px; font-weight: 900; color: #0f172a; }
  .tl-sub { font-size: 8px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; }
  .tl .bullets { padding: 4px 7px 3px; margin-bottom: 0; }

  .note { border: 1px solid #cbd5e1; border-left-width: 3px; border-radius: 3px; padding: 4px 7px; margin-bottom: 4px; page-break-inside: avoid; }
  .note-title { font-size: 8.4px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1px; }
  .note-text { font-size: 8.4px; color: #334155; }
  .note-info { background: #f8fafc; border-color: #cbd5e1; border-left-color: #1d4ed8; }
  .note-info .note-title { color: #1d4ed8; }
  .note-warn { background: #fffbeb; border-color: #fde68a; border-left-color: #b45309; }
  .note-warn .note-title { color: #b45309; }
  .note-danger { background: #fef2f2; border-color: #fecaca; border-left-color: #b91c1c; }
  .note-danger .note-title { color: #b91c1c; }

  .cards { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 4px; }
  .card { border: 1px solid #e2e8f0; border-radius: 4px; padding: 5px 6px; flex: 1 1 46%; page-break-inside: avoid; }
  .cards-3 .card { flex: 1 1 30%; }
  .card-title { font-size: 8.8px; font-weight: 800; color: #0f172a; margin-bottom: 2px; }
  .card-sub { font-weight: 600; color: #94a3b8; font-size: 8.5px; }
  .card .bullets { margin-bottom: 0; }

  .rx-grid { display: flex; flex-wrap: wrap; gap: 5px; }
  .rx-grid .rx { flex: 1 1 46%; margin-bottom: 0; }
  .rx { border: 1px dashed #94a3b8; border-radius: 4px; background: #f8fafc; padding: 5px 7px; margin-bottom: 4px; page-break-inside: avoid; }
  .rx-title { font-size: 8.8px; font-weight: 800; color: #0f172a; margin-bottom: 3px; }
  .rx-body { font-family: 'SFMono-Regular', Menlo, Consolas, monospace; font-size: 8.2px; color: #1e293b; white-space: pre-wrap; }
  .rx-note { font-size: 8.2px; color: #b45309; margin-top: 3px; }

  .algo { margin-bottom: 4px; }
  .algo-row { display: flex; gap: 7px; align-items: flex-start; border: 1px solid #e2e8f0; border-radius: 4px; padding: 3px 6px; margin-bottom: 2.5px; font-size: 8.4px; color: #334155; page-break-inside: avoid; }
  .algo-band { display: inline-block; min-width: 44px; text-align: center; background: #1e293b; color: #fff; font-weight: 800; font-size: 8.4px; border-radius: 3px; padding: 1.5px 5px; flex-shrink: 0; }

  .fields p { font-size: 10px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }

  /* Feuille patient : corps plus généreux, elle se lit à la maison. */
  .sheet-patient { font-size: 11px; line-height: 1.5; }
  .sheet-patient .sec { margin-bottom: 9px; }
  .sheet-patient .sec-title { font-size: 12px; margin-bottom: 5px; }
  .sheet-patient .bullets li,
  .sheet-patient .para { font-size: 10.5px; margin-bottom: 3px; }
  .sheet-patient .intro { font-size: 10.5px; padding: 8px 10px; margin-bottom: 10px; }
  .sheet-patient .fields { border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; padding: 8px 10px; }
  .sheet-patient .fields p { font-size: 11.5px; margin-bottom: 6px; }
  .sheet-patient .fields p:last-child { margin-bottom: 0; }
  .keep { font-size: 9px; color: #64748b; font-style: italic; margin-top: 8px; }

  .sheet-foot { display: flex; justify-content: space-between; font-size: 7.4px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 4px; margin-top: 7px; }

  .disclaimer { font-size: 8.5px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 8px; }
</style>
</head>
<body>
${body}
<p class="disclaimer">${esc(PROTOCOL_DISCLAIMER)} Champs « Réf. », rédaction, validation et coordonnées à compléter. Document généré par Filière Angor Cardiomaine.</p>
</body>
</html>`
}

