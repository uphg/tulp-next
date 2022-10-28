import { defineComponent, ref } from "vue";
import LoadingIcon from './LoadingIcon'
import { TBaseWave } from '../../base-wave'
import { TExpandTransition } from '../../expand-transition'
import { TFadeTransition } from '../../fade-transition'
import { TIcon } from '../../icon/index'
import type { PropType } from 'vue'
import type { BaseWaveRef } from '../../base-wave'

const buttonProps = {
  type: {
    type: String as PropType<'default' | 'primary' | 'success' | 'warning' | 'info' | 'error'>,
    default: 'default',
    validator: (value: string) => {
      return [ 'default', 'primary', 'success', 'warning', 'info', 'error' ].includes(value)
    }
  },
  size: {
    type: String as PropType<'' | 'large' | 'medium' | 'small'>,
    validator: (value: string) => {
      return ['', 'large', 'medium', 'small'].includes(value)
    }
  },
  icon: {
    type: String,
    default: ''
  },
  iconPosition: {
    type: String as PropType<'left' | 'right'>,
    default: 'left',
    validator: (value: string) => {
      return ['left', 'right'].includes(value)
    }
  },
  nativeType: {
    type: String as PropType<'button' | 'submit' | 'reset'>,
    default: 'button',
    validator: (value: string) => {
      return ['button', 'submit', 'reset'].includes(value)
    }
  },
  loading: Boolean,
  disabled: Boolean,
  text: Boolean,
  circle: Boolean,
  round: Boolean,
  dashed: Boolean,
  ghost: Boolean
}

const Button = defineComponent({
  name: 'TButton',
  props: buttonProps,
  setup(props, context) {
    const buttonRef = ref<Element | null>()
    const waveRef = ref<BaseWaveRef | null>(null)
    const onClick = () => {
      waveRef.value?.triggerWave()
    }

    return () => {
      const { type, size, text, dashed, ghost, circle, round, disabled, icon, loading, iconPosition, nativeType } = props
      const slots = context.slots
      return (
        <button
          ref={buttonRef}
          class={[
            'tu-button',
            {
              [`tu-button--${type}`]: type,
              [`tu-button--${size}`]: size,
              'tu-button--text': text,
              'tu-button--dashed': dashed,
              'tu-button--ghost': ghost,
              'tu-button--circle': circle,
              'tu-button--round': round,
            }
          ]}
          type={nativeType}
          disabled={disabled}
          onClick={onClick}
        >
          <TExpandTransition>
            { icon || loading ? (
              <span
                class={[
                  'tu-button__icon',
                  {
                    [`tu-icon--${iconPosition}`]: iconPosition,
                    'tu-icon--empty': !slots.default
                  }
                ]}
              >
                <TFadeTransition>
                  { loading ? <LoadingIcon /> : <TIcon name={icon} /> }
                </TFadeTransition>
              </span>
              ) : null }
          </TExpandTransition>
          {slots.default ? (
            <span class="tu-button__content">
              {slots.default?.()}
            </span>
          ) : null}
          {!text ? (
            <>
              <TBaseWave ref={waveRef} big={circle} />
              <span class="tu-button__border" />
              <span class="tu-button__state-border" />
            </>
          ) : null}
        </button>
      )
    }
  }
})

export default Button
