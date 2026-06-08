import BlogList from '../components/BlogList'
import posts from '../data/posts'

export default function Blog() {
    return (
      <>
        <center>
          <h1>BLOG POSTS</h1>
        </center>
        <BlogList posts={posts} />
      </>
    );
}