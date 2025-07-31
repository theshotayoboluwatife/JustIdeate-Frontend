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
    <section className="py-20 bg-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl text-center pl-[37px] pr-[37px] mt-[-30px]">
          {/* Main Heading */}
          <h1 className="text-white text-[50px] mt-[9px] mb-[9px] leading-none">
            A platform <span className="text-[#fcfcfcbd]">for</span>
            <span className="text-[#c4cfc4bd]"> zines.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-[#A0A0A0] mt-[30px] mb-[30px] ml-[0px] mr-[0px] pl-[0px] pr-[0px]">
            Discover independent publications and underground creative works.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <Input
              type="text"
              className="w-full px-6 py-5 text-lg border border-gray-300 border-dotted rounded-lg bg-[#0f0f0f] placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-0 shadow-sm"
              placeholder="Search zines, creators, or themes..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
