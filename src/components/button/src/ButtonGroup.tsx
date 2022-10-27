import { defineComponent, renderSlot, type PropType } from "vue";

const buttonGroupProps = {
  vertical: Boolean as PropType<boolean>
}

const ButtonGroup = defineComponent({
  name: 'TButtonGroup',
  props: buttonGroupProps,
  setup(props, context) {
    return () => (
      <div class={['tu-button-group', { 'tu-button--vertical': props.vertical }]}>
        {renderSlot(context.slots, 'default')}
      </div>
    )
  }
})

export default ButtonGroup