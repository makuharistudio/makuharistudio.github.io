import React from 'react';
import { Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import '../App.css';
import Header from './Header';
import Footer from './Footer';
import postList from '../data/posts.json';
import { Link } from 'react-router-dom';
import { assetURL } from '../data/data';

export default function Post(props) {
    const validId = parseInt(props.match.params.id)
    if (!validId) {
        return <Navigate to='/404' />
    }
    const fetchedPost = {}
    let postExists = false
    postList.forEach((post, i) => {
        if (validId === post.id) {
            fetchedPost.id = post.id ? post.id : 'No ID given'
            fetchedPost.title = post.title ? post.title : 'No title given'
            fetchedPost.tech = post.tech ? post.tech : 'No tech given'
            fetchedPost.tag = post.tag ? post.tag : 'No tag given'
            fetchedPost.date = post.date ? post.date : 'No date given'
            fetchedPost.content = post.content ? post.content : 'No content given'
            postExists = true
        }
    })
    if (postExists === false) {
        return <Navigate to='/404' />
    }
    return (
        <>

            <Header />

            <div className='post'>
                <center>            
                    <div className='post-body'>                        
                        
                        <div className='blog-tile-header'>
                            <div className='blog-title-header-rectangle'>
                                <span className='blogstamp-overlay'>
                                    <img src= {`${ assetURL }${fetchedPost.tag}.svg`} alt='' loading='lazy'/>
                                </span>
                                <Link to={`/post/${fetchedPost.id}`}>{fetchedPost.tech}</Link>
                            </div>

                            <div className='blog-title-header-triangle-dashes'>
                                <div className='blog-title-header-triangle' />
                                <div className='blog-title-header-dash gradient-grey-dark' />
                                <div className='blog-title-header-dash gradient-grey-medium' />
                                <div className='blog-title-header-dash gradient-grey-light' />
                            </div>
                        </div>

                        <div className='post-body-date'>
                            <p>{fetchedPost.date}</p>
                        </div>
                        <div className='post-body-content'>
                            <h1>{fetchedPost.title}</h1>
                            <ReactMarkdown escapeHtml={false}>{fetchedPost.content}</ReactMarkdown>
                        </div>
                    </div>
                </center>
            </div>
            <Footer />

        </>
    )
}