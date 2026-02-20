import MarkdownIt from 'markdown-it'
import katex from 'katex'

const markdown = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: false
})

const renderMath = (text: string) => {
    const mathBlocks: string[] = []
    const store = (math: string) => {
        const token = `%%MATH_${mathBlocks.length}%%`
        mathBlocks.push(math)
        return token
    }

    const withDisplayMath = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, formula) => {
        try {
            return store(katex.renderToString(formula, { throwOnError: false, displayMode: true }))
        } catch (_error) {
            return store(formula)
        }
    })

    const withInlineMath = withDisplayMath.replace(/(^|[^\$])\$([^\n$]+?)\$/g, (_, prefix, formula) => {
        try {
            return `${prefix}${store(katex.renderToString(formula, { throwOnError: false }))}`
        } catch (_error) {
            return `${prefix}${store(formula)}`
        }
    })

    const renderedMarkdown = markdown.renderInline(withInlineMath)
    const withoutBreakTags = renderedMarkdown.replace(/<br\s*\/?>/gi, '\n')
    return withoutBreakTags.replace(/%%MATH_(\d+)%%/g, (_matched: string, index: string) => {
        return mathBlocks[Number(index)] || ''
    })
}

const renderChatText = (text: string) => {
    if (!text) return ''
    const normalized = text
        .replace(/\r\n/g, '\n')
        .replace(/\n+$/g, '')
    return renderMath(normalized)
}

export { renderChatText }
