<template>
    <textarea
        v-if="editing"
        ref="editor"
        class="reply-editor-textarea"
        v-model="draft"
        @blur="save"
        @keydown="keyHandler"
    ></textarea>
    <span v-else v-html="renderedContent" @dblclick.stop="startEdit"></span>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { talkHistory } from '@/assets/storeUtils/talkHistory'
import { renderChatText } from '@/assets/utils/render'

const props = defineProps(['element', 'content', 'index'])
const editing = ref(false)
const draft = ref(props.content)
const editor = ref<HTMLTextAreaElement | null>(null)

watch(
    () => props.content,
    (value) => {
        if (!editing.value) draft.value = value
    }
)

const renderedContent = computed(() => renderChatText(props.content))

const startEdit = async () => {
    editing.value = true
    draft.value = props.content
    await nextTick()
    editor.value?.focus()
}

const save = () => {
    const split = talkHistory.getTalkById(props.element.Id).content.split('\n')
    if (props.index < split.length) split[props.index] = draft.value
    talkHistory.setTalkContent(props.element.Id, split.join('\n'))
    editing.value = false
}

const keyHandler = (event: KeyboardEvent) => {
    const split = talkHistory.getTalkById(props.element.Id).content.split('\n')
    if (!event.shiftKey && event.key === 'Enter') {
        event.preventDefault()
        split.splice(props.index + 1, 0, '')
        talkHistory.setTalkContent(props.element.Id, split.join('\n'))
        editor.value?.blur()
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
.reply-editor-textarea {
    width: 100%;
    min-height: 36px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    resize: vertical;
    padding: 4px 8px;
    font: inherit;
    color: inherit;
    background: rgba(255, 255, 255, 0.95);
}
</style>
