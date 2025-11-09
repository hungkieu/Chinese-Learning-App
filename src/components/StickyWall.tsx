import { useRef } from "react";
import { useUIStore } from "@/store/useUIStore";
import BearStyleStickyNote from "./BearStyleStickyNote";

const StickyWall = () => {
  const wallRef = useRef<HTMLDivElement>(null);
  const stickyNotes = useUIStore((state) => state.stickyNotes);
  const updateStickyNote = useUIStore((state) => state.updateStickyNote);
  const moveStickyNote = useUIStore((state) => state.moveStickyNote);
  const deleteStickyNote = useUIStore((state) => state.deleteStickyNote);

  const updateNote = (id: string, newContent: string) => {
    updateStickyNote(id, newContent);
  };

  const moveNote = (id: string, newX: number, newY: number) => {
    moveStickyNote(id, newX, newY);
  };

  const deleteNote = (id: string) => {
    deleteStickyNote(id);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-transparent overflow-hidden pointer-events-none">
      <div
        ref={wallRef}
        className="relative w-full h-full bg-transparent select-none"
      >
        {stickyNotes.map((note) => (
          <BearStyleStickyNote
            key={note.id}
            id={note.id}
            content={note.content}
            color={note.color}
            x={note.x}
            y={note.y}
            boundsRef={wallRef}
            onChange={updateNote}
            onMove={moveNote}
            onDelete={deleteNote}
          />
        ))}
      </div>
    </div>
  );
};

export default StickyWall;
