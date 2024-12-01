import React, { useState, useEffect } from 'react';
import '../App.css';
import PostPreview from './PostPreview';
import Posts from '../data/posts.json';
import Separator from './Separator';

function PostPreviews() {
    const [filteredTag, setFilteredTag] = useState('ALL BLOG POSTS'); // State to track the selected tag
    const [uniqueTags, setUniqueTags] = useState([]); // State to store unique tags
    const [postsData, setPostsData] = useState([]); // State to store posts with excerpts

    // Create excerpts for each post's content
    useEffect(() => {
        const dataWithExcerpts = Posts.map(post => {
            const excerpt = post.content.split(" ").slice(0, 30).join(" ") + ' . . . ';
            return { ...post, excerpt };
        });
        setPostsData(dataWithExcerpts);
    }, []);

    // Extract unique tags when the component loads
    useEffect(() => {
        const tagsArray = Posts.flatMap(post => JSON.parse(post.tags)); // Flatten all tags into a single array
        const uniqueTags = [...new Set(tagsArray)].sort(); // Remove duplicates and sort alphabetically
        setUniqueTags(['ALL BLOG POSTS', ...uniqueTags]); // Ensure 'All' appears first
    }, []);

    // Function to filter posts based on selected tag
    const handleFilterChange = (tag) => {
        setFilteredTag(tag);
    };

    // Filter posts by selected tag or show all
    const filteredPosts = filteredTag === 'ALL BLOG POSTS'
        ? postsData
        : postsData.filter(post => {
              const tags = JSON.parse(post.tags); // Parse the tags field back into an array
              return tags && tags.includes(filteredTag); // Check if the selected tag exists in the post's tags
          });

    return (
        <div className='blog' id='blog'>
            <Separator text="BLOG" />

            {/* Filter Buttons */}
            <div className='filter-buttons'>
                {uniqueTags.map((tag, index) => (
                    <div
                        key={index}
                        className={`filter-button ${filteredTag === tag ? 'active' : ''}`}
                        onClick={() => handleFilterChange(tag)}
                    >
                        <div className="filter-button-highlight menu-button-highlight-blue">
                            <div className="filter-button-gradient menu-button-gradient-blue">
                                {tag}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Display Post Previews */}
            <div className='blog-preview-carousel'>
                {filteredPosts.map((post) => (
                    <PostPreview key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
}

export default PostPreviews;
