import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { marked } from 'marked';
import Panel from '../assets/theme/accent/components/Panel'

export default function BlogList({ posts }) {
  const [selectedTag, setSelectedTag] = useState(null);

  // Extract unique tags from posts
  const allTags = posts.flatMap(post => JSON.parse(post.tags));
  const uniqueTags = [...new Set(allTags)].sort();

  // Filter posts based on selected tag
  const filteredPosts = selectedTag
    ? posts.filter(post => JSON.parse(post.tags).includes(selectedTag))
    : posts;

  // Define the active style
  const activeButtonStyle = {
    color: 'var(--button-font-color-hover)',
    border: '1px solid var(--button-font-color-hover)',
  };

  return (
    <>
      <div className='filter'>
        {/* "ALL POSTS" button with dynamic inline style */}
        <button
          onClick={() => setSelectedTag(null)}
          style={selectedTag === null ? activeButtonStyle : {}}
        >ALL POSTS</button>

        {/* Render buttons for each unique tag */}
        {uniqueTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            style={selectedTag === tag ? activeButtonStyle : {}}
          >{tag}</button>
        ))}
      </div>

      <div id='blog-list'>
        {/* Display filtered posts */}
        {filteredPosts.map(p => {
          // Convert Markdown to plain text
          const plainText = marked(p.content).replace(/<[^>]*>/g, '');
          const excerpt = plainText.split(" ").slice(0, 30).join(" ") + ' . . . ';
          const isExternalUrl = p.photo.startsWith('http');
          const imagePath = isExternalUrl ? p.photo : new URL(`../assets/blog/${p.photo.split('/').pop().trim()}`, import.meta.url).href;

          return (
            <Link key={p.name} to={'/blog/' + p.name}>
              <Panel>
                <h4>{p.title}</h4>
                <h5>{p.date}</h5>
                <img src={imagePath} loading='lazy' alt={p.title} />
                <p>{excerpt}</p>
              </Panel>
            </Link>
          );
        })}
      </div>
    </>
  );
}