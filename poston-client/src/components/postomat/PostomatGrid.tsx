import { Box, Paper, Tooltip, Typography } from '@mui/material'

export type SlotViewState = 'FREE' | 'BUSY' | 'RESERVED' | 'UNKNOWN' | 'TARGET'

export type SlotView = {
  id: number

  label: number
  state: SlotViewState
  disabled?: boolean
}

export interface PostomatGridProps {
  slots: SlotView[]

  onSlotClick?: (slotId: number) => void
}

function getSlotBg(state: SlotViewState): string {
  switch (state) {
    case 'FREE':
      return '#2e7d32'
    case 'BUSY':
      return '#d32f2f'
    case 'RESERVED':
      return '#ed6c02'
    case 'TARGET':
      return '#1976d2'
    case 'UNKNOWN':
    default:
      return '#9e9e9e'
  }
}

function getSlotTitle(state: SlotViewState): string {
  switch (state) {
    case 'FREE':
      return 'Свободно'
    case 'BUSY':
      return 'Занято'
    case 'RESERVED':
      return 'Зарезервировано'
    case 'TARGET':
      return 'Ваша ячейка'
    case 'UNKNOWN':
    default:
      return 'Недоступно'
  }
}

export default function PostomatGrid({
  slots,
  onSlotClick,
}: PostomatGridProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(4, 1fr)', sm: 'repeat(5, 1fr)' },
        gap: 1.5,
      }}
    >
      {slots.map((s) => {
        const bg = getSlotBg(s.state)
        const title = getSlotTitle(s.state)
        const clickable = Boolean(onSlotClick) && !s.disabled

        return (
          <Tooltip key={s.id} title={title} arrow>
            <Paper
              onClick={
                clickable
                  ? () => {
                      onSlotClick?.(s.id)
                    }
                  : undefined
              }
              sx={{
                height: 78,
                borderRadius: 1.5,
                bgcolor: bg,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                position: 'relative',
                userSelect: 'none',
                cursor: clickable ? 'pointer' : 'default',
                opacity: s.disabled ? 0.65 : 1,
                transition: 'transform 120ms ease, filter 120ms ease',
                '&:hover': clickable
                  ? {
                      transform: 'translateY(-1px)',
                      filter: 'brightness(1.05)',
                    }
                  : undefined,
              }}
            >
              {s.label}
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  bottom: 6,
                  opacity: 0.9,
                  fontWeight: 600,
                }}
              >
                {s.state}
              </Typography>
            </Paper>
          </Tooltip>
        )
      })}
    </Box>
  )
}
