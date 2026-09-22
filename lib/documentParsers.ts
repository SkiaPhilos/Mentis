/**
 * Dynamic Scholarly Document Parsers (PDF.js & Mammoth)
 *
 * Loads PDF.js and Mammoth at runtime in the browser without static bundling dependencies,
 * ensuring zero webpack build errors during deployment on Vercel, Cloud Run, or CI/CD pipelines.
 */

declare global {
  interface Window {
    pdfjsLib?: any;
    mammoth?: any;
  }
}

let pdfJsPromise: Promise<any> | null = null;
let mammothPromise: Promise<any> | null = null;

/**
 * Dynamically load PDF.js in the browser from CDN if not already loaded
 */
export async function loadPdfJs(): Promise<any> {
  if (typeof window === 'undefined') return null;

  if (window.pdfjsLib) {
    return window.pdfjsLib;
  }

  if (pdfJsPromise) {
    return pdfJsPromise;
  }

  pdfJsPromise = new Promise((resolve, reject) => {
    // Check if script element already exists
    const existing = document.getElementById('mentis-pdfjs-script') as HTMLScriptElement;
    if (existing) {
      existing.addEventListener('load', () => resolve(window.pdfjsLib));
      existing.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.id = 'mentis-pdfjs-script';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;

    script.onload = () => {
      const pdfjs = window.pdfjsLib;
      if (pdfjs && !pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      resolve(pdfjs);
    };

    script.onerror = (err) => {
      pdfJsPromise = null;
      reject(new Error(`Failed to load PDF.js from CDN: ${err}`));
    };

    document.head.appendChild(script);
  });

  return pdfJsPromise;
}

/**
 * Dynamically load Mammoth.js in the browser from CDN if not already loaded
 */
export async function loadMammoth(): Promise<any> {
  if (typeof window === 'undefined') return null;

  if (window.mammoth) {
    return window.mammoth;
  }

  if (mammothPromise) {
    return mammothPromise;
  }

  mammothPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('mentis-mammoth-script') as HTMLScriptElement;
    if (existing) {
      existing.addEventListener('load', () => resolve(window.mammoth));
      existing.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.id = 'mentis-mammoth-script';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js';
    script.async = true;

    script.onload = () => {
      resolve(window.mammoth);
    };

    script.onerror = (err) => {
      mammothPromise = null;
      reject(new Error(`Failed to load Mammoth.js from CDN: ${err}`));
    };

    document.head.appendChild(script);
  });

  return mammothPromise;
}

/**
 * Parses a DOCX manuscript into HTML and estimates page count
 */
export async function parseDocx(
  arrayBuffer: ArrayBuffer
): Promise<{ html: string; estimatedPages: number }> {
  try {
    const mammoth = await loadMammoth();
    if (mammoth) {
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value || '';
      const textOnly = html.replace(/<[^>]+>/g, ' ');
      const words = textOnly.split(/\s+/).filter(Boolean).length;
      const estimatedPages = Math.max(2, Math.ceil(words / 350));
      return { html, estimatedPages };
    }
  } catch (err) {
    console.warn('Mammoth dynamic parsing failed, falling back to text extractor:', err);
  }

  // Fallback: extract readable ascii/utf8 strings from docx container
  const decoder = new TextDecoder('utf-8');
  const rawText = decoder.decode(arrayBuffer);
  const cleanStrings = rawText.match(/[A-Za-z0-9\s.,;:'"?!()-]{4,}/g) || [];
  const textContent = cleanStrings.slice(0, 1000).join(' ');
  const html = `<div><p class="italic text-sm text-[#8E7541] mb-4">Manuscript Inscribed into Codex:</p><p class="text-xs leading-relaxed text-[#202820] whitespace-pre-line">${textContent}</p></div>`;
  const estimatedPages = Math.max(2, Math.ceil(textContent.split(/\s+/).length / 300));

  return { html, estimatedPages };
}

/**
 * Loads a PDF document from base64 data, URL, or ArrayBuffer
 */
export async function loadPdfDocument(fileData: string): Promise<any> {
  const pdfjsLib = await loadPdfJs();
  if (!pdfjsLib) {
    throw new Error('PDF.js could not be initialized.');
  }

  let loadingTask;
  if (fileData.startsWith('data:application/pdf;base64,') || fileData.startsWith('data:')) {
    const base64 = fileData.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    loadingTask = pdfjsLib.getDocument({ data: bytes });
  } else if (fileData.startsWith('http')) {
    loadingTask = pdfjsLib.getDocument(fileData);
  } else {
    const binary = atob(fileData);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    loadingTask = pdfjsLib.getDocument({ data: bytes });
  }

  return loadingTask.promise;
}
