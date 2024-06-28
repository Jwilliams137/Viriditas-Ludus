import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore'; // Ensure deleteDoc is imported
import { db } from '../../firebase';
import Post from '../Posts/Post';
import styles from './Timeline.module.css';

const Timeline = () => {
  const [posts, setPosts] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      let q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
  
      if (lastVisible) {
        q = query(q, startAfter(lastVisible));
      }
  
      const snapshot = await getDocs(q);
      const newPosts = await Promise.all(snapshot.docs.map(async docSnapshot => {
        const postData = docSnapshot.data();
        console.log('Fetched post data:', postData);
  
        // Check if the post is approved
        if (!postData.approved) {
          console.log('Post is not approved:', docSnapshot.id);
          return null;
        }
  
        const userDoc = await getDoc(doc(db, 'users', postData.authorId));
        const userProfile = userDoc.data();
        return {
          id: docSnapshot.id,
          ...postData,
          authorProfilePicture: userProfile?.profilePicture
        };
      }));
  
      const filteredPosts = newPosts.filter(post => post !== null);
  
      if (filteredPosts.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setPosts(prevPosts => {
          const filteredPostsUnique = filteredPosts.filter(newPost => !prevPosts.some(prevPost => prevPost.id === newPost.id));
          return [...prevPosts, ...filteredPostsUnique];
        });
      } else {
        setLastVisible(null);
      }
    } catch (error) {
      console.error('Error fetching posts: ', error);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  
  

  const loadMore = () => {
    fetchPosts();
  };

  const handlePostUpdated = (postId, newTitle, newContent, newImageUrl) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, title: newTitle, content: newContent, imageUrl: newImageUrl } : post
      )
    );
  };

  const handleDeletePost = async postId => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post: ', error);
      // Handle error state
    }
  };

  return (
    <div className={styles.timeline}>
      {posts.map(post => (
        <Post
          key={post.id}
          post={post}
          onPostUpdated={handlePostUpdated}
          onDeletePost={handleDeletePost}
        />
      ))}
      {loading && <p>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && lastVisible && (
        <button onClick={loadMore} className={styles.loadMore}>
          Load More
        </button>
      )}
    </div>
  );
};

export default Timeline;
















