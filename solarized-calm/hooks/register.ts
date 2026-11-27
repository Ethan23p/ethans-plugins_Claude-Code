import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { MESSAGE_TEXT, PALETTE } from './palette.js'

// Solarized, tuned against halation and pattern glare: the ground is lifted off
// black, prose sits well under white, and lines get more room to breathe.
const { theme, problems } = makeColors(PALETTE)

// Layout, as measured in Desktop: by default the main pane, the band behind the
// input and the right panel are all surface-1, and the sidebar is surface-1 under
// a ~22% dark veil the app adds. A backdrop that differs from surface-1 exposes the
// input band as a hard-edged rectangle, so the main color lives in surface-1
// (Solarized base03, re-hued in palette.js) and no backdrop is set.

// Conversation prose is softer than UI chrome (the palette's text-primary has to
// stay brighter so highlight chips keep 3:1). Per-mode so light mode still reads.
theme.inputs.dark['text-assistant-message'] = MESSAGE_TEXT.dark.assistant
theme.inputs.dark['text-user-message'] = MESSAGE_TEXT.dark.user
theme.inputs.light['text-assistant-message'] = MESSAGE_TEXT.light.assistant
theme.inputs.light['text-user-message'] = MESSAGE_TEXT.light.user

const COLORS: ThemeSetArgs = { colors: theme }

const LOOK: ThemeSetArgs = {
  ...COLORS,
  style: {
    Text: { fontSize: 16, lineHeight: 27, letterSpacing: 0.2 },
    Heading: { fontWeight: 'semibold' },
  },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }

    let set
    try {
      set = await $.theme.set(LOOK)
    } catch (error) {
      $.ui.log(String(error))
      set = await $.theme.set(COLORS)
    }

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }

    return next(e)
  })
}
