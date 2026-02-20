import MarkdownIt from 'markdown-it'
import katex from 'katex'

const markdown = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: true
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
    return renderedMarkdown.replace(/%%MATH_(\d+)%%/g, (_matched: string, index: string) => {
        return mathBlocks[Number(index)] || ''
    })
}

const renderChatText = (text: string) => {
    if (!text) return ''
    return renderMath(text)
}

export { renderChatText }
