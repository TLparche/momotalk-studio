<template>
    <textarea
        v-if="editing"
        ref="editor"
        class="chat-editor-textarea"
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

const props = defineProps(['element'])
const editing = ref(false)
const draft = ref(props.element.content)
const editor = ref<HTMLTextAreaElement | null>(null)

watch(
    () => props.element.content,
    (content) => {
        if (!editing.value) draft.value = content
    }
)

const renderedContent = computed(() => renderChatText(props.element.content))

const startEdit = async () => {
    editing.value = true
    draft.value = props.element.content
    await nextTick()
    editor.value?.focus()
}

const save = () => {
    talkHistory.setTalkContent(props.element.Id, draft.value)
    editing.value = false
}

const keyHandler = (event: KeyboardEvent) => {
    if (!event.shiftKey && event.key === 'Enter') {
        event.preventDefault()
        editor.value?.blur()
    }
}
</script>

<style scoped lang="scss">
.chat-editor-textarea {
    width: 100%;
    min-height: 44px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    resize: vertical;
    padding: 4px 8px;
    font: inherit;
    color: inherit;
    background: rgba(255, 255, 255, 0.95);
}
</style>
