"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, ChevronDown, ChevronUp, ClipboardList, Info, Printer, User } from "lucide-react"
import {
  CCTA_PROTOCOL_SHEETS,
  PROTOCOL_DISCLAIMER,
  PROTOCOL_REF,
  PROTOCOL_TITLE,
  PROTOCOL_VERSION,
  getProtocolAlerts,
  type ProtocolAlert,
  type ProtocolBlock,
  type ProtocolSheet,
} from "@/lib/ccta-protocol"
import { buildProtocolPrintHTML } from "@/lib/ccta-protocol-print"
import type { ClinicalModifiers } from "@/lib/pathway"

const TONE: Record<ProtocolAlert["tone"], { bg: string; border: string; color: string; text: string }> = {
  info: { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8", text: "#1e3a8a" },
  warn: { bg: "#fffbeb", border: "#fcd34d", color: "#b45309", text: "#78350f" },
  danger: { bg: "#fef2f2", border: "#fca5a5", color: "#b91c1c", text: "#7f1d1d" },
}

// ── Panneau affiché sous la prescription ─────────────────────────────────────

/**
 * Protocole de préparation du coroscanner.
 *
 * N'apparaît que lorsque l'examen prescrit est le coroscanner : c'est à ce
 * moment-là que le cabinet doit envoyer les consignes au patient et faire
 * figurer sur la demande ce que le service d'imagerie doit anticiper. Les
 * points d'attention sont déduits du contexte clinique déjà saisi juste
 * au-dessus et restent visibles panneau replié ; le protocole intégral
 * (4 feuilles) se déplie et s'imprime en A4.
 */
export function CctaProtocolPanel({
  mods,
  accentColor,
  /** Vrai quand le coroscanner n'est qu'une solution de repli, pas le 1er examen. */
  asFallback = false,
}: {
  mods: ClinicalModifiers
  accentColor: string
  asFallback?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [activeSheet, setActiveSheet] = useState<ProtocolSheet["id"]>("parcours")

  const alerts = useMemo(() => getProtocolAlerts(mods), [mods])
  const sheet = CCTA_PROTOCOL_SHEETS.find((s) => s.id === activeSheet) ?? CCTA_PROTOCOL_SHEETS[0]

  return (
    <div className="rounded-xl border border-[#e2e8f0] overflow-hidden bg-white">
      <div className="px-3 py-2.5 flex items-start justify-between gap-2 bg-[#f8fafc] border-b border-[#f1f5f9]">
        <div className="flex items-start gap-2 min-w-0">
          <ClipboardList className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: accentColor }} aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#1e293b] leading-tight">
              Préparation du coroscanner — protocole de service
            </p>
            <p className="text-[10px] text-[#64748b] leading-tight mt-0.5">
              Réf. {PROTOCOL_REF} {PROTOCOL_VERSION} · {PROTOCOL_TITLE}
              {asFallback ? " — utile si le coroscanner est retenu en repli" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Ce que le praticien doit faire figurer sur la demande, ici et maintenant. */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">
              À mentionner sur la demande — d&apos;après le contexte saisi
            </p>
            {alerts.map((alert, i) => {
              const t = TONE[alert.tone]
              const target = CCTA_PROTOCOL_SHEETS.find((s) => s.id === alert.sheet)
              return (
                <div
                  key={i}
                  className="rounded-lg border p-2.5"
                  style={{ backgroundColor: t.bg, borderColor: t.border }}
                >
                  <div className="flex items-start gap-2">
                    {alert.tone === "info" ? (
                      <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: t.color }} aria-hidden="true" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: t.color }} aria-hidden="true" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold" style={{ color: t.color }}>{alert.title}</p>
                      <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: t.text }}>{alert.text}</p>
                      {target && (
                        <button
                          type="button"
                          onClick={() => { setActiveSheet(target.id); setOpen(true) }}
                          className="mt-1.5 text-[10px] font-semibold underline underline-offset-2"
                          style={{ color: t.color }}
                        >
                          Voir la feuille « {target.tab} »
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => printSheets(["parcours", "allergie", "frequence", "patient"])}
            className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: accentColor }}
          >
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            Imprimer le protocole (4 feuilles)
          </button>
          <button
            type="button"
            onClick={() => printSheets(["patient"])}
            className="flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 text-xs font-bold transition-colors hover:bg-[#f8fafc]"
            style={{ borderColor: accentColor, color: accentColor }}
          >
            <User className="w-3.5 h-3.5" aria-hidden="true" />
            Fiche à remettre au patient
          </button>
        </div>

        <p className="text-[10px] leading-relaxed text-[#94a3b8]">
          Format A4, marges 12 mm. Feuilles 1 à 3 : protocole de service. Feuille 4 : fiche patient, à
          remettre avec l&apos;ordonnance de bradycardisation si elle est indiquée.
        </p>

        <div className="rounded-lg border border-[#e2e8f0] overflow-hidden">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="w-full px-3 py-2.5 flex items-center justify-between gap-2 bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors text-left"
          >
            <span className="text-xs font-semibold text-[#475569]">
              {open ? "Masquer le protocole" : "Consulter le protocole à l'écran — 4 feuilles"}
            </span>
            {open ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#94a3b8] flex-shrink-0" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8] flex-shrink-0" />
            )}
          </button>

          {open && (
            <div className="border-t border-[#f1f5f9]">
              <div className="flex flex-wrap gap-1.5 p-2 bg-[#f8fafc] border-b border-[#f1f5f9]">
                {CCTA_PROTOCOL_SHEETS.map((s) => {
                  const active = s.id === activeSheet
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActiveSheet(s.id)}
                      aria-pressed={active}
                      className="rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors border"
                      style={{
                        backgroundColor: active ? accentColor : "white",
                        borderColor: active ? accentColor : "#e2e8f0",
                        color: active ? "white" : "#475569",
                      }}
                    >
                      {s.sheet}. {s.tab}
                    </button>
                  )
                })}
              </div>

              <div className="p-3 space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                    {sheet.eyebrow}
                  </p>
                  <p className="text-sm font-bold text-[#0f172a] mt-0.5">{sheet.title}</p>
                  {sheet.intro && (
                    <p className="text-[11px] leading-relaxed text-[#475569] mt-1.5">{sheet.intro}</p>
                  )}
                </div>

                {sheet.sections.map((section, i) => (
                  <section key={i} className="space-y-2">
                    <div className="flex items-center gap-2">
                      {section.index && (
                        <span
                          className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: accentColor }}
                        >
                          {section.index}
                        </span>
                      )}
                      <h4 className="text-xs font-bold text-[#1e293b] leading-snug">{section.title}</h4>
                    </div>
                    {section.blocks.map((block, j) => (
                      <BlockView key={j} block={block} accentColor={accentColor} />
                    ))}
                  </section>
                ))}

                <p className="text-[10px] leading-relaxed text-[#94a3b8] border-t border-[#f1f5f9] pt-2.5">
                  {PROTOCOL_DISCLAIMER}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Rendu à l'écran d'un bloc ────────────────────────────────────────────────

function BlockView({ block, accentColor }: { block: ProtocolBlock; accentColor: string }) {
  switch (block.kind) {
    case "paragraph":
      return <p className="text-[11px] leading-relaxed text-[#475569]">{block.text}</p>

    case "bullets":
      return (
        <ul className="space-y-1.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px] leading-relaxed text-[#475569]">
              <span className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: accentColor }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )

    case "table2":
    case "table3": {
      const head = block.head as string[]
      const rows = block.rows as string[][]
      return (
        <div className="overflow-x-auto rounded-lg border border-[#e2e8f0]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f8fafc]">
                {head.map((h, i) => (
                  <th
                    key={i}
                    className="text-left text-[10px] font-bold uppercase tracking-wide text-[#64748b] px-2.5 py-1.5 border-b border-[#e2e8f0]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="align-top">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="text-[11px] leading-relaxed px-2.5 py-2 border-b border-[#f1f5f9]"
                      style={{ color: j === 0 ? "#1e293b" : "#475569", fontWeight: j === 0 ? 600 : 400 }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    case "timeline":
      return (
        <div className="space-y-2">
          {block.entries.map((entry, i) => (
            <div key={i} className="rounded-lg border border-[#e2e8f0] overflow-hidden">
              <div className="px-2.5 py-1.5 flex items-baseline gap-2" style={{ backgroundColor: `${accentColor}10` }}>
                <span className="text-xs font-black" style={{ color: accentColor }}>{entry.tag}</span>
                <span className="text-[10px] text-[#64748b]">{entry.tagSub}</span>
              </div>
              <ul className="p-2.5 space-y-1.5">
                {entry.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-[11px] leading-relaxed text-[#475569]">
                    <span className="w-1 h-1 rounded-full bg-[#cbd5e1] flex-shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )

    case "note": {
      const t = TONE[block.tone]
      return (
        <div className="rounded-lg border p-2.5" style={{ backgroundColor: t.bg, borderColor: t.border }}>
          <div className="flex items-start gap-2">
            {block.tone === "info" ? (
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: t.color }} aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: t.color }} aria-hidden="true" />
            )}
            <div className="min-w-0">
              <p className="text-[11px] font-bold" style={{ color: t.color }}>{block.title}</p>
              <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: t.text }}>{block.text}</p>
            </div>
          </div>
        </div>
      )
    }

    case "cards":
      return (
        <div className={`grid grid-cols-1 gap-2 ${block.columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {block.items.map((card, i) => (
            <div key={i} className="rounded-lg border border-[#e2e8f0] bg-white p-2.5">
              <p className="text-[11px] font-bold text-[#1e293b] leading-snug">
                {card.title}
                {card.subtitle && (
                  <span className="ml-1.5 text-[10px] font-semibold text-[#94a3b8]">({card.subtitle})</span>
                )}
              </p>
              <ul className="mt-1.5 space-y-1">
                {card.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-[11px] leading-relaxed text-[#475569]">
                    <span className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: accentColor }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )

    case "prescription":
      return (
        <div className="rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-2.5">
          <p className="text-[11px] font-bold text-[#1e293b] leading-snug">{block.title}</p>
          <pre className="mt-1.5 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-[#334155]">
            {block.lines.join("\n")}
          </pre>
          {block.note && <p className="mt-1.5 text-[10px] leading-relaxed text-[#b45309]">{block.note}</p>}
        </div>
      )

    case "algorithm":
      return (
        <div className="space-y-1.5">
          {block.rows.map((row, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-lg border border-[#e2e8f0] bg-white p-2.5">
              <span
                className="rounded-md px-2 py-1 text-[11px] font-black text-white flex-shrink-0 min-w-[52px] text-center"
                style={{ backgroundColor: accentColor }}
              >
                {row.band}
              </span>
              <span className="text-[11px] leading-relaxed text-[#475569]">{row.text}</span>
            </div>
          ))}
        </div>
      )

    case "fields":
      return (
        <div className="space-y-1.5">
          {block.items.map((item, i) => (
            <p key={i} className="text-[11px] font-semibold text-[#1e293b]">{item}</p>
          ))}
        </div>
      )
  }
}

// ── Impression A4 ────────────────────────────────────────────────────────────

function printSheets(ids: ProtocolSheet["id"][]) {
  const html = buildProtocolPrintHTML(ids)
  const win = window.open("", "_blank", "width=900,height=700")
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print() }, 400)
}
