
import React, { useState, useMemo, useEffect } from 'react';
import Title3D from '../components/Title3D.tsx';
import { BlogPost } from '../types';

interface BlogProps {
    posts: BlogPost[];
}

const Blog: React.FC<BlogProps> = ({ posts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const filteredPosts = useMemo(() => {
    if (!debouncedSearchTerm) {
      return posts;
    }
    const lowercasedTerm = debouncedSearchTerm.toLowerCase();
    return posts.filter(post =>
      post.title.toLowerCase().includes(lowercasedTerm) ||
      post.content.toLowerCase().includes(lowercasedTerm)
    );
  }, [posts, debouncedSearchTerm]);

  return (
    <div className="pt-24 pb-12 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4">
        <Title3D className="text-5xl tracking-tight mb-8">From the Studio</Title3D>

        <div className="mb-10">
          <input
            type="text"
            placeholder="Search articles by keyword..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-md py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
            aria-label="Search blog posts"
          />
        </div>
        
        <div className="space-y-8">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <article key={post.id} className="p-6 bg-slate-900/50 rounded-lg border border-slate-800 animate-fade-in">
                <h2 className="text-3xl font-bold text-white mb-2">{post.title}</h2>
                <p className="text-sm text-slate-400 mb-4">{post.date}</p>
                <p className="text-slate-300 mb-6">{post.content}</p>
                <a href="#" className="font-semibold text-brand-purple hover:text-brand-purple/80 transition-colors">
                  Read More &rarr;
                </a>
              </article>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-slate-400 text-lg">No posts found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blog;
