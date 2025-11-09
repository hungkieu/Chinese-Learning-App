// import Vocabulary from "./components/Vocabulary";
import Sentences from "./components/Sentences";
import Manage from "./components/Manage";
import WordEdit from "./components/Manage/WordEdit";
import Navigation from "./components/Navigation";
import WordSearch from "./components/WordSearch";
import { useUIStore } from "./store/useUIStore";
import DailyWords from "./components/DailyWords";
import StickyWall from "./components/StickyWall";

import Home from "./components/Home";

const ChineseLearningApp = () => {
  const activeTab = useUIStore((state) => state.activeTab);

  return (
    <div id="Main" className="h-full bg-green-50 overflow-auto">
      {activeTab !== "home" && (
        <div className="h-auto flex flex-col">
          <Navigation />

          <DailyWords />

          <div className="max-w-[410px] sm:max-w-full w-full mx-auto">
            <div className={activeTab === "sentences" ? "block" : "hidden"}>
              <Sentences />
            </div>

            <div className={activeTab === "search" ? "block" : "hidden"}>
              <WordSearch />
            </div>

            <div className={activeTab === "manage" ? "block" : "hidden"}>
              <Manage />
            </div>

            {activeTab.startsWith("words/") && <WordEdit />}
          </div>

          {(activeTab === "manage" || activeTab === "sentences") && (
            <StickyWall />
          )}
        </div>
      )}

      {activeTab === "home" && <Home />}
    </div>
  );
};

export default ChineseLearningApp;
