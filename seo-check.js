#!/usr/bin/env node

/**
 * SEO 检查脚本
 * 用于验证网站的 SEO 优化情况
 */

const fs = require('fs');
const path = require('path');

// SEO 检查项目
const seoChecks = {
  // 检查文件是否存在
  files: [
    'next-sitemap.config.js',
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/app/(detail)/[slug]/page.tsx',
    'src/app/category/[category]/page.tsx',
    'src/constant/metaData.ts'
  ],
  
  // 检查关键 SEO 元素
  keywords: [
    'canonical',
    'alternates',
    'openGraph',
    'twitter',
    'robots',
    'application/ld+json',
    'schema.org',
    'WebSite',
    'ItemList',
    'aria-label',
    'aria-labelledby',
    'main',
    'section',
    'article',
    'aside',
    'h1',
    'h2',
    'h3',
    'rel="noopener noreferrer"',
    'alt=',
    'lang="zh-CN"'
  ],
  
  // 检查路由结构
  routes: [
    '/',
    '/[slug]',
    '/category/[category]'
  ]
};

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkFileContent(filePath, keywords) {
  if (!checkFileExists(filePath)) {
    return { exists: false, matches: [] };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = keywords.filter(keyword => content.includes(keyword));
  
  return { exists: true, matches };
}

function runSeoCheck() {
  console.log('🔍 开始 SEO 检查...\n');
  
  let totalScore = 0;
  let maxScore = 0;
  
  // 检查文件存在性
  console.log('📁 文件检查:');
  seoChecks.files.forEach(file => {
    const exists = checkFileExists(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    if (exists) totalScore += 10;
    maxScore += 10;
  });
  
  console.log('\n🔍 SEO 元素检查:');
  
  // 检查关键文件的内容
  const keyFiles = [
    'src/app/layout.tsx',
    'src/app/page.tsx', 
    'src/app/(detail)/[slug]/page.tsx',
    'src/app/category/[category]/page.tsx'
  ];
  
  keyFiles.forEach(file => {
    if (checkFileExists(file)) {
      const result = checkFileContent(file, seoChecks.keywords);
      const score = result.matches.length;
      totalScore += score;
      maxScore += seoChecks.keywords.length;
      
      console.log(`\n📄 ${file}:`);
      console.log(`  找到 ${score}/${seoChecks.keywords.length} 个 SEO 元素`);
      
      if (score > 0) {
        console.log('  ✅ 包含的 SEO 元素:');
        result.matches.forEach(match => {
          console.log(`    - ${match}`);
        });
      }
    }
  });
  
  // 检查 sitemap 配置
  console.log('\n🗺️ Sitemap 配置检查:');
  if (checkFileExists('next-sitemap.config.js')) {
    const sitemapContent = fs.readFileSync('next-sitemap.config.js', 'utf8');
    const sitemapChecks = [
      'siteUrl',
      'generateRobotsTxt',
      'priority',
      'changefreq',
      'transform'
    ];
    
    const sitemapScore = sitemapChecks.filter(check => sitemapContent.includes(check)).length;
    totalScore += sitemapScore;
    maxScore += sitemapChecks.length;
    
    console.log(`  Sitemap 配置完整性: ${sitemapScore}/${sitemapChecks.length}`);
  }
  
  // 计算总分
  const percentage = Math.round((totalScore / maxScore) * 100);
  
  console.log('\n📊 SEO 检查结果:');
  console.log(`  总分: ${totalScore}/${maxScore} (${percentage}%)`);
  
  if (percentage >= 90) {
    console.log('  🎉 优秀! 网站 SEO 优化得很好');
  } else if (percentage >= 70) {
    console.log('  👍 良好! 还有改进空间');
  } else if (percentage >= 50) {
    console.log('  ⚠️ 一般! 需要更多 SEO 优化');
  } else {
    console.log('  ❌ 需要大幅改进 SEO');
  }
  
  console.log('\n📋 SEO 优化建议:');
  console.log('  1. 确保所有页面都有 canonical URL');
  console.log('  2. 添加结构化数据 (JSON-LD)');
  console.log('  3. 使用语义化 HTML 标签');
  console.log('  4. 添加适当的 aria 标签');
  console.log('  5. 优化图片 alt 属性');
  console.log('  6. 配置 Open Graph 和 Twitter 卡片');
  console.log('  7. 设置正确的 robots.txt 和 sitemap');
  console.log('  8. 使用 HTTPS 和正确的语言设置');
}

// 运行检查
runSeoCheck(); 