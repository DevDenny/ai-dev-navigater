const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

function escapeYamlString(str) {
  if (!str) return '';
  if (/[:{}[\],&*#?|\-<>=!%@`]/.test(str)) {
    return `"${str.replace(/"/g, '\\"')}"`;
  }
  return str;
}

async function fixInvalidArticles() {
  try {
    const articlesPath = path.join(process.cwd(), 'data/json/articles.json');
    console.log('Reading articles from:', articlesPath);
    
    const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
    console.log('Found articles:', articles.length);

    const fixedArticles = articles.map(article => {
      console.log('\nProcessing article:', article.title);
      
      // 使用原始路径，不改变文件位置
      const mdPath = path.join(process.cwd(), article.path);
      console.log('MD file path:', mdPath);

      // 读取现有的 MD 文件内容
      let existingContent = '';
      if (fs.existsSync(mdPath)) {
        try {
          const { content } = matter(fs.readFileSync(mdPath, 'utf8'));
          existingContent = content;
        } catch (error) {
          console.warn(`Error reading existing content for ${article.title}:`, error);
        }
      }

      // 使用 articles.json 中的信息重新生成 MD 文件
      const mdContent = `---
title: ${escapeYamlString(article.title)}
description: ${escapeYamlString(article.description || '')}
date: ${article.date || new Date().toISOString().split('T')[0]}
category: ${escapeYamlString(article.category || '')}
categoryName: ${escapeYamlString(article.categoryName || '')}
slug: ${article.slug || ''}
lastModified: ${article.lastModified || new Date().toISOString()}
---

${existingContent || article.content || ''}
`;

      // 确保目录存在
      const mdDir = path.dirname(mdPath);
      if (!fs.existsSync(mdDir)) {
        fs.mkdirSync(mdDir, { recursive: true });
      }

      // 写入 MD 文件
      fs.writeFileSync(mdPath, mdContent, 'utf8');
      console.log(`Updated MD file: ${mdPath}`);

      return article;
    });

    // 保存 articles.json
    console.log('\nSaving articles index...');
    fs.writeFileSync(articlesPath, JSON.stringify(fixedArticles, null, 2));

    console.log('Articles fixed successfully');
  } catch (error) {
    console.error('Error fixing articles:', error);
    throw error;
  }
}

// 执行脚本
fixInvalidArticles().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
}); 