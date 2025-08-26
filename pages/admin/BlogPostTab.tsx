
import React, { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { BlogPost } from '../../types';

interface BlogPostTabProps {
    posts: BlogPost[];
    setPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
}

const BlogPostTab: React.FC<BlogPostTabProps> = ({ posts, setPosts }) => {
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async (postToSave: BlogPost) => {
        setIsLoading(true);
        try {
            if (postToSave.id) {
                // Update existing post
                const { id, ...postData } = postToSave;
                const postRef = doc(db, "blogPosts", id);
                await updateDoc(postRef, postData);
                setPosts(posts.map(p => p.id === id ? postToSave : p));
            } else {
                // Create new post
                const newPostData = {
                    title: postToSave.title,
                    content: postToSave.content,
                    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                };
                const docRef = await addDoc(collection(db, "blogPosts"), newPostData);
                setPosts([...posts, { ...newPostData, id: docRef.id }]);
            }
        } catch (error) {
            console.error("Error saving post:", error);
            alert("Failed to save post. See console for details.");
        } finally {
            setIsLoading(false);
            setSelectedPost(null);
        }
    };
    
    const handleDelete = async (postId: string) => {
        if(window.confirm("Are you sure you want to delete this post from the database? This action cannot be undone.")) {
            setIsLoading(true);
            try {
                await deleteDoc(doc(db, "blogPosts", postId));
                setPosts(posts.filter(p => p.id !== postId));
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Failed to delete post. See console for details.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const startNewPost = () => {
        setSelectedPost({ id: '', title: '', date: '', content: '' });
    };

    if (selectedPost) {
        return <PostEditor post={selectedPost} onSave={handleSave} onCancel={() => setSelectedPost(null)} isLoading={isLoading} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white title-3d-light">Manage Blog Posts</h2>
                <button onClick={startNewPost} className="px-4 py-2 bg-brand-purple/80 text-white font-bold rounded-md hover:bg-brand-purple">New Post</button>
            </div>
            {isLoading && <p>Loading...</p>}
            <ul className="space-y-4">
                {posts.map(post => (
                    <li key={post.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-white">{post.title}</h3>
                            <p className="text-sm text-slate-400">{post.date}</p>
                        </div>
                        <div className="space-x-2">
                            <button onClick={() => setSelectedPost(post)} className="px-3 py-1 bg-brand-blue/80 text-white rounded-md text-sm hover:bg-brand-blue">Edit</button>
                            <button onClick={() => handleDelete(post.id)} className="px-3 py-1 bg-brand-red/80 text-white rounded-md text-sm hover:bg-brand-red">Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

interface PostEditorProps {
    post: BlogPost;
    onSave: (post: BlogPost) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const PostEditor: React.FC<PostEditorProps> = ({ post, onSave, onCancel, isLoading }) => {
    const [editedPost, setEditedPost] = useState(post);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editedPost);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 title-3d-light">{post.id ? 'Edit Post' : 'Create New Post'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-300">Title</label>
                    <input type="text" id="title" value={editedPost.title} onChange={e => setEditedPost({...editedPost, title: e.target.value})} className="mt-1 block w-full bg-slate-900/50 border border-slate-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-brand-purple" required />
                </div>
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-slate-300">Content</label>
                    <textarea id="content" rows={10} value={editedPost.content} onChange={e => setEditedPost({...editedPost, content: e.target.value})} className="mt-1 block w-full bg-slate-900/50 border border-slate-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-brand-purple" required />
                </div>
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-600/80 text-white font-bold rounded-md hover:bg-slate-600">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 bg-brand-purple/80 text-white font-bold rounded-md hover:bg-brand-purple disabled:opacity-50">
                        {isLoading ? 'Saving...' : 'Save Post'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BlogPostTab;
