import React from 'react';
import Separator from './Separator';
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
            <Separator />
            <label className='section-title'>RECENT BLOG POSTS</label>


            <div className='blog-set-preview'>
                    {
                        PostsPreview.length &&
                            PostsPreview.map((post, i) => {
                                return (
                                    <div key={i} className='blog-tile-preview'>
                                        <div className='blog-tile-header-preview'>
                                            <div className='blog-icon-title-preview'>
                                                <span className='blogstamp-overlay'>
                                                    <img src= {`${ assetURL }${post.tag}.svg`} alt='' loading='lazy'/>
                                                </span>
                                                <Link to={`/post/${post.id}`}>{post.title}</Link>
                                            </div>
                                            <div className='blog-meta-preview'>
                                                <small>{post.date}</small>
                                            </div>
                                        </div>
                                        <ReactMarkdown className='blog-desc-preview' escapeHtml={false}>{excerptList[i]}</ReactMarkdown>
                                        <div className='blog-meta-preview'>
                                            <small>
                                                <Link to={`/post/${post.id}`}>Read more...</Link>
                                            </small>
                                        </div>
                                    </div>
                                )
                            })
                    }
                    </div>

            <Link to='/blog'>
                <h3>Click here to see all { countAllPosts } blog posts</h3>
            </Link>
        </div>
    );
}