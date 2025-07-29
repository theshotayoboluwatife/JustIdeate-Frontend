import { Input } from "@/components/ui/input";

interface HeroSectionProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export function HeroSection({ onSearch, searchQuery }: HeroSectionProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <section className="py-20 bg-[#f6f6f6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl pl-[37px] pr-[37px]">
          {/* Main Heading */}
          <h1 className="text-black font-extrabold text-[58px] mt-[9px] mb-[9px] leading-none">
            Find Or Create Your Next
            <br />
            Favorite <span className="text-[#364636]">Zine</span>.
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-[#454545] mt-[14px] mb-[14px] ml-[0px] mr-[0px] pl-[0px] pr-[0px]">A discovery platform for zines. Share your work, explore creators, and stay inspired.</p>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <Input
              type="text"
              className="w-full px-6 py-5 text-lg border border-gray-300 rounded-full bg-white placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-0 shadow-sm"
              placeholder="Search creators, zines, ideas..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
