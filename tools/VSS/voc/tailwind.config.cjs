const path = require('node:path');
module.exports = {
    content: [path.join(__dirname, '*.html'), path.join(__dirname, 'assets/pwa.js')],
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Cairo', 'sans-serif'],
                    },
                    colors: {
                        baby: {
                            blueLight: '#EBF8FF',  /* sky-50 */
                            blue: '#E0F2FE',       /* sky-100 */
                            blueMed: '#38BDF8',    /* sky-400 */
                            blueDark: '#0284C7',   /* sky-600 */
                            mintLight: '#ECFDF5',  /* emerald-50 */
                            mint: '#D1FAE5',       /* emerald-100 */
                            mintMed: '#34D399',    /* emerald-400 */
                            mintDark: '#059669',   /* emerald-600 */
                            bg: '#F8FAFC',         /* slate-50 */
                            textDark: '#0F172A',   /* slate-900 */
                        }
                    },
                    boxShadow: {
                        'soft': '0 4px 14px 0 rgba(2, 132, 199, 0.12)',
                        'soft-mint': '0 4px 14px 0 rgba(5, 150, 105, 0.12)',
                        'glow-gold': '0 0 25px rgba(251, 191, 36, 0.6)',
                    },
                    animation: {
                        'pop-card': 'popCard 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        'pulse-hint': 'pulseHint 1.2s infinite',
                        'star-celebrate': 'starCelebrate 0.8s ease-in-out infinite alternate',
                    },
                    keyframes: {
                        popCard: {
                            '0%': { transform: 'scale(1)' },
                            '50%': { transform: 'scale(1.06)' },
                            '100%': { transform: 'scale(1)' },
                        },
                        pulseHint: {
                            '0%, 100%': { boxShadow: '0 0 0 0 rgba(52, 211, 153, 0.8)' },
                            '50%': { boxShadow: '0 0 0 12px rgba(52, 211, 153, 0)' },
                        },
                        starCelebrate: {
                            '0%': { transform: 'scale(1) rotate(-5deg)' },
                            '100%': { transform: 'scale(1.15) rotate(5deg)' },
                        }
                    }
                }
            }
        };
