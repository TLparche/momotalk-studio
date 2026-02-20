<template>
    <span
        v-if="editing"
        ref="editor"
        class="reply-inline-editable is-editing"
        contenteditable="true"
        @blur="save"
        @input="onInput"
        @keydown="keyHandler"
    ></span>
    <span
        v-else
        class="reply-inline-editable"
        v-html="renderedContent"
        title="Double-click to edit"
        @dblclick.stop="startEdit"
    ></span>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { talkHistory } from '@/assets/storeUtils/talkHistory'
import { renderChatText } from '@/assets/utils/render'

const props = defineProps(['element', 'content', 'index'])
const editing = ref(false)
const draft = ref(props.content)
const editor = ref<HTMLSpanElement | null>(null)

watch(
    () => props.content,
    (value) => {
        if (!editing.value) draft.value = value
    }
)

const renderedContent = computed(() => renderChatText(props.content))

const normalizeDraft = (value: string) => {
    return value
        .replace(/\r\n/g, '\n')
        .replace(/\u00a0/g, ' ')
        .replace(/\n+$/g, '')
}

const focusEditorAtEnd = () => {
    const element = editor.value
    if (!element) return
    element.focus()
    const range = document.createRange()
    range.selectNodeContents(element)
    range.collapse(false)
    const selection = window.getSelection()
    if (!selection) return
    selection.removeAllRanges()
    selection.addRange(range)
}

const startEdit = async () => {
    editing.value = true
    draft.value = props.content
    await nextTick()
    if (editor.value) editor.value.innerText = draft.value
    focusEditorAtEnd()
}

const onInput = () => {
    draft.value = normalizeDraft(editor.value?.innerText ?? '')
}

const cancel = () => {
    editing.value = false
    draft.value = props.content
}

const save = () => {
    if (!editing.value) return
    const nextContent = normalizeDraft(draft.value)
    draft.value = nextContent
    const split = talkHistory.getTalkById(props.element.Id).content.split('\n')
    if (props.index < split.length) split[props.index] = nextContent
    talkHistory.setTalkContent(props.element.Id, split.join('\n'))
    editing.value = false
}

const keyHandler = (event: KeyboardEvent) => {
    const split = talkHistory.getTalkById(props.element.Id).content.split('\n')
    if (event.key === 'Escape') {
        event.preventDefault()
        cancel()
        return
    }

    if (!event.shiftKey && event.key === 'Enter') {
        event.preventDefault()
        split.splice(props.index + 1, 0, '')
        talkHistory.setTalkContent(props.element.Id, split.join('\n'))
        editing.value = false
        return
    }

    if (event.key === 'Backspace' && draft.value.length === 0 && split.length > 1) {
        event.preventDefault()
        split.splice(props.index, 1)
        talkHistory.setTalkContent(props.element.Id, split.join('\n'))
        editing.value = false
    }
}
</script>

<style scoped lang="scss">
.reply-inline-editable {
    display: inline-block;
    max-width: 100%;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    word-break: break-word;
    cursor: text;
}

.reply-inline-editable.is-editing {
    position: relative;
    box-shadow: inset 0 0 0 2px #4d8fd2;
    border-radius: 6px;
}

.reply-inline-editable.is-editing::after {
    content: 'Editing';
    position: absolute;
    top: -16px;
    right: 0;
    font-size: 11px;
    line-height: 1;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 999px;
    background: #4d8fd2;
    color: #ffffff;
}
</style>
