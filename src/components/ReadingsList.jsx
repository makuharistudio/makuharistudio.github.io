import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ReadingsList({ readings }) {
  const [selectedTag, setSelectedTag] = useState(null);

  if (!readings) {
    return <div>No readings available</div>;
  }

  // Extract unique tags from the readings
  const allTags = readings.flatMap(reading => JSON.parse(reading.tags));
  const uniqueTags = [...new Set(allTags)].sort();

  // Filter readings based on selectedTag
  const filteredReadings = selectedTag
    ? readings.filter(reading => JSON.parse(reading.tags).includes(selectedTag))
    : readings;

  // Define the active style
  const activeButtonStyle = {
    color: 'var(--button-font-color-highlight)',
    border: '1px solid var(--button-font-color-highlight)',
  };

  return (
    <>
      <div className='filter'>
        <button
          onClick={() => setSelectedTag(null)}
          style={selectedTag === null ? activeButtonStyle : {}}
        >ALL BOOKS</button>

        {uniqueTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            style={selectedTag === tag ? activeButtonStyle : {}}
          >{tag}</button>
        ))}
      </div>

      <div id='readings-list'>
        {filteredReadings.map(r => {
          const isExternalUrl = r.photo.startsWith('http');
          const imagePath = isExternalUrl ? r.photo : new URL(`../assets/readings/${r.photo.split('/').pop().trim()}`, import.meta.url).href;

          return (
            <Link key={r.name} to={'/readings/' + r.name}>
              <h4>{r.title} by {r.author}</h4>
              <h5>{r.date}</h5>
              <img src={imagePath} loading='lazy' alt={r.title} />
              <p>{r.desc}</p>
            </Link>
          );
        })}
      </div>
    </>
  );
}