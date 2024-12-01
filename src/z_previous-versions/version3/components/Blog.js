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
                        <div className='section-title'>
                            <div className='section-title-glow' />
                            <div className='section-title-text'>MY BLOG POSTS</div>
                        </div>
                    </div>

                    <div className='blog-set'>
                    {
                        Posts.length &&
                            Posts.map((post, i) => {
                                return (
                                    <div key={i} className='blog-tile'>
                                        <div className='blog-tile-header'>

                                            <div className='blog-title-header-rectangle'>
                                                <span className='blogstamp-overlay'>
                                                    <img src= {`${ assetURL }${post.tag}.svg`} alt='' loading='lazy'/>
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

                                        <div className='blog-meta-date'>
                                            <p>{post.date}</p>
                                        </div>

                                        <div className='blog-title-text'>
                                                <Link to={`/post/${post.id}`}>{post.title}</Link>
                                        </div>
                                        <ReactMarkdown className='blog-desc' >{excerptList[i]}</ReactMarkdown>
                                        <div className='blog-meta-footer'>
                                            <small>
                                                <Link to={`/post/${post.id}`}>Read more...</Link>
                                            </small>
                                        </div>
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