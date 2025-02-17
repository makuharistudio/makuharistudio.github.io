import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import posts from '../data/posts';

export default function Post() {
  const { name } = useParams();

  const post = posts.find(p => p.name === name);

  if (!post) {
    throw new Error('Post not found');
  }

  const { title, date, content } = post;

  // Helper function to dynamically import images from blog or portfolio
  const importImage = (path) => {
    try {
      if (path.startsWith('http')) return path; // Return as-is if external

      const filename = path.split('/').pop().trim(); // Extract filename
      const isBlog = path.includes('/blog/') || path.startsWith('blog/');
      const isPortfolio = path.includes('/portfolio/') || path.startsWith('portfolio/');

      let folder = isBlog ? 'blog' : isPortfolio ? 'portfolio' : '';

      if (!folder) return ''; // If no match, return empty

      return new URL(`../assets/${folder}/${filename}`, import.meta.url).href;
    } catch (err) {
      console.error(`Error loading image: ${path}`, err);
      return '';
    }
  };

  // Function to replace image paths with importImage
  const replaceImagePaths = (markdown) => {
    return markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
      try {
        const imagePath = importImage(src);
        return `![${alt}](${imagePath})`;
      } catch (error) {
        console.error(`Image not found: ${src}`, error);
        return `![${alt}](#)`;
      }
    });
  };

  const processedContent = replaceImagePaths(content);

  return (
    <content>
      <h1>{title || 'This post does not have a title'}</h1>
      <h3>{date || 'This post does not have a date'}</h3>
      <ReactMarkdown>{processedContent || 'This post does not have content'}</ReactMarkdown>
    </content>
  );
}