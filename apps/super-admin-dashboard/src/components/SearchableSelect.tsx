import React, { useState, useEffect, useRef } from 'react';

interface Option {
    id: string;
    name: string;
    image_url?: string;
    subtitle?: string;
    [key: string]: any;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    imageProp?: string; // key to use for image url in option object
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    label,
    required = false,
    disabled = false,
    imageProp
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(opt => opt.id === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ marginBottom: label ? '24px' : '0' }} ref={containerRef}>
            {label && (
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                    {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
            )}

            <div style={{ position: 'relative' }}>
                <div
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className="glass-effect"
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-main)',
                        fontSize: '15px',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        opacity: disabled ? 0.6 : 1
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {selectedOption ? (
                            <>
                                {imageProp && selectedOption[imageProp] && (
                                    <img
                                        src={selectedOption[imageProp]}
                                        alt=""
                                        style={{ width: '20px', height: '15px', objectFit: 'cover', borderRadius: '2px' }}
                                    />
                                )}
                                <span>{selectedOption.name}</span>
                            </>
                        ) : (
                            <span style={{ color: 'var(--text-muted)' }}>{placeholder}</span>
                        )}
                    </div>
                    <span style={{ fontSize: '12px', opacity: 0.7 }}>▼</span>
                </div>

                {isOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        width: '100%',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        background: '#0f111a',
                        border: '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-sm)',
                        marginTop: '4px',
                        zIndex: 1000,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ padding: '8px', position: 'sticky', top: 0, background: '#0f111a', borderBottom: '1px solid var(--border-glass)' }}>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search..."
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-glass)',
                                    borderRadius: '6px',
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => (
                                <div
                                    key={option.id}
                                    onClick={() => {
                                        onChange(option.id);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    style={{
                                        padding: '10px 16px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        background: option.id === value ? 'rgba(79, 172, 254, 0.1)' : 'transparent',
                                        color: option.id === value ? 'var(--accent-primary)' : 'var(--text-main)',
                                        borderBottom: '1px solid rgba(255,255,255,0.02)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = option.id === value ? 'rgba(79, 172, 254, 0.1)' : 'transparent';
                                    }}
                                >
                                    {imageProp && option[imageProp] && (
                                        <img
                                            src={option[imageProp]}
                                            alt=""
                                            style={{ width: '24px', height: '18px', objectFit: 'cover', borderRadius: '2px' }}
                                        />
                                    )}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span>{option.name}</span>
                                        {option.subtitle && <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{option.subtitle}</span>}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                                No results found
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchableSelect;
