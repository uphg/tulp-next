import { makeInstaller } from '../utils'
import { TuButton, TuButtonGroup } from './button'
import { TuInput, TuInputGroup, TuInputGroupLabel } from './input'
import { TuSwitch } from './switch'
import { TuDialog, useDialog } from './dialog'
import { TuCollapseTransition } from './collapse-transition'
import { TuTabPane, TuTabs } from './tabs'
import { TuExpandTransition } from './expand-transition'
import { TuPagination } from './pagination'
import { TuPopover } from './popover'
import { TuTooltip } from './tooltip'
import { TuSpace } from './space'
import { TuRow } from './row'
import { TuCol } from './col'
import { TuEllipsis } from './ellipsis'
import { TuCollapse, TuCollapseItem } from './collapse'

const components = [
  TuButton,
  TuButtonGroup,
  TuInput,
  TuInputGroup,
  TuInputGroupLabel,
  TuCollapseTransition,
  TuExpandTransition,
  TuSwitch,
  TuTabs,
  TuTabPane,
  TuDialog,
  TuPagination,
  TuPopover,
  TuTooltip,
  TuSpace,
  TuRow,
  TuCol,
  TuEllipsis,
  TuCollapse,
  TuCollapseItem
]

const { install } = makeInstaller(components)

export {
  TuButton,
  TuButtonGroup,
  TuInput,
  TuInputGroup,
  TuInputGroupLabel,
  TuCollapseTransition,
  TuExpandTransition,
  TuSwitch,
  TuTabs,
  TuTabPane,
  TuPagination,
  TuPopover,
  TuTooltip,
  TuSpace,
  TuRow,
  TuCol,
  TuEllipsis,
  TuCollapse,
  TuCollapseItem,

  // utils
  useDialog,
  install
}
