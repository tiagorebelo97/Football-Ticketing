import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
    { code: 'pt', label: 'PT', name: 'Português' },
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'es', label: 'ES', name: 'Español' },
    { code: 'fr', label: 'FR', name: 'Français' },
    { code: 'de', label: 'DE', name: 'Deutsch' }
];

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        setIsOpen(false);
    };

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    return (
        <div className="language-switcher" ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'var(--bg-glass-light)',
                    border: '1px solid var(--border-glass)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                }}
            >
                <Globe size={18} />
                <span style={{ fontWeight: 500 }}>{currentLang.label}</span>
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'var(--bg-deep)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    minWidth: '150px',
                    boxShadow: 'var(--shadow-premium)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                }}>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.5rem 0.75rem',
                                border: 'none',
                                background: i18n.language === lang.code ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
                                color: i18n.language === lang.code ? 'var(--accent-primary)' : 'var(--text-main)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                width: '100%',
                                fontSize: '0.9rem',
                                fontWeight: i18n.language === lang.code ? 600 : 400
                            }}
                        >
                            <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', opacity: 0.7, width: '20px' }}>{lang.label}</span>
                            <span>{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
