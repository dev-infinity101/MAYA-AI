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
    const shouldShowSearch = searchable || validOptions.length > 8;
    const filteredOptions = shouldShowSearch
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

    return (
        <div className="relative w-full text-left" ref={containerRef}>
            <button
                type="button"
                onClick={() => { setIsOpen(!isOpen); setSearchQuery(''); }}
                className={clsx(
                    "flex w-full items-center justify-between gap-2 px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none",
                    isOpen
                        ? "bg-white border-primary/40 text-text-primary shadow-[0_0_0_3px_rgba(196,97,10,0.10)]"
                        : "bg-[#FEF8EE] border-[rgba(196,97,10,0.15)] text-text-secondary hover:bg-white hover:border-primary/25",
                    className
                )}
            >
                <span className="truncate">{value || <span className="text-text-muted">{placeholder}</span>}</span>
                <ChevronDown size={15} className={clsx("text-text-muted transition-transform duration-200 flex-shrink-0", isOpen && "rotate-180 text-primary")} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-[rgba(196,97,10,0.12)] rounded-xl shadow-[0_8px_32px_rgba(150,80,0,0.12)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {shouldShowSearch && (
                        <div className="flex items-center px-3.5 py-2.5 border-b border-[rgba(196,97,10,0.08)] bg-surface-warm">
                            <Search size={13} className="text-primary/60 mr-2 flex-shrink-0" />
                            <input
                                autoFocus
                                type="text"
                                className="w-full bg-transparent text-sm text-text-primary placeholder-text-muted outline-none"
                                placeholder="Search options…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}
                    <ul className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
                        {filteredOptions.length === 0 ? (
                            <li className="px-4 py-3 text-sm text-text-muted text-center">No results found</li>
                        ) : (
                            filteredOptions.map((opt) => (
                                <li
                                    key={opt}
                                    onClick={() => { onChange(opt); setIsOpen(false); }}
                                    className={clsx(
                                        "flex px-4 py-2.5 text-sm cursor-pointer items-center justify-between transition-colors",
                                        value === opt
                                            ? "bg-primary/8 text-primary font-medium"
                                            : "text-text-secondary hover:bg-surface-warm hover:text-text-primary"
                                    )}
                                >
                                    <span className="truncate pr-4">{opt}</span>
                                    {value === opt && <Check size={13} className="text-primary flex-shrink-0" />}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
