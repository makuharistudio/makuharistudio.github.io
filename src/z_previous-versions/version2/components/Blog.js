import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import '../App.css';
import Header from './Header';
import { assetURL } from '../data/data';
import Posts from '../data/posts.json';
import Footer from './Footer';

export default function Blog() {
    const excerptList = Posts.map(post => {
        return post.content.split(" ").slice(0, 30).join(" ") + ' . . . '
    })

    console.log(Posts)
    return (
        <>
        
            <Header />

            <div className='blog'>
                <center>
                <div className='blog-header'>
                    <label className='section-title'>ALL BLOG POSTS</label>
                </div>
                    <div className='blog-set'>
                    {
                        Posts.length &&
                            Posts.map((post, i) => {
                                return (
                                    <div key={i} className='blog-tile'>
                                        <div className='blog-tile-header'>
                                            <span className='blogstamp-overlay'>
                                                <img src= {`${ assetURL }${post.tag}.svg`} alt='' loading='lazy'/>
                                            </span>
                                            <Link to={`/post/${post.id}`}>{post.title}</Link>
                                        </div>
                                        <div className='blog-meta'>
                                            <small>{post.date}</small>
                                        </div>
                                        <ReactMarkdown className='blog-desc' >{excerptList[i]}</ReactMarkdown>
                                        <div className='blog-meta'>
                                            <small>
                                                <Link to={`/post/${post.id}`}>Read more...</Link>
                                            </small>
                                        </div>
                                        <div className='blog-tile-footer'></div>
                                    </div>
                                )
                            })
                    }
                    </div>
                </center>
            </div>

            <Footer />

        </>
    )
}