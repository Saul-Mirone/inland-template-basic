/**
 * Utility functions for the blog builder
 */

import fs from 'fs/promises'
import path from 'path'
import fm from 'front-matter'

export async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
  }
}

export async function copyAssets(srcDir, destDir) {
  try {
    await fs.access(srcDir)
  } catch {
    // No assets directory
    return
  }

  const items = await fs.readdir(srcDir, { withFileTypes: true })
  
  for (const item of items) {
    const srcPath = path.join(srcDir, item.name)
    const destPath = path.join(destDir, item.name)
    
    if (item.isDirectory()) {
      await ensureDir(destPath)
      await copyAssets(srcPath, destPath)
    } else {
      await fs.copyFile(srcPath, destPath)
    }
  }
}

export function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export async function parseMarkdownFile(content, filename) {
  const parsed = fm(content)
  const slug = filename.replace(/\.(md|html)$/, '')
  
  return {
    slug,
    frontmatter: parsed.attributes,
    html: `<pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(parsed.body)}</pre>`,
    isCompiled: false
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  
  return text.replace(/[&<>"']/g, (m) => map[m])
}