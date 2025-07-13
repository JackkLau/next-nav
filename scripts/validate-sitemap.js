const fs = require('fs')
const path = require('path')

function validateSitemap() {
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml')
  
  if (!fs.existsSync(sitemapPath)) {
    console.error('❌ Sitemap not found at:', sitemapPath)
    return false
  }

  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8')
  
  // 基本验证
  const validations = [
    {
      name: 'XML Declaration',
      test: sitemapContent.includes('<?xml version="1.0"'),
      required: true
    },
    {
      name: 'URLSet Tag',
      test: sitemapContent.includes('<urlset'),
      required: true
    },
    {
      name: 'URL Tags',
      test: sitemapContent.includes('<url>'),
      required: true
    },
    {
      name: 'Location Tags',
      test: sitemapContent.includes('<loc>'),
      required: true
    },
    {
      name: 'Last Modified Tags',
      test: sitemapContent.includes('<lastmod>'),
      required: true
    },
    {
      name: 'Change Frequency Tags',
      test: sitemapContent.includes('<changefreq>'),
      required: true
    },
    {
      name: 'Priority Tags',
      test: sitemapContent.includes('<priority>'),
      required: true
    },
    {
      name: 'Homepage URL',
      test: sitemapContent.includes('https://loverezhao.top'),
      required: true
    }
  ]

  let allValid = true
  console.log('🔍 Validating sitemap...\n')

  validations.forEach(validation => {
    const status = validation.test ? '✅' : '❌'
    const required = validation.required ? '(Required)' : '(Optional)'
    console.log(`${status} ${validation.name} ${required}`)
    
    if (validation.required && !validation.test) {
      allValid = false
    }
  })

  // 统计 URL 数量
  const urlMatches = sitemapContent.match(/<url>/g)
  const urlCount = urlMatches ? urlMatches.length : 0
  console.log(`\n📊 Total URLs found: ${urlCount}`)

  // 检查文件大小
  const stats = fs.statSync(sitemapPath)
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2)
  console.log(`📁 File size: ${fileSizeInMB} MB`)

  if (fileSizeInMB > 50) {
    console.log('⚠️  Warning: Sitemap file is larger than 50MB, consider splitting')
  }

  if (allValid) {
    console.log('\n✅ Sitemap validation passed!')
    return true
  } else {
    console.log('\n❌ Sitemap validation failed!')
    return false
  }
}

// 运行验证
if (require.main === module) {
  validateSitemap()
}

module.exports = validateSitemap 