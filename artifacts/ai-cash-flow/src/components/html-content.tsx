import { useRef, useEffect } from "react";

interface HtmlContentProps {
  html: string;
  className?: string;
}

function isHtml(str: string): boolean {
  return /<[a-zA-Z][\s\S]*>/i.test(str);
}

export function HtmlContent({ html, className = "" }: HtmlContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && html) {
      ref.current.innerHTML = isHtml(html)
        ? html
        : html.replace(/\n/g, "<br>");
    }
  }, [html]);

  if (!html) return null;

  return (
    <div
      ref={ref}
      className={[
        "prose",
        "prose-sm",
        "max-w-none",
        "prose-headings:font-bold",
        "prose-headings:tracking-tight",
        "prose-a:text-primary",
        "prose-a:underline",
        "prose-img:rounded-lg",
        "prose-ul:list-disc",
        "prose-ol:list-decimal",
        "prose-p:my-2",
        "prose-blockquote:border-l-4",
        "prose-blockquote:pl-4",
        "prose-blockquote:italic",
        "[&_strong]:font-bold",
        "[&_em]:italic",
        "[&_h1]:text-2xl",
        "[&_h1]:font-black",
        "[&_h1]:mt-4",
        "[&_h1]:mb-2",
        "[&_h2]:text-xl",
        "[&_h2]:font-black",
        "[&_h2]:mt-4",
        "[&_h2]:mb-2",
        "[&_h3]:text-lg",
        "[&_h3]:font-bold",
        "[&_h3]:mt-3",
        "[&_h3]:mb-1",
        "[&_p]:my-2",
        "[&_ul]:list-disc",
        "[&_ul]:pl-5",
        "[&_ul]:my-2",
        "[&_ol]:list-decimal",
        "[&_ol]:pl-5",
        "[&_ol]:my-2",
        "[&_li]:my-1",
        "[&_blockquote]:border-l-4",
        "[&_blockquote]:border-primary/40",
        "[&_blockquote]:pl-4",
        "[&_blockquote]:italic",
        "[&_blockquote]:text-muted-foreground",
        "[&_blockquote]:my-3",
        "[&_hr]:my-4",
        "[&_hr]:border-border",
        "[&_a]:text-primary",
        "[&_a]:underline",
        "[&_iframe]:w-full",
        "[&_iframe]:rounded-lg",
        "[&_iframe]:my-2",
        className,
      ].filter(Boolean).join(" ")}
    />
  );
}
