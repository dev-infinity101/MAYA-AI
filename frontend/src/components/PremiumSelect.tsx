import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { clsx } from 'clsx';

interface PremiumSelectProps {
    value: string;
    onChange: (val: string) => void;
    options: string[];
    placeholder?: string;
    searchable?: boolean;
    className?: string;
}

export function PremiumSelect({ value, onChange, options, placeholder = "Select an option", searchable = false, className }: PremiumSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const validOptions = options || [];
    const filteredOptions = searchable || validOptions.length > 8 
        ? validOptions.filter(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()))
        : validOptions;

    useEffect(() => {
        function handleOutsideClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const shouldShowSearch = searchable || validOptions.length > 8;

    return (
        <div className="relative w-full text-left" ref={containerRef}>
            <button
                type="button"
                onClick={() => { setIsOpen(!isOpen); setSearchQuery(''); }}
                className={clsx(
                    "flex w-full items-center justify-between gap-2 px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none",
                    isOpen 
                        ? "bg-white/10 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20",
                    className
                )}
            >
                <span className="truncate">{value || <span className="text-gray-500">{placeholder}</span>}</span>
                <ChevronDown size={16} className={clsx("text-gray-500 transition-transform duration-300", isOpen && "rotate-180 text-emerald-400")} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {shouldShowSearch && (
                        <div className="flex items-center px-4 py-2.5 border-b border-white/10 bg-white/5">
                            <Search size={14} className="text-emerald-500/70 mr-2 flex-shrink-0" />
                            <input
                                autoFocus
                                type="text"
                                className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                                placeholder="Search options..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}
                    <ul className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                        {filteredOptions.length === 0 ? (
                            <li className="px-4 py-3 text-sm text-gray-500 text-center">No results found</li>
                        ) : (
                            filteredOptions.map((opt) => (
                                <li
                                    key={opt}
                                    onClick={() => { onChange(opt); setIsOpen(false); }}
                                    className={clsx(
                                        "flex px-4 py-2.5 text-sm cursor-pointer items-center justify-between transition-colors",
                                        value === opt 
                                            ? "bg-emerald-500/15 text-emerald-400 font-medium" 
                                            : "text-gray-300 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    <span className="truncate pr-4">{opt}</span>
                                    {value === opt && <Check size={14} className="text-emerald-400 flex-shrink-0" />}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
