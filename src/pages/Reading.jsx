import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import readings from '../data/readings';

export default function Reading() {
  const { name } = useParams();

  const reading = readings.find(r => r.name === name);

  if (!reading) {
    throw new Error('Reading not found');
  }

  const { title, author, date, content } = reading;

  // Helper function to dynamically import images from readings
  const importImage = (path) => {
    try {
      const isExternalUrl = path.startsWith('http');
      if (isExternalUrl) {
        return path;
      }

      return new URL(`../assets/readings/${path.split('/').pop()}`, import.meta.url).href;
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
      <h3>{date || 'This reading does not have a date'}</h3>
      <h1>{title || 'This reading does not have a title'} by {author || 'This reading does not have a author'}</h1>
      <ReactMarkdown>{processedContent || 'This reading does not have content'}</ReactMarkdown>
    </content>
  );
}
