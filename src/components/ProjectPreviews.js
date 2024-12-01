import React, { useState } from 'react';
import '../App.css';
import ProjectPreview from './ProjectPreview';
import portfolio from '../data/portfolio';
import Separator from './Separator';

// Helper function to extract unique tags from the portfolio
function getUniqueTags(portfolio) {
    const allTags = portfolio.flatMap(project => project.tags);
    return ['ALL PROJECTS', ...Array.from(new Set(allTags)).sort()];
}

function ProjectPreviews() {
    const [selectedTag, setSelectedTag] = useState('ALL PROJECTS');
    const data = portfolio;

    // Get unique tags for filter buttons
    const tags = getUniqueTags(portfolio);

    // Filter projects based on selected tag
    const filteredProjects = selectedTag === 'ALL PROJECTS'
        ? data
        : data.filter(project => project.tags.includes(selectedTag));

    return (
        <div className='portfolio' id='portfolio'>
            <Separator text="PORTFOLIO" />

            {/* Filter Buttons */}
            <div className="filter-buttons">
                {tags.map((tag, index) => (
                    <div
                        key={index}
                        className={`filter-button ${selectedTag === tag ? 'active' : ''}`}
                        onClick={() => setSelectedTag(tag)}
                    >
                        <div className="filter-button-highlight menu-button-highlight-blue">
                            <div className="filter-button-gradient menu-button-gradient-blue">
                                {tag}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Render filtered project previews */}
            <div className='project-preview-carousel'>
                {filteredProjects.map((project, index) => (
                    <ProjectPreview key={index} project={project} />
                ))}
            </div>
        </div>
    );
}

export default ProjectPreviews;
