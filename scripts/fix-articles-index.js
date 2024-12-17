const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// 直接在脚本中定义 generateSlug 函数
function generateSlug(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fixArticlesIndex() {
  try {
    const articlesPath = path.join(process.cwd(), 'data/json/articles.json');
    
    // 检查文件是否存在
    if (!fs.existsSync(articlesPath)) {
      console.error('articles.json not found at:', articlesPath);
      return;
    }

    console.log('Reading articles from:', articlesPath);
    const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
    console.log('Found articles:', articles.length);

    // 修复每篇文章的 slug
    const fixedArticles = articles.map(article => {
      try {
        // 从文章内容中读取标题
        const mdPath = path.join(process.cwd(), article.path);
        
        if (!fs.existsSync(mdPath)) {
          console.warn('MD file not found:', mdPath);
          return article;
        }

        const fileContents = fs.readFileSync(mdPath, 'utf8');
        const { data } = matter(fileContents);
        
        const title = data.title || article.title;
        const slug = data.slug || generateSlug(title);
        
        console.log(`Processing article: ${title} -> ${slug}`);

        return {
          ...article,
          title: title,
          slug: slug
        };
      } catch (error) {
        console.error('Error processing article:', article.path, error);
        return article;
      }
    });

    // 保存修复后的索引
    console.log('Saving updated articles index...');
    fs.writeFileSync(
      articlesPath,
      JSON.stringify(fixedArticles, null, 2)
    );

    console.log('Articles index fixed successfully');
  } catch (error) {
    console.error('Error fixing articles index:', error);
  }
}

// 执行修复
fixArticlesIndex(); 