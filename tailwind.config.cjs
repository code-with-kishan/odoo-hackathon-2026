/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,js,jsx}", "./components/**/*.{ts,tsx,js,jsx}", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-muted': 'var(--color-surface-muted)',
        'border': 'var(--color-border)',
        'border-soft': 'var(--color-border-soft)',
        'text-primary': 'var(--color-text-primary)',
        'text-muted': 'var(--color-text-muted)',
        'text-subtle': 'var(--color-text-subtle)',
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        link: 'var(--color-link)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        info: 'var(--color-info)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', '-apple-system', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'display': ['32px', { lineHeight: '1.2' }],
        'h2': ['22px', { lineHeight: '1.3' }],
        'h3': ['16px', { lineHeight: '1.4' }],
        'body': ['14px', { lineHeight: '1.5' }],
        'small': ['13px', { lineHeight: '1.5' }],
        'caption': ['12px', { lineHeight: '1.4' }],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(25,25,25,0.04), 0 2px 8px rgba(25,25,25,0.03)'
      },
      spacing: {
        'px-4': '4px'
      }
    },
  },
  plugins: [],
};
