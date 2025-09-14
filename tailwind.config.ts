import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Noto Sans', 'system-ui', 'sans-serif'],
				noto: ['Noto Sans', 'sans-serif']
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Swiss Design System Colors
				'swiss-red': 'hsl(var(--swiss-red))',
				'swiss-white': 'hsl(var(--swiss-white))',
				'swiss-black': 'hsl(var(--swiss-black))',
				'swiss-gray': {
					100: 'hsl(var(--swiss-gray-100))',
					200: 'hsl(var(--swiss-gray-200))',
					300: 'hsl(var(--swiss-gray-300))',
					400: 'hsl(var(--swiss-gray-400))',
					500: 'hsl(var(--swiss-gray-500))',
					600: 'hsl(var(--swiss-gray-600))',
					700: 'hsl(var(--swiss-gray-700))',
					800: 'hsl(var(--swiss-gray-800))',
					900: 'hsl(var(--swiss-gray-900))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-hero': 'var(--gradient-hero)'
			},
			boxShadow: {
				'elegant': 'var(--shadow-elegant)',
				'card': 'var(--shadow-card)',
				'glow': 'var(--shadow-glow)'
			},
			transitionTimingFunction: {
				'smooth': 'var(--transition-smooth)',
				'spring': 'var(--transition-spring)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'mobile-overlay-fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				'mobile-overlay-fade-out': {
					from: { opacity: '1' },
					to: { opacity: '0' }
				},
				'mobile-panel-slide-down': {
					from: { transform: 'translateY(-8px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' }
				},
				'mobile-panel-slide-up': {
					from: { transform: 'translateY(0)', opacity: '1' },
					to: { transform: 'translateY(-8px)', opacity: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'mobile-overlay-in': 'mobile-overlay-fade-in 150ms var(--transition-smooth)',
				'mobile-overlay-out': 'mobile-overlay-fade-out 150ms var(--transition-smooth)',
				'mobile-panel-in': 'mobile-panel-slide-down 200ms var(--transition-smooth)',
				'mobile-panel-out': 'mobile-panel-slide-up 180ms var(--transition-smooth)'
			}
		}
	},
	plugins: [animate],
} satisfies Config;
