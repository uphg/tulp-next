import { h, ref, type VNodeRef, nextTick, computed, watch, Teleport, Transition, type SetupContext, toRef, onMounted } from "vue"
import type { PopoverProps } from './popoverProps'
import { getRelativeDOMPosition, getRelativeClientPosition } from '../../../utils'
import { useMaxZIndex } from '../../../composables/useMaxZIndex'

type UsePopoverOptions = {
  className?: string 
}

const arrowClassMap = [
  [['top-start', 'top', 'top-end'], 'top'],
  [['left-start', 'left', 'left-end'], 'left'],
  [['right-start', 'right', 'right-end'], 'right'],
  [['bottom-start', 'bottom', 'bottom-end'], 'bottom'],
]

const arrowMargin = 10

export function usePopover(props: PopoverProps, context: SetupContext<'update:visible'[]>, options?: UsePopoverOptions) {
  const className = options?.className
  const { getZIndex } = useMaxZIndex(window) || {}
  const on = {
    hover: { onMouseover },
    click: { onClick },
    focus: { onFocus: open, onBlur: close },
    manual: { },
  }[props.trigger]

  const visible = ref(false)
  const closeTimerId = ref<NodeJS.Timeout | null>(null)
  const hovered = ref(false)
  const mousedown = ref(false)
  const triggerRef = ref<VNodeRef | null>(null)
  const popoverRef = ref<VNodeRef | null>(null)
  const zIndex = ref(2000)
  const doc = ref({ top: 0, left: 0 })
  const popoverStyle = ref({})
  const arrowStyle = ref({})
  const arrowClass = ref({})
  const _placement = ref<PopoverProps['placement']>(props.placement)

  const visiblePopover = computed(() => props.trigger === 'manual' ? props.visible : visible.value )

  props.trigger === 'manual' && watch(toRef(props, 'visible'), value => value ? open() : close())

  const handleDomScroll = () => {
    console.log('我滚动了')
    const { top, bottom, left, right } = getRelativeClientPosition(popoverRef.value)
    const placement = _placement.value
    if (placement && /^bottom.*/.test(placement)) {
      if (bottom + 6 < 0) {
        _placement.value = placement.replace(/^bottom/, 'top') as PopoverProps['placement']
      }
      if (placement === 'bottom-start') {
        if (right < 0) {
          _placement.value = 'bottom'
        }
      }
      if (placement === 'bottom') {
        if (left < 0) {
          _placement.value = 'bottom-start'
        }
        if (right < 0) {
          _placement.value = 'bottom-end'
        }
      }
      if (placement === 'bottom-end') {
        if (left < 0) {
          _placement.value = 'bottom'
        }
      }
      loadArrowClass()
      loadStyle()
    }

    if (placement && /^top.*/.test(placement)) {
      if (top < 0) {
        console.log('运行 top')
        _placement.value = placement.replace(/^top/, 'bottom') as PopoverProps['placement']
      }
      if (placement === 'top-start') {
        if (right < 0) {
          _placement.value = 'top'
        }
      }
      if (placement === 'top') {
        if (left < 0) {
          _placement.value = 'top-start'
        }
        if (right < 0) {
          _placement.value = 'top-end'
        }
      }
      if (placement === 'top-end') {
        if (left < 0) {
          _placement.value = 'top'
        }
      }
      loadArrowClass()
      loadStyle()
    }

    if (placement && /^left.*/.test(placement)) {
      if (left < 0) {
        _placement.value = placement.replace(/^left/, 'right') as PopoverProps['placement']
      }
      if (placement === 'left-end') {
        if (top < 0) {
          console.log('触发 left-end 的 top')
          _placement.value = 'left'
        }
      }
      if (placement === 'left') {
        if (top < 0) {
          _placement.value = 'left-start'
        }
        if (bottom < 0) {
          _placement.value = 'left-end'
        }
      }

      if (placement === 'left-start') {
        if (bottom < 0) {
          _placement.value = 'left'
        }
      }

      loadArrowClass()
      loadStyle()
    }

    if (placement && /^right.*/.test(placement)) {
      if (right < 0) {
        _placement.value = placement.replace(/^right/, 'left') as PopoverProps['placement']
      }
      if (placement === 'right-end') {
        if (top < 0) {
          console.log('触发 right-end 的 top')
          _placement.value = 'right'
        }
      }
      if (placement === 'right') {
        if (top < 0) {
          _placement.value = 'right-start'
        }
        if (bottom < 0) {
          _placement.value = 'right-end'
        }
      }

      if (placement === 'right-start') {
        if (bottom < 0) {
          _placement.value = 'right'
        }
      }

      loadArrowClass()
      loadStyle()
    }
  }

  function open() {
    doc.value = getRelativeDOMPosition(triggerRef.value.$el)
    zIndex.value = getZIndex?.() || 2000
    loadDomEventListener()
    updateVisible(true)
  }

  function close() {
    unloadDomEventListener()
    updateVisible(false)
  }

  function updateVisible(value: boolean) {
    props.trigger !== 'manual' && (visible.value = value)
    context.emit('update:visible', value)
  }

  function isTrigger(event: MouseEvent) {
    const el = triggerRef.value.$el
    return el && (el === event.target || el.contains(event.target))
  }

  function isPopover(event: MouseEvent) {
    const el = popoverRef.value
    return el && (el === event.target || el.contains(event.target))
  }

  function onMouseover() {
    hovered.value = true
    if (!visible.value) {
      open()
      nextTick(() => document.addEventListener('mouseover', handleDomMouseover))
    }
  }

  function onClick() {
    if (visible.value) {
      close()
    } else {
      open()
      nextTick(() => {
        document.addEventListener('mousedown', handleDomMousedown)
        document.addEventListener('mouseup', handleDomMouseup)
      })
    }
  }

  function handleDomMouseover(e: MouseEvent){
    isPopover(e) || isTrigger(e) ? handleHoverMoveIn() : handleHoverMoveOut()
  }

  function handleHoverMoveIn() {
    if (!closeTimerId.value) return
    window.clearTimeout(closeTimerId.value!)
    closeTimerId.value = null
    hovered.value = true
  }

  function handleHoverMoveOut() {
    if (!hovered.value) return
    if (visible.value) {
      const offMouseover = () => {
        if (closeTimerId.value) {
          closeTimerId.value = null
          document.removeEventListener('mouseover', handleDomMouseover)
          close()
        }
      }
      closeTimerId.value = setTimeout(offMouseover, 200)
    }
    hovered.value = false
  }

  function handleDomMousedown(event: MouseEvent) {
    if (isPopover(event)) return
    mousedown.value = true
  }

  function handleDomMouseup(event: MouseEvent) {
    if (!isTrigger(event) && !isPopover(event) && mousedown.value) {
      close()
      document.removeEventListener('mousedown', handleDomMousedown)
      document.removeEventListener('mouseup', handleDomMouseup)
    }
    if (mousedown.value) {
      mousedown.value = false
    }
  }

  function onBeforeEnter() {
    loadArrowClass()
  }

  function onEnter() {
    loadStyle()
  }

  function onAfterLeave() {
    resetStyle()
  }

  function loadStyle() {
    console.log('修改了')
    const trigger = triggerRef.value.$el as HTMLElement
    const popover = popoverRef.value as HTMLElement
    const { top, left } = doc.value
    const topToTop = `${top - popover?.offsetHeight - 8}px`
    const leftToLeft = `${left - popover?.offsetWidth - 8}px`
    const rightToLeft = `${left + trigger?.offsetWidth + 8}px`
    const bottomToTop = `${top + trigger?.offsetHeight + 8}px`

    const placementMap = {
      'top-start': {
        top: topToTop,
        left: `${left}px`
      },
      'top': {
        top: topToTop,
        left: `${left + trigger?.offsetWidth / 2 - popover?.offsetWidth / 2}px`
      },
      'top-end': {
        top: topToTop,
        left: `${left + trigger?.offsetWidth - popover?.offsetWidth}px`
      },
      'left-start': {
        top: `${top}px`,
        left: leftToLeft
      },
      'left': {
        top: `${top + trigger?.offsetHeight / 2 - popover?.offsetHeight / 2}px` ,
        left: leftToLeft
      },
      'left-end': {
        top: `${top + trigger?.offsetHeight - popover?.offsetHeight}px` ,
        left: leftToLeft
      },
      'right-start': {
        top: `${top}px`,
        left: rightToLeft
      },
      'right': {
        top: `${top + trigger?.offsetHeight / 2 - popover?.offsetHeight / 2}px`,
        left: rightToLeft
      },
      'right-end': {
        top: `${top + trigger?.offsetHeight - popover?.offsetHeight}px`,
        left: rightToLeft
      },
      'bottom-start': {
        top: bottomToTop,
        left: `${left}px`
      },
      'bottom': {
        top: bottomToTop,
        left: `${left + trigger?.offsetWidth / 2 - popover?.offsetWidth / 2}px`
      },
      'bottom-end': {
        top: bottomToTop,
        left: `${left + trigger?.offsetWidth - popover?.offsetWidth}px`
      }
    }

    popoverStyle.value = {
      zIndex: zIndex.value || 2000,
      ...placementMap[_placement.value]
    }

    if (props.hideArrow) return
    const { offsetWidth, offsetHeight } = popoverRef.value || { offsetHeight: 0, offsetWidth: 0 }
    switch(_placement.value) {
      case 'top-start':
      case 'bottom-start':
        arrowStyle.value = { right: `${offsetWidth - arrowMargin}px` }
        break
      case 'top':
      case 'bottom':
        arrowStyle.value = { left: `${offsetWidth / 2 - 6}px` }
        break
      case 'top-end':
      case 'bottom-end':
        arrowStyle.value = { left: `${offsetWidth - 12 - arrowMargin}px` }
        break
      case 'left-start':
      case 'right-start':
        arrowStyle.value = { bottom: `${offsetHeight - arrowMargin}px` }
        break
      case 'left':
      case 'right':
        arrowStyle.value = { top: `${offsetHeight / 2 - 6}px` }
        break
      case 'left-end':
      case 'right-end':
        arrowStyle.value = { top: `${offsetHeight - 12 - arrowMargin}px` }
        break
    }
  }

  function resetStyle() {
    popoverStyle.value = {}
    arrowStyle.value = {}
    arrowClass.value = {}
  }

  function loadArrowClass() {
    if (props.hideArrow) return
    const type = arrowClassMap.find((item) => item[0].includes(_placement.value))?.[1]
    arrowClass.value = { [`tu-popover-arrow--${type}`]: !!type }
  }

  function loadDomEventListener() {
    document.addEventListener('scroll', handleDomScroll)
  }

  function unloadDomEventListener() {
    document.removeEventListener('scroll', handleDomScroll)
  }

  return () => [
    context.slots.default && h(context.slots.default?.()[0], { ref: triggerRef, ...on }),
    <Teleport to="body">
      <Transition onBeforeEnter={onBeforeEnter} onEnter={onEnter} onAfterLeave={onAfterLeave} name={`tu-${props.transitionName}`}>
        {{
          default: () => visiblePopover.value ? (
            <div class={['tu-popover', { [className!]: !!className }]} ref={popoverRef} style={popoverStyle.value}>
              <div class="tu-popover__content">{props.content || context.slots.content?.({ close })}</div>
              {props.hideArrow ? null : (
                <div class={['tu-popover-arrow-wrapper', arrowClass.value]} style={arrowStyle.value}>
                  <div class="tu-popover-arrow"></div> 
                </div>
              )}
            </div>
          ) : null
        }}
      </Transition>
    </Teleport>
  ]
}