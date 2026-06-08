import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import projects from '../data/projects';

export default function Project() {
  const { name } = useParams();

  const project = projects.find(p => p.name === name);

  if (!project) {
    throw new Error('Project not found');
  }

  const { title, date, desc, content } = project;

  // Helper function to dynamically import images from blog or project
  const importImage = (path) => {
    try {
      if (path.startsWith('http')) return path; // Return as-is if external
  
      const filename = path.split('/').pop().trim(); // Extract filename
      const isBlog = path.includes('/blog/') || path.startsWith('blog/');
      const isProject = path.includes('/projects/') || path.startsWith('projects/');
  
      let folder = isBlog ? 'blog' : isProject ? 'projects' : '';
  
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
      <h3>{date || 'This project does not have a date'}</h3>
      <h1>{title || 'This project does not have a title'}</h1>
      <h2>{desc || 'This project does not have a description'}</h2>
      <ReactMarkdown>{processedContent || 'This project does not have content'}</ReactMarkdown>
    </content>
  );
}
