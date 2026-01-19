import EasySportsLogo from "./assets/image.jpg";


const PremiumHeader = () => {
  return (
    <div className="w-full flex items-center justify-between bg-gradient-to-r from-black via-gray-900 to-black px-6 py-1 border-b-2 border-gray-700">

      {/* LEFT: LOGO + BRAND */}
      <div className="flex items-center gap-3 ">
        <img
          src={EasySportsLogo}
          alt="Easy Sports"
          className="h-12 w-auto object-contain rounded-full"
        />
        <div className="leading-tight">
          <div className="text-white font-extrabold text-xl tracking-wide">
            EASY <span className="text-green-400">SPORTS</span>
          </div>
          <div className="text-gray-400 text-[10px] tracking-widest">
            EVENTS • SCORING • MANAGEMENT
          </div>
        </div>
      </div>

      {/* CENTER: EVENT */}
      <div className="text-white font-black text-2xl tracking-wide text-center">
        69th NATIONAL SCHOOL GAMES 2026
      </div>

      {/* RIGHT: LIVE BADGE */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
        </span>
        <span className="text-red-500 font-black text-lg tracking-widest">
          LIVE
        </span>
      </div>
    </div>
  );
};

export default PremiumHeader;