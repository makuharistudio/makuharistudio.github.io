import React from 'react';
import '../App.css';
import { Link } from 'react-router-dom';
import { assetURL } from '../data/data';
import Posts from '../data/posts.json';
import ReactMarkdown from 'react-markdown';

export default function BlogPreview() {

    const PostsPreview = Posts.slice(0,3);

    const countAllPosts = Posts.length;

    const excerptList = PostsPreview.map(post => {
        return post.content.split(" ").slice(0, 30).join(" ") + ' . . . '
    })

    return (
        <div className='blog-preview' id='blog'>

            <div className='section-title'>
                <div className='section-title-glow' />
                <div className='section-title-text'>MY RECENT BLOG POSTS</div>
            </div>


            <div className='blog-set-preview'>
                    {
                        PostsPreview.length &&
                            PostsPreview.map((post, i) => {
                                return (
                                    <div key={i} className='blog-tile-preview'>

                                        <div className='blog-tile-header'>

                                            <div className='blog-title-header-rectangle'>
                                                <span className='blogstamp-overlay'>
                                                    <img src= {`${ assetURL }${post.tag}.svg`} alt=''loading='lazy'/>
                                                </span>
                                                <Link to={`/post/${post.id}`}>{post.tech}</Link>
                                            </div>

                                            <div className='blog-title-header-triangle-dashes'>
                                                <div className='blog-title-header-triangle' />
                                                <div className='blog-title-header-dash gradient-grey-dark' />
                                                <div className='blog-title-header-dash gradient-grey-medium' />
                                                <div className='blog-title-header-dash gradient-grey-light' />
                                            </div>

                                        </div>


                                        <div className='blog-tile-body-preview'>
                                            <div className='blog-meta-preview'>
                                                {post.date}
                                            </div>
                                            <div className='blog-icon-title-preview'>
                                                <Link to={`/post/${post.id}`}>{post.title}</Link>
                                            </div>

                                            <ReactMarkdown className='blog-desc-preview' escapeHtml={false}>{excerptList[i]}</ReactMarkdown>
                                            <div className='blog-meta-preview'>
                                                <small>
                                                    <Link to={`/post/${post.id}`}>Read more...</Link>
                                                </small>
                                            </div>
                                        </div>

                                    </div>
                                )
                            })
                    }
            </div>


            <Link to='/blog'>
                <div className='section-button'>
                    <p>CLICK HERE FOR ALL { countAllPosts } BLOG POSTS</p>
                </div>
            </Link>

        </div>
    );
}