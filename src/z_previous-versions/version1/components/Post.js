import React from 'react'
import { Navigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import '../App.css'
import Banner from './Banner'
import Footer from './Footer'
import postList from '../data/posts.json'

export default function Post(props) {
    const validId = parseInt(props.match.params.id)
    if (!validId) {
        return <Navigate to='/404' />
    }
    const fetchedPost = {}
    let postExists = false
    postList.forEach((post, i) => {
        if (validId === post.id) {
            fetchedPost.title = post.title ? post.title : 'No title given'
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
            <Banner />
            <div className = 'post'>
                <center>
                    <div className='post-body'>
                        <h4>{fetchedPost.date}</h4>
                        <h1>{fetchedPost.title}</h1>
                        <ReactMarkdown escapeHtml={false}>{fetchedPost.content}</ReactMarkdown>
                    </div>
                </center>
            </div>
            <Footer />
        </>
    )
}