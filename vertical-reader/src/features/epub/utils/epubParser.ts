import JSZip from 'jszip';

export async function parseEpub(file: File): Promise<string[]> {
  const zip = new JSZip();
  await zip.loadAsync(file);

  // 1. Locate the rootfile
  const containerXmlNode = zip.file('META-INF/container.xml');
  if (!containerXmlNode) throw new Error('Not a valid EPUB: Missing container.xml');
  const containerXml = await containerXmlNode.async('string');

  const parser = new DOMParser();
  const containerDoc = parser.parseFromString(containerXml, 'application/xml');
  const rootfile = containerDoc.querySelector('rootfile')?.getAttribute('full-path');
  if (!rootfile) throw new Error('No rootfile found in container.xml');

  // Extract the directory containing the .opf file to resolve relative hrefs later
  const opfDir = rootfile.includes('/') ? rootfile.substring(0, rootfile.lastIndexOf('/') + 1) : '';

  // 2. Parse the OPF manifest and spine
  const opfContentNode = zip.file(rootfile);
  if (!opfContentNode) throw new Error('OPF file missing');
  const opfContent = await opfContentNode.async('string');
  const opfDoc = parser.parseFromString(opfContent, 'application/xml');

  // Build a lookup map of id -> href
  const manifestItems = opfDoc.querySelectorAll('manifest > item');
  const manifestMap: Record<string, string> = {};
  manifestItems.forEach(item => {
    const id = item.getAttribute('id');
    const href = item.getAttribute('href');
    if (id && href) manifestMap[id] = href;
  });

  // 3. Extract HTML payload in reading order
  const spineItems = opfDoc.querySelectorAll('spine > itemref');
  let fullText = '';

  for (const item of spineItems) {
    const idref = item.getAttribute('idref');
    if (idref && manifestMap[idref]) {
      let href = manifestMap[idref];
      href = decodeURIComponent(href); // Clean up any %20 encodings
      const filePath = opfDir + href;

      const fileNode = zip.file(filePath);
      if (fileNode) {
        const html = await fileNode.async('string');
        const doc = parser.parseFromString(html, 'text/html');
        
        // Critical for Japanese: Strip out <rt> and <rp> ruby phonetics
        // If we don't, text like `<ruby>漢<rt>かん</rt></ruby>` collapses into "漢かん"
        const rtNodes = doc.querySelectorAll('rt, rp');
        rtNodes.forEach(node => node.remove());

        // Ensure block structural elements break into newlines so paragraphs don't mash
        // together when we extract flat textContent!
        const blockEls = doc.querySelectorAll('p, div, br, h1, h2, h3, h4, h5, h6, li');
        blockEls.forEach(el => {
          el.insertAdjacentText('afterend', '\n');
        });
        
        const text = doc.body?.textContent || '';
        fullText += text + '\n';
      }
    }
  }

  // 4. Intelligently structure text into array of individual Japanese sentences
  const rawLines = fullText.split(/[\n\r]+/);
  const sentences: string[] = [];

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Aggressively split against "。" (and similar basic Japanese boundaries) 
    // to strictly enforce exactly one sentence per line, ignoring quotes.
    const parts = trimmed
      .replace(/([。！？]+)/g, '$1|∆|')
      .split('|∆|');
    for (const p of parts) {
      const s = p.trim();
      if (s) sentences.push(s);
    }
  }

  return sentences;
}
