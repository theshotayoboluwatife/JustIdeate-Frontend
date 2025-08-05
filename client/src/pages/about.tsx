import { useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";
import Analytics from "@/lib/analytics";

export default function About() {
  const { user } = useAuth();

  // Track page view on mount
  useEffect(() => {
    Analytics.trackPageView(user?.id, "About", "/about");
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <Header onSearch={() => {}} searchQuery="" />
      {/* Paper-like container with subtle shadow */}
      <main className="max-w-4xl mx-auto my-8 bg-white shadow-sm border border-gray-100">
        <div className="px-8 md:px-12 lg:px-16 py-16 md:py-20">
          {/* First section with editorial layout */}
          <article className="space-y-12">
            <header className="border-b border-gray-200 pb-8">
              <div className="flex items-start justify-between mb-6">
                <div className="text-sm text-gray-500 font-inter tracking-wider">
                  001
                </div>
                <div className="text-sm text-gray-500 font-inter">About</div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-raleway leading-tight font-extrabold max-w-4xl text-[#000000]">
                We're creating the platform we wish we had for inspiring our own
                zines, notes, drafts, and half-finished thoughts.{" "}
              </h1>
            </header>

            <div className="grid md:grid-cols-12 gap-8 md:gap-12">
              <div className="md:col-span-8 space-y-6 text-lg font-inter leading-relaxed text-[#000000]">
                <p className="font-semibold text-xl text-[#000000]">
                  JustIdeate is a discovery platform for you to post your zines
                  and discover others' creations—in a slower, more intentional
                  space, without the noise of algorithms or social media.{" "}
                </p>
              </div>
            </div>
          </article>

          {/* Second section with magazine-style layout */}
          <article className="mt-20 pt-16 border-t border-gray-200">
            <div className="flex items-start justify-between mb-8">
              <div className="text-sm text-gray-500 font-inter tracking-wider">
                002
              </div>
            </div>

            <div className="grid md:grid-cols-12 gap-8 md:gap-12">
              <div className="md:col-span-6">
                <h2 className="text-4xl md:text-5xl font-raleway leading-tight font-extrabold mb-8 text-[#000000]">
                  We want to{" "}
                  <span className="text-[#364636]">help you start</span>, keep
                  going, and feel seen.
                </h2>
              </div>

              <div className="md:col-span-6 space-y-6 text-lg font-inter leading-relaxed md:pt-4 text-[#000000]">
                <div className="space-y-3">
                  <p>So grab an idea.</p>
                  <p>Get weird.</p>
                  <p>Start something.</p>
                  <p>Or finish something you almost forgot you loved.</p>
                </div>

                <div className="pt-6 space-y-3 border-t border-gray-100">
                  <p>This is not an app for the best creators.</p>
                  <p className="text-[#2b3012] font-semibold">
                    It's a space for people who{" "}
                    <span className="text-[#364636]">make</span> stuff anyway.
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>
      {/* Call to Action Section */}
      <section className="py-20 lg:py-24 bg-[#364636] pt-[75px] pb-[75px]">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-raleway font-bold text-white mb-8 leading-tight">
            Got Feedback?
          </h2>

          <div className="space-y-6 text-lg text-gray-200 font-inter leading-relaxed mb-8">
            <p>
              JustIdeate is in its beta, and we'd love to hear your thoughts on
              how we can make this platform better serve artists, creatives, and
              zine culture.{" "}
            </p>

            <p className="text-gray-300 font-semibold">
              Short, long, poetic, or unhinged—all voices welcome.
            </p>
          </div>

          <button
            className="hover:bg-gray-300 text-black font-medium px-4 py-2 rounded bg-[#ffffff]"
            onClick={() =>
              window.open("https://app.youform.com/forms/xkkim3ka", "_blank")
            }
          >
            + Share My Thoughts
          </button>
        </div>
      </section>
      <Footer />
    </div>
  );
}
