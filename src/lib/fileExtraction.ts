export type ExtractionMode = 'text' | 'image'

export interface FileExtractionResult {
  mode: ExtractionMode
  content?: string
  imageBase64?: string
  mimeType?: string
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

  const buffer = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data: buffer }).promise
  const pages: string[] = []
  const maxPages = Math.min(doc.numPages, 15)
  for (let i = 1; i <= maxPages; i++) {
    const page = await doc.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map((item) => ('str' in item ? item.str : '')).join(' ')
    pages.push(pageText)
  }
  return pages.join('\n\n')
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import('mammoth')
  const buffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  return result.value
}

/**
 * Prepares any supported file (image, PDF, DOCX, or plain text) for AI extraction.
 * Images are sent as-is for vision OCR; documents are parsed client-side to plain text first.
 */
export async function prepareFileForExtraction(file: File): Promise<FileExtractionResult> {
  const type = file.type
  const name = file.name.toLowerCase()

  if (type.startsWith('image/')) {
    const imageBase64 = await fileToBase64(file)
    return { mode: 'image', imageBase64, mimeType: type }
  }

  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    const content = await extractPdfText(file)
    return { mode: 'text', content }
  }

  if (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    const content = await extractDocxText(file)
    return { mode: 'text', content }
  }

  if (type.startsWith('text/') || name.endsWith('.txt') || name.endsWith('.md')) {
    const content = await file.text()
    return { mode: 'text', content }
  }

  throw new Error(`Unsupported file type: ${type || name}. Try an image, PDF, DOCX, or plain text file.`)
}
