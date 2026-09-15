"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getUiTranslation } from "@/lib/translations";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="min-h-[560px] animate-pulse bg-white" />,
});

export function RichTextEditor({ initialContent, onChange }: { initialContent: string; onChange: (html: string) => void }) {
  const ui = getUiTranslation(getLocale(usePathname()));
  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }, { font: [] }, { size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }, { list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
      ["blockquote", "code-block", "link", "image", "video"],
      ["clean"],
    ],
    history: { delay: 500, maxStack: 100, userOnly: true },
    clipboard: { matchVisual: false },
  }), []);

  const formats = [
    "font", "size", "header", "bold", "italic", "underline", "strike",
    "color", "background", "align", "list", "bullet", "indent",
    "blockquote", "code-block", "link", "image", "video",
  ];

  return <div className="legal-quill-editor w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xs">
    <ReactQuill
      theme="snow"
      defaultValue={initialContent.includes("<") ? initialContent : plainTextToHtml(initialContent)}
      onChange={onChange}
      modules={modules}
      formats={formats}
      placeholder={ui.editorPlaceholder}
    />
  </div>;
}

function plainTextToHtml(value: string) {
  return value.split(/\n{2,}/).map((block) => {
    const trimmed = block.trim();
    const lines = trimmed.split("\n");
    if (/^\d+\.\s/.test(lines[0])) {
      const heading = lines.shift()?.replace(/^\d+\.\s*/, "") ?? "";
      return `<h2>${heading}</h2>${lines.length ? `<p>${lines.join("<br>")}</p>` : ""}`;
    }
    return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
  }).join("");
}
