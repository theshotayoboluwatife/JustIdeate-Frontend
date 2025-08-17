import { Input } from "@/components/ui/input";
import signPath1 from "@assets/sign1.png";
import signPath3 from "@assets/sign3.png";

interface HeroSectionProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export function HeroSection({ onSearch, searchQuery }: HeroSectionProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <section className="py-20 bg-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl text-center pl-[37px] pr-[37px] mt-[-30px]">
          {/* Main Heading */}
          {/*  <h1 className="text-white text-[50px] mt-[9px] mb-[9px] leading-none font-[raleway] font-normal">
            a platform <span className="text-[#fcfcfcbd]">for</span>
            <span className="text-[#c4cfc4bd]"> zines.</span>
          </h1> */}

          {/* Creators Tab */}
          {window.location.pathname === "/bookmarks" ? (
            ""
          ) : (
            <>
              <div className="relative top-0">
                <img
                  src={signPath1}
                  alt="justideate"
                  className="absolute  right-[-250px] top-[-15px] h-[250px] w-[250px]"
                />
              </div>

              <div className="relative top-0">
                <img
                  src={signPath3}
                  alt="justideate"
                  className="absolute  left-[-200px] top-[-12px] h-[230px] w-[230px]"
                />
              </div>
            </>
          )}

          <h1 className="text-white text-[50px] mt-[9px] mb-[9px] leading-none font-[raleway] font-normal">
            {window.location.pathname === "/bookmarks" ? (
              <p className="mt-[-70px] text-black text-[2px]">.</p>
            ) : (
              <>
                {" "}
                a platform f
                <span className="bg-gradient-to-r from-white to-[#A0A0A0] bg-clip-text text-transparent">
                  or zines.
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-lg font-[raleway] text-[#A0A0A0] mt-[30px] mb-[30px] ml-[0px] mr-[0px] pl-[0px] pr-[0px]">
            {window.location.pathname === "/bookmarks" ? (
              ""
            ) : (
              <>
                Discover independent publications and underground creative
                works.
              </>
            )}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl relative">
            <Input
              type="text"
              className="w-full h-[50px] pr-12 pl-6 py-5 text-lg border border-gray-700 rounded-lg bg-[#0f0f0f] placeholder-gray-400 focus:outline-none focus:border-gray-600 focus:ring-0 shadow-sm"
              placeholder="Search zines, creators, or themes..."
              value={searchQuery}
              onChange={handleSearchChange}
            />

            <i className="fas fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg pointer-events-none"></i>
          </div>
        </div>
      </div>
    </section>
  );
}
