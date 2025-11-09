import { useEffect, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import { X } from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

interface BearStickyNoteProps {
  id: string;
  content: string;
  color: string;
  x: number; // toạ độ tương đối trong boundsRef
  y: number;
  boundsRef: React.RefObject<HTMLDivElement>; // container giới hạn drag
  onChange: (id: string, html: string) => void;
  onMove: (id: string, x: number, y: number) => void; // lưu vị trí khi thả
  onDelete: (id: string) => void;
}

const BearStyleStickyNote = ({
  id,
  content,
  color,
  x,
  y,
  boundsRef,
  onChange,
  onMove,
  onDelete,
}: BearStickyNoteProps) => {
  const [hovered, setHovered] = useState(false);

  const mvX = useMotionValue(x);
  const mvY = useMotionValue(y);

  useEffect(() => {
    mvX.set(x);
  }, [x, mvX]);

  useEffect(() => {
    mvY.set(y);
  }, [y, mvY]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "✏️ Viết ghi chú ở đây...",
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "focus:outline-none prose prose-sm max-w-none text-gray-800 min-h-[160px]",
      },
    },
    onUpdate({ editor }) {
      onChange(id, editor.getHTML());
    },
  });

  return (
    <motion.div
      drag
      dragConstraints={boundsRef}
      dragElastic={0.35}
      dragMomentum={true}
      style={{ x: mvX, y: mvY, backgroundColor: color }}
      onDragEnd={() => {
        onMove(id, mvX.get(), mvY.get());
      }}
      className="absolute z-[2001] w-64 min-h-[180px] rounded-lg shadow-md p-3 cursor-grab text-left active:cursor-grabbing pointer-events-auto"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <button
          onClick={() => onDelete(id)}
          className="absolute top-1 right-1 text-gray-600 hover:text-gray-800 transition"
          title="Xoá ghi chú"
        >
          <X size={16} />
        </button>
      )}

      <EditorContent editor={editor} />
    </motion.div>
  );
};

export default BearStyleStickyNote;
