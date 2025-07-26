import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Panel from '../assets/theme/accent/components/Panel'

export default function PortfolioList({ projects }) {
  const [selectedTag, setSelectedTag] = useState(null);

  if (!projects) {
    return <div>No projects available</div>;
  }

  // Extract unique tags from the projects
  const allTags = projects.flatMap(project => JSON.parse(project.tags));
  const uniqueTags = [...new Set(allTags)].sort();

  // Filter projects based on selectedTag
  const filteredProjects = selectedTag
    ? projects.filter(project => JSON.parse(project.tags).includes(selectedTag))
    : projects;

  // Define the active style
  const activeButtonStyle = {
    color: 'var(--button-font-color-hover)',
    border: '1px solid var(--button-font-color-hover)',
  };

  return (
    <>
      <div className='filter'>
        <button
          onClick={() => setSelectedTag(null)}
          style={selectedTag === null ? activeButtonStyle : {}}
        >ALL PROJECTS</button>

        {uniqueTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            style={selectedTag === tag ? activeButtonStyle : {}}
          >{tag}</button>
        ))}
      </div>

      <div id='portfolio-list'>
        {filteredProjects.map(p => {
          const isExternalUrl = p.photo.startsWith('http');
          const imagePath = isExternalUrl ? p.photo : new URL(`../assets/portfolio/${p.photo.split('/').pop().trim()}`, import.meta.url).href;

          return (
            <Link key={p.name} to={'/portfolio/' + p.name}>
              <Panel>
                <h4>{p.title}</h4>
                <h5>{p.date}</h5>
                <img src={imagePath} loading='lazy' alt={p.title} />
                <p>{p.desc}</p>
              </Panel>
            </Link>
          );
        })}
      </div>
    </>
  );
}