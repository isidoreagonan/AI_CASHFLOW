import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered,
  Link2, Link2Off, Image as ImageIcon, Youtube as YoutubeIcon,
  AlignLeft, AlignCenter, AlignRight, Undo, Redo, Minus,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function RichTextEditor({ value, onChange, placeholder = "Écris ici…", minHeight = 200 }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        // Disable extensions we add manually to avoid TipTap v3 duplicates
        link: false,
        underline: false,
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline cursor-pointer", rel: "noopener noreferrer nofollow", target: "_blank" } }),
      Image.configure({ HTMLAttributes: { class: "max-w-full rounded-lg my-2" } }),
      Youtube.configure({ width: "100%", height: 315, HTMLAttributes: { class: "w-full rounded-lg my-2" } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        class: "outline-none px-4 py-3 prose prose-sm max-w-none dark:prose-invert focus:outline-none",
        style: `min-height: ${minHeight}px`,
      },
    },
  });

  const setLink = useCallback(() => {
    if (!linkUrl) return;
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    editor?.chain().focus().setLink({ href: url, target: "_blank" }).run();
    setLinkUrl("");
  }, [editor, linkUrl]);

  const insertImage = useCallback(() => {
    if (!imageUrl) return;
    editor?.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl("");
  }, [editor, imageUrl]);

  const insertYoutube = useCallback(() => {
    if (!youtubeUrl) return;
    editor?.commands.setYoutubeVideo({ src: youtubeUrl });
    setYoutubeUrl("");
  }, [editor, youtubeUrl]);

  if (!editor) return null;

  const ToolBtn = ({ onClick, active, title, children }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded hover:bg-muted transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-5 bg-border mx-0.5" />;

  return (
    <div className="border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/30">
        {/* Undo/Redo */}
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Annuler">
          <Undo className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Refaire">
          <Redo className="w-3.5 h-3.5" />
        </ToolBtn>
        <Divider />

        {/* Headings */}
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Titre 1">
          <Heading1 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Titre 2">
          <Heading2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Titre 3">
          <Heading3 className="w-3.5 h-3.5" />
        </ToolBtn>
        <Divider />

        {/* Text formatting */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Gras">
          <Bold className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italique">
          <Italic className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Souligné">
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Barré">
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolBtn>
        <Divider />

        {/* Lists */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Liste à puces">
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Liste numérotée">
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>
        <Divider />

        {/* Alignment */}
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Aligner à gauche">
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Centrer">
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Aligner à droite">
          <AlignRight className="w-3.5 h-3.5" />
        </ToolBtn>
        <Divider />

        {/* Separator line */}
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Ligne de séparation">
          <Minus className="w-3.5 h-3.5" />
        </ToolBtn>
        <Divider />

        {/* Link */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Insérer un lien"
              className={`p-1.5 rounded hover:bg-muted transition-colors ${editor.isActive("link") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Link2 className="w-3.5 h-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3 space-y-2">
            <Label className="text-xs">URL du lien</Label>
            <div className="flex gap-2">
              <Input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://exemple.com" className="h-8 text-sm" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), setLink())} />
              <Button type="button" size="sm" className="h-8 px-2" onClick={setLink}>OK</Button>
            </div>
          </PopoverContent>
        </Popover>
        {editor.isActive("link") && (
          <ToolBtn onClick={() => editor.chain().focus().unsetLink().run()} title="Supprimer le lien">
            <Link2Off className="w-3.5 h-3.5" />
          </ToolBtn>
        )}

        {/* Image */}
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" title="Insérer une image" className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3 space-y-2">
            <Label className="text-xs">URL de l'image</Label>
            <div className="flex gap-2">
              <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="h-8 text-sm" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), insertImage())} />
              <Button type="button" size="sm" className="h-8 px-2" onClick={insertImage}>OK</Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* YouTube */}
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" title="Insérer une vidéo YouTube" className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <YoutubeIcon className="w-3.5 h-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3 space-y-2">
            <Label className="text-xs">Lien YouTube</Label>
            <div className="flex gap-2">
              <Input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="h-8 text-sm" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), insertYoutube())} />
              <Button type="button" size="sm" className="h-8 px-2" onClick={insertYoutube}>OK</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} className="bg-background" />
    </div>
  );
}

// Read-only renderer for lesson descriptions
export function RichTextContent({ html, className = "" }: { html: string; className?: string }) {
  if (!html) return null;
  return (
    <div
      className={`prose prose-sm max-w-none dark:prose-invert
        prose-headings:font-bold prose-headings:tracking-tight
        prose-a:text-primary prose-a:underline
        prose-img:rounded-lg prose-img:my-2
        prose-ul:list-disc prose-ol:list-decimal
        prose-blockquote:border-l-primary/50 prose-blockquote:text-muted-foreground
        [&_iframe]:w-full [&_iframe]:rounded-lg [&_iframe]:my-2
        ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
