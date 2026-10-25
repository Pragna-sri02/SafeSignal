const fs = require('fs');
const path = require('path');

const documentsDir = path.join(__dirname, 'documents');
const outputDir = path.join(__dirname, '..', 'data', 'faiss_index');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function parseMarkdown(content, filename) {
  const meta = {
    title: filename.replace('.md', '').replace(/^[0-9]+_/, '').replace(/_/g, ' '),
    publisher: 'SafeSignal Trusted Knowledge Base',
    source_url: 'https://cybercrime.gov.in',
    category: 'general_safety',
    retrieval_date: '2026-10-24'
  };

  let body = content;
  if (content.startsWith('---')) {
    const parts = content.split('---');
    if (parts.length >= 3) {
      const frontmatter = parts[1];
      body = parts.slice(2).join('---').trim();
      const lines = frontmatter.trim().split('\n');
      for (const line of lines) {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
          const key = line.slice(0, colonIdx).trim();
          const val = line.slice(colonIdx + 1).trim();
          meta[key] = val;
        }
      }
    }
  }

  return { meta, body };
}

function chunkText(meta, body, maxWords = 350, overlap = 40) {
  const sections = body.split(/\n(?=#{1,3}\s)/);
  const chunks = [];

  for (const sec of sections) {
    const text = sec.trim();
    if (!text) continue;

    const words = text.split(/\s+/);
    if (words.length <= maxWords) {
      chunks.push({
        title: meta.title || '',
        publisher: meta.publisher || '',
        source_url: meta.source_url || '',
        category: meta.category || '',
        text: text
      });
    } else {
      let start = 0;
      while (start < words.length) {
        const end = Math.min(start + maxWords, words.length);
        const sub = words.slice(start, end).join(' ');
        chunks.push({
          title: meta.title || '',
          publisher: meta.publisher || '',
          source_url: meta.source_url || '',
          category: meta.category || '',
          text: sub
        });
        start += (maxWords - overlap);
      }
    }
  }

  return chunks;
}

const files = fs.readdirSync(documentsDir).filter(f => f.endsWith('.md'));
let allChunks = [];

for (const file of files) {
  const filePath = path.join(documentsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const { meta, body } = parseMarkdown(content, file);
  const chunks = chunkText(meta, body);
  allChunks.push(...chunks);
  console.log(`[SafeSignal] Processed ${file}: ${chunks.length} chunks created.`);
}

const outputPath = path.join(outputDir, 'chunks_metadata.json');
fs.writeFileSync(outputPath, JSON.stringify(allChunks, null, 2), 'utf-8');
console.log(`[SafeSignal] Successfully generated ${allChunks.length} chunks in ${outputPath}`);
