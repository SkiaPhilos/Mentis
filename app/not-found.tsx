import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 text-[#202820]">
      <div className="max-w-md w-full text-center space-y-6 bg-[#FAF7EE] p-8 rounded-2xl border border-[#E3DAC1] shadow-md">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#EFE9D9] border border-[#D5C7A3] flex items-center justify-center text-2xl font-serif text-[#8C733E]">
          ❦
        </div>
        <div className="space-y-2">
          <p className="text-xs font-serif tracking-widest text-[#8C733E] uppercase">
            Archival Record 404
          </p>
          <h1 className="text-2xl font-serif font-semibold text-[#182018]">
            Folio Misplaced in the Archive
          </h1>
          <p className="text-sm text-[#5C6657] font-serif leading-relaxed">
            The manuscript, scroll, or chamber you are seeking has not been inscribed into the Mentis registry or has been relocated to another wing.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#2D3A2D] hover:bg-[#202820] text-[#F3EFE6] text-sm font-medium transition-colors shadow-sm"
          >
            Return to the Sanctuary
          </Link>
        </div>
      </div>
    </div>
  );
}
