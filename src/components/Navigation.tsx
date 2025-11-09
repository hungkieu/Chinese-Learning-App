import { useUIStore } from "@/store/useUIStore";
import { clsx } from "clsx";
import { ArrowLeft } from "lucide-react";

const Navigation = () => {
  const activeTab = useUIStore((state) => state.activeTab);
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const addStickyNote = useUIStore((state) => state.addStickyNote);

  const isEditingWord = activeTab.startsWith("words/");

  const handleAddNote = () => {
    addStickyNote();
  };

  if (isEditingWord) {
    return (
      <div className="flex justify-center mt-4 mb-8">
        <button
          onClick={() => setActiveTab("manage")}
          className="flex items-center gap-2 rounded-lg bg-green-one hover:scale-110 active:scale-95 text-white px-4 py-2 transition-all font-bold"
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex items-center w-full md:w-8/10 mx-auto",
        activeTab === "search" && "justify-end",
        activeTab !== "search" && "justify-between"
      )}
    >
      {(activeTab === "manage" || activeTab === "sentences") && (
        <button
          onClick={handleAddNote}
          className="bg-green-gray text-white ml-4 md:ml-32 px-4 py-2 rounded-xl font-bold cursor-pointer hover:scale-110 active:scale-95 transition"
        >
          Note
        </button>
      )}

      <div className="flex gap-1 rounded-lg px-4">
        <button
          onClick={() => setActiveTab("home")}
          className={`px-4 py-2 cursor-pointer rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
            activeTab === "home"
              ? "hover:scale-[1.1] active:scale-[0.9]"
              : "hover:scale-[1.1] active:scale-[0.9]"
          }`}
        >
          <img src="/home.png" height={36} width={36} />
        </button>

        <button
          onClick={() => setActiveTab("search")}
          className={`px-4 py-2 cursor-pointer rounded-lg font-bold transition-all duration-200 flex items-center gap-2 ${
            activeTab === "search"
              ? "hover:scale-[1.1] active:scale-[0.9]"
              : "hover:scale-[1.1] active:scale-[0.9]"
          }`}
        >
          <svg
            viewBox="0.0 0.0 287.3 287.3"
            zoomAndPan="magnify"
            style={{ fill: "rgb(0, 0, 0)" }}
            width="36"
            height="36"
          >
            <g>
              <g id="__id0_sl3p0otid">
                <path
                  d="M 287.300781 143.648438 C 287.300781 222.984375 222.984375 287.300781 143.648438 287.300781 C 64.316406 287.300781 0 222.984375 0 143.648438 C 0 64.3125 64.316406 0 143.648438 0 C 222.984375 0 287.300781 64.3125 287.300781 143.648438"
                  style={{ fill: "rgb(150, 167, 141)" }}
                />
              </g>
              <g id="__id1_sl3p0otid">
                <path
                  d="M 152.316406 152.277344 C 137.171875 167.421875 112.617188 167.421875 97.472656 152.277344 C 82.390625 137.195312 82.390625 112.640625 97.515625 97.472656 C 112.636719 82.390625 137.152344 82.390625 152.253906 97.492188 C 167.421875 112.660156 167.421875 137.175781 152.316406 152.277344 Z M 79.253906 79.210938 C 54.027344 104.480469 54.027344 145.355469 79.210938 170.539062 C 101.300781 192.628906 135.394531 195.386719 160.496094 178.738281 L 208.710938 226.953125 L 226.972656 208.691406 L 178.777344 160.457031 C 195.367188 135.460938 192.625 101.34375 170.535156 79.210938 C 145.351562 54.070312 104.460938 54.050781 79.253906 79.210938"
                  style={{ fill: "rgb(255, 255, 255)" }}
                />
              </g>
            </g>
          </svg>
        </button>

        <button
          onClick={() => setActiveTab("manage")}
          className={`px-4 py-2 cursor-pointer rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
            activeTab === "manage"
              ? "hover:scale-[1.1] active:scale-[0.9]"
              : "hover:scale-[1.1] active:scale-[0.9]"
          }`}
        >
          <img src="/na-manage.png" height={36} width={36} />
        </button>

        <button
          onClick={() => setActiveTab("sentences")}
          className={`px-4 py-2 cursor-pointer rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
            activeTab === "sentences"
              ? "hover:scale-[1.1] active:scale-[0.9]"
              : "hover:scale-[1.1] active:scale-[0.9]"
          }`}
        >
          <img src="/na-book.png" height={36} width={60} />
        </button>
      </div>
    </div>
  );
};

export default Navigation;
