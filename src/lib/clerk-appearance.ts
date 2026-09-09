import type { Appearance } from '@clerk/types';

// Theme for Clerk's <SignIn/> so it reads as part of the app rather than a
// third-party widget dropped into it. Values are the literal hexes behind the
// iron/chalk/blood tokens in tailwind.config.ts — Clerk renders in its own
// stylesheet scope and cannot see Tailwind classes, so they have to be repeated
// here. If the palette moves, move these with it.
const IRON_900 = '#0C111C';
const IRON_700 = '#1E2636';
const IRON_400 = '#6B7587';
const CHALK = '#F4F7FB';
const CHALK_MUTE = '#737E92';
const BLOOD = '#3B82F6';
const RPE_MAX = '#F87171';

export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: BLOOD,
    colorBackground: 'transparent',
    colorText: CHALK,
    colorTextSecondary: CHALK_MUTE,
    colorInputBackground: IRON_900,
    colorInputText: CHALK,
    colorDanger: RPE_MAX,
    colorNeutral: CHALK,
    borderRadius: '0.5rem',
    fontFamily: 'var(--font-body)',
  },
  elements: {
    // The page already supplies the panel, heading and spacing, so the card
    // renders bare — no second box, no duplicate title.
    rootBox: 'w-full',
    cardBox: 'w-full shadow-none border-none bg-transparent',
    card: 'bg-transparent shadow-none border-none p-0 gap-0',
    header: 'hidden',
    footer: 'bg-transparent',
    footerAction: 'justify-center',
    socialButtonsBlockButton:
      'min-h-[44px] bg-chalk text-iron-950 border-none font-body font-semibold hover:bg-white',
    socialButtonsBlockButtonText: 'font-body font-semibold text-iron-950',
    dividerLine: 'bg-iron-800',
    dividerText: 'font-mono text-[11px] tracking-[0.25em] text-chalk-mute',
    formFieldLabel: 'font-mono text-[11px] tracking-[0.2em] uppercase text-chalk-mute',
    formFieldInput: `min-h-[44px] bg-iron-900 border border-[${IRON_700}] text-chalk`,
    formButtonPrimary:
      'min-h-[44px] bg-blood hover:bg-blood-glow text-white font-body font-semibold normal-case tracking-normal',
    footerActionLink: 'text-blood hover:text-blood-glow',
    identityPreviewEditButton: 'text-blood',
    formFieldInputShowPasswordButton: `text-[${IRON_400}]`,
    otpCodeFieldInput: 'bg-iron-900 border-iron-700 text-chalk',
  },
};
