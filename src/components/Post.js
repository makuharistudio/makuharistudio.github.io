import React from 'react';
import '../App.css';
import { Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Header from './Header';
import Footer from './Footer';
import postList from '../data/posts.json';

class Post extends React.Component {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const validId = parseInt(this.props.match.params.id, 10); // Get the post ID from the URL params

    // Validate if the validId is a number
    if (isNaN(validId) || validId <= 0) {
      return <Navigate to="/404" />;
    }

    // Fetch the post by ID
    const fetchedPost = postList.find(post => post.id === validId);

    // Check if post exists
    if (!fetchedPost) {
      return <Navigate to="/404" />;
    }

    // Use destructuring to get post properties
    const { title, date, content } = fetchedPost;

    return (
      <div className="container page">
        <div className="interface">
          <Header
            mp3credit="♪♪♪ Now playing: Small Discoveries by Evgeny_Bardyuzha @ pixabay.com"
            mp3="https://github.com/makuharistudio/makuharistudio.github.io/raw/main/src/assets-theme/music-evgeny-bardyuzha-small-discoveries.mp3"
          />

          <div className="post">
            <div className="post-panel">
              <div className="post-overlay"></div>
              <div className="post-title-banner"></div>
              <div className="post-title">
                <p>{title || 'No title given'}</p>
              </div>
              <div className="separator-glow"></div>
              <div className="post-date">
                <p>{date || 'No date given'}</p>
              </div>
              <div className="post-body">
                <ReactMarkdown escapeHtml={false}>
                  {content || 'No content given'}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          <Footer />
        </div>

        <div className="bg-beige">
          <div className="bg-beige-tiles">
            <center>
              <div className="gear-beige-1 gear-1-spin"></div>
              <div className="gear-beige-2 gear-2-spin"></div>
            </center>
          </div>
        </div>
      </div>
    );
  }
}

export default Post;
