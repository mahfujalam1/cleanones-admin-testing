"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="min-h-[560px] animate-pulse bg-white" />,
});

export function RichTextEditor({ initialContent, onChange }: { initialContent: string; onChange: (html: string) => void }) {
  const modules = useMemo(() => ({
    toolbar: [
      [{ font: [] }, { size: ["small", false, "large", "huge"] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["blockquote", "code-block"],
      ["link", "image", "video"],
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

  return <div className="legal-quill-editor w-full overflow-hidden rounded border border-slate-200 bg-white">
    <ReactQuill
      theme="snow"
      defaultValue={initialContent.includes("<") ? initialContent : plainTextToHtml(initialContent)}
      onChange={onChange}
      modules={modules}
      formats={formats}
      placeholder="Write the legal document..."
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
