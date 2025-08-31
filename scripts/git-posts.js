import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function getGitMetadata(filePath) {
  console.log(`  📋 Getting git metadata for: ${path.basename(filePath)}`);
  
  try {
    console.log(`    🔍 Executing git log for createdAt...`);
    const createdAt = execSync(
      `git log --follow --format=%aD "${filePath}" | tail -1`,
      { encoding: 'utf8' }
    ).trim();
    console.log(`    ✅ Created at: ${createdAt}`);

    console.log(`    🔍 Executing git log for updatedAt...`);
    const updatedAt = execSync(
      `git log --follow --format=%aD "${filePath}" | head -1`,
      { encoding: 'utf8' }
    ).trim();
    console.log(`    ✅ Updated at: ${updatedAt}`);

    console.log(`    🔍 Executing git log for author...`);
    const author = execSync(
      `git log --follow --format=%an "${filePath}" | head -1`,
      { encoding: 'utf8' }
    ).trim();
    console.log(`    ✅ Author: ${author}`);

    const result = {
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
      author,
    };
    
    console.log(`    🎯 Git metadata extracted successfully`);
    return result;
  } catch (error) {
    console.warn(`    ⚠️  Warning: Could not get git metadata for ${path.basename(filePath)}:`, error.message);
    const now = new Date();
    const fallback = {
      createdAt: now,
      updatedAt: now,
      author: 'Unknown',
    };
    console.log(`    🔄 Using fallback metadata: ${fallback.author} at ${fallback.createdAt.toISOString()}`);
    return fallback;
  }
}

function parseFrontMatter(content) {
  console.log(`  📄 Parsing front matter...`);
  
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);
  
  if (!match) {
    console.log(`    ⚠️  No front matter found, using empty metadata`);
    return { metadata: {}, content: content.trim() };
  }
  
  const metadataText = match[1];
  const contentText = match[2];
  
  console.log(`    📝 Front matter text length: ${metadataText.length} characters`);
  console.log(`    📄 Content text length: ${contentText.length} characters`);
  
  // Parse YAML-like metadata
  const metadata = {};
  const lines = metadataText.split('\n');
  
  console.log(`    🔍 Parsing ${lines.length} metadata lines...`);
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmedLine.substring(0, colonIndex).trim();
        let value = trimmedLine.substring(colonIndex + 1).trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        // Parse boolean values
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        
        // Parse arrays (simple comma-separated values)
        else if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(v => v.trim().replace(/"/g, ''));
        }
        
        metadata[key] = value;
        console.log(`    ✅ Parsed: ${key} = ${JSON.stringify(value)}`);
      }
    } else if (trimmedLine.startsWith('#')) {
      console.log(`    💬 Comment: ${trimmedLine}`);
    }
  }
  
  console.log(`    🎯 Front matter parsing complete. Found ${Object.keys(metadata).length} metadata fields`);
  return { metadata, content: contentText.trim() };
}

function processPosts() {
  console.log('🚀 Starting post processing...');
  console.log('=====================================');
  
  const postsDir = path.join(process.cwd(), 'public', 'posts');
  const outputFile = path.join(process.cwd(), 'public', 'posts.json');
  
  console.log(`📁 Posts directory: ${postsDir}`);
  console.log(`📄 Output file: ${outputFile}`);
  
  if (!fs.existsSync(postsDir)) {
    console.error('❌ Posts directory does not exist:', postsDir);
    return;
  }
  
  console.log('✅ Posts directory found');
  
  const files = fs.readdirSync(postsDir);
  console.log(`📋 Found ${files.length} files in posts directory`);
  
  const posts = [];
  let processedCount = 0;
  let skippedCount = 0;
  
  for (const file of files) {
    console.log(`\n📄 Processing file: ${file}`);
    
    if (file.endsWith('.html') || file.endsWith('.md')) {
      const filePath = path.join(postsDir, file);
      console.log(`  📂 Full path: ${filePath}`);
      
      try {
        console.log(`  📖 Reading file content...`);
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`  ✅ File read successfully (${content.length} characters)`);
        
        const { metadata, content: postContent } = parseFrontMatter(content);
        const gitMetadata = getGitMetadata(filePath);
        
        const slug = file.replace(/\.(html|md)$/, '');
        console.log(`  🏷️  Generated slug: ${slug}`);
        
        const post = {
          slug,
          title: metadata.title || 'Untitled',
          author: metadata.author || gitMetadata.author,
          content: postContent,
          tags: metadata.tags || [],
          excerpt: metadata.excerpt || postContent.substring(0, 150) + '...',
          published: metadata.published !== false, // default to true
          createdAt: gitMetadata.createdAt.toISOString(),
          updatedAt: gitMetadata.updatedAt.toISOString(),
          filePath: `posts/${file}`,
        };
        
        posts.push(post);
        processedCount++;
        console.log(`  ✅ Successfully processed: ${file} -> "${post.title}"`);
        console.log(`    📊 Post stats: ${postContent.length} chars, ${post.tags.length} tags, published: ${post.published}`);
      } catch (error) {
        console.error(`  ❌ Error processing ${file}:`, error.message);
        skippedCount++;
      }
    } else {
      console.log(`  ⏭️  Skipping non-post file: ${file}`);
      skippedCount++;
    }
  }
  
  console.log('\n📊 Processing Summary:');
  console.log(`  ✅ Processed: ${processedCount} posts`);
  console.log(`  ⏭️  Skipped: ${skippedCount} files`);
  console.log(`  📄 Total files: ${files.length}`);
  
  if (posts.length === 0) {
    console.log('⚠️  No posts were processed. Check your posts directory.');
    return;
  }
  
  // Sort posts by createdAt (newest first)
  console.log('\n🔄 Sorting posts by creation date (newest first)...');
  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Write the JSON file
  const outputData = {
    posts,
    generatedAt: new Date().toISOString(),
    totalPosts: posts.length,
  };
  
  console.log(`\n💾 Writing output to: ${outputFile}`);
  try {
    fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
    console.log(`✅ Successfully generated ${outputFile}`);
    console.log(`📊 Output contains ${posts.length} posts`);
    console.log(`📅 Generated at: ${outputData.generatedAt}`);
    
    // Show a summary of processed posts
    console.log('\n📋 Processed Posts:');
    posts.forEach((post, index) => {
      console.log(`  ${index + 1}. "${post.title}" by ${post.author} (${post.slug})`);
    });
    
  } catch (error) {
    console.error(`❌ Error writing output file:`, error.message);
  }
  
  console.log('\n🎉 Post processing complete!');
  console.log('=====================================');
}

// Run the script when executed directly
processPosts();
