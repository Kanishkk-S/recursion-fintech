import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  X, 
  Briefcase, 
  Check, 
  Sparkles,
  Plus
} from 'lucide-react';
import { WORK_DOMAINS, type WorkDomain } from '../data/domains';

interface DomainSelectorProps {
  selectedDomain: WorkDomain | null;
  onSelectDomain: (domain: WorkDomain) => void;
  placeholder?: string;
  className?: string;
}

// Category badge color map
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Food Delivery & Quick Commerce": { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/20" },
  "Ride-Hailing & Mobility": { bg: "bg-indigo-500/10", text: "text-indigo-300", border: "border-indigo-500/20" },
  "Logistics & Freight": { bg: "bg-sky-500/10", text: "text-sky-300", border: "border-sky-500/20" },
  "Street Vendors & Micro-Stalls": { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/20" },
  "Construction & Civil Trades": { bg: "bg-orange-500/10", text: "text-orange-300", border: "border-orange-500/20" },
  "Home Trades & Maintenance": { bg: "bg-purple-500/10", text: "text-purple-300", border: "border-purple-500/20" },
  "Domestic & Caregiving": { bg: "bg-pink-500/10", text: "text-pink-300", border: "border-pink-500/20" },
  "Micro-Retail & Corner Shops": { bg: "bg-teal-500/10", text: "text-teal-300", border: "border-teal-500/20" },
  "Agriculture, Dairy & Rural": { bg: "bg-lime-500/10", text: "text-lime-300", border: "border-lime-500/20" },
  "Artisans & Handicrafts": { bg: "bg-fuchsia-500/10", text: "text-fuchsia-300", border: "border-fuchsia-500/20" },
  "Freelance & Micro-Services": { bg: "bg-violet-500/10", text: "text-violet-300", border: "border-violet-500/20" }
};

export const DomainSelector: React.FC<DomainSelectorProps> = ({
  selectedDomain,
  onSelectDomain,
  placeholder = "Search & select earning profession / platform (150+ domains)...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter domains in real-time
  const filteredDomains = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return WORK_DOMAINS;
    return WORK_DOMAINS.filter((d) => 
      d.name.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.tags?.some(t => t.toLowerCase().includes(q))
    );
  }, [searchTerm]);

  // Group filtered results by category
  const groupedResults = useMemo(() => {
    const map: Record<string, WorkDomain[]> = {};
    for (const d of filteredDomains) {
      if (!map[d.category]) {
        map[d.category] = [];
      }
      map[d.category].push(d);
    }
    return map;
  }, [filteredDomains]);

  // Reset highlight when query changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredDomains.length - 1));
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (filteredDomains[highlightedIndex]) {
        onSelectDomain(filteredDomains[highlightedIndex]);
        setIsOpen(false);
        setSearchTerm('');
      } else if (searchTerm.trim()) {
        // Custom trade creation on Enter
        const customDomain: WorkDomain = {
          id: `custom-${Date.now()}`,
          name: searchTerm.trim(),
          category: "Freelance & Micro-Services",
          payoutType: "DAILY",
          defaultInflow: 35000,
          defaultDailyEarnings: 1350,
          suggestedBracket: "standard"
        };
        onSelectDomain(customDomain);
        setIsOpen(false);
        setSearchTerm('');
      }
      e.preventDefault();
    }
  };

  const badgeStyle = selectedDomain ? (CATEGORY_COLORS[selectedDomain.category] || {
    bg: "bg-purple-500/10",
    text: "text-purple-300",
    border: "border-purple-500/20"
  }) : null;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        onKeyDown={handleKeyDown}
        className="w-full bg-[#0D061C] border border-[#1C0B3B] hover:border-purple-500/40 text-left rounded-2xl px-4 py-3 text-sm flex justify-between items-center transition-colors cursor-pointer shadow-inner focus:outline-none focus:border-purple-500/60 group"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-xl bg-[#180933] border border-purple-500/25 flex items-center justify-center shrink-0">
            <Briefcase className="w-3.5 h-3.5 text-[#C084FC]" />
          </div>

          {selectedDomain ? (
            <div className="flex items-center gap-2 overflow-hidden truncate">
              <span className="font-semibold text-white truncate text-xs sm:text-sm">
                {selectedDomain.name}
              </span>
              <span className={`hidden md:inline text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${badgeStyle?.bg} ${badgeStyle?.text} ${badgeStyle?.border}`}>
                {selectedDomain.category}
              </span>
            </div>
          ) : (
            <span className="text-xs sm:text-sm text-[#6B7280] font-normal truncate">
              {placeholder}
            </span>
          )}
        </div>

        <ChevronDown className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-200 shrink-0 ml-2 ${
          isOpen ? 'rotate-180 text-[#C084FC]' : ''
        }`} />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-[#0D061C] border border-purple-500/30 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in duration-150">
          
          {/* Sticky Search Header */}
          <div className="p-3 border-b border-[#1C0B3B] bg-[#140929]/90 backdrop-blur-md sticky top-0 z-10 flex flex-col gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type to filter 150 domains (e.g. Chai, Mason, Uber, Plumber)..."
                className="w-full bg-[#07030F] border border-[#1C0B3B] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-purple-500/60 font-mono"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="p-1 text-[#6B7280] hover:text-white absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Match Count Pill */}
            <div className="flex items-center justify-between text-[10px] font-mono text-[#9CA3AF] px-1">
              <span>Showing {filteredDomains.length} of {WORK_DOMAINS.length} Work Domains</span>
              <span className="text-purple-300">↑↓ to navigate • Enter to select</span>
            </div>
          </div>

          {/* Scrollable Results List */}
          <div ref={listRef} className="max-h-72 overflow-y-auto divide-y divide-[#1C0B3B]/60 p-1.5 scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-transparent">
            {filteredDomains.length > 0 ? (
              Object.entries(groupedResults).map(([category, domains]) => {
                const catStyle = CATEGORY_COLORS[category] || {
                  bg: "bg-purple-500/10",
                  text: "text-purple-300",
                  border: "border-purple-500/20"
                };

                return (
                  <div key={category} className="py-2 first:pt-1 last:pb-1">
                    {/* Category Sticky Sub-header */}
                    <div className="flex items-center justify-between px-2.5 py-1 mb-1">
                      <span className={`text-[10px] font-bold tracking-wider uppercase font-mono px-2 py-0.5 rounded border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                        {category}
                      </span>
                      <span className="text-[10px] text-[#6B7280] font-mono">
                        {domains.length} {domains.length === 1 ? 'trade' : 'trades'}
                      </span>
                    </div>

                    {/* Domains within category */}
                    <div className="flex flex-col gap-0.5">
                      {domains.map((domain) => {
                        const globalIndex = filteredDomains.findIndex(d => d.id === domain.id);
                        const isHighlighted = globalIndex === highlightedIndex;
                        const isSelected = selectedDomain?.id === domain.id;

                        return (
                          <button
                            key={domain.id}
                            type="button"
                            onClick={() => {
                              onSelectDomain(domain);
                              setIsOpen(false);
                              setSearchTerm('');
                            }}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#1E0E3E] text-white border border-purple-500/40 shadow-sm'
                                : isHighlighted
                                ? 'bg-[#140929] text-white'
                                : 'text-[#9CA3AF] hover:bg-[#120826] hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 overflow-hidden pr-2">
                              <span className="text-xs font-semibold truncate text-white">
                                {domain.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-mono text-[#10B981] font-bold">
                                ~₹{domain.defaultDailyEarnings}/day
                              </span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              /* Empty State with Add Custom Trade Option */
              <div className="p-6 text-center flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#140929] border border-purple-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#C084FC]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">No matching standard trade found</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                    You can still register with your custom trade name:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const customDomain: WorkDomain = {
                      id: `custom-${Date.now()}`,
                      name: searchTerm.trim() || "Independent Daily Earner",
                      category: "Freelance & Micro-Services",
                      payoutType: "DAILY",
                      defaultInflow: 35000,
                      defaultDailyEarnings: 1350,
                      suggestedBracket: "standard"
                    };
                    onSelectDomain(customDomain);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl purple-magenta-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Use "{searchTerm.trim() || 'Custom Profession'}"</span>
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
