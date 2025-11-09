// TestSession.tsx (wrapper)
import PracticeSession from "./PracticeSession";
import ExamSession from "./ExamSession";

interface TestSessionProps {
  selectedIds: string[];
  onExit: () => void;
  practiceMode?: boolean;
}

const TestSession = ({
  selectedIds,
  onExit,
  practiceMode = false,
}: TestSessionProps) => {
  if (practiceMode)
    return <PracticeSession selectedIds={selectedIds} onExit={onExit} />;
  return <ExamSession selectedIds={selectedIds} onExit={onExit} />;
};

export default TestSession;
