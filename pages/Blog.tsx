
import React from 'react';
import Title3D from '../components/Title3D.tsx';
import { BlogPost } from '../types';

interface BlogProps {
    posts: BlogPost[];
}

const Blog: React.FC<BlogProps> = ({ posts }) => {
  return (
    <div className="pt-24 pb-12 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4">
        <Title3D className="text-5xl tracking-tight mb-12">From the Studio</Title3D>
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.id} className="p-6 bg-slate-900/50 rounded-lg border border-slate-800">
              <h2 className="text-3xl font-bold text-white mb-2">{post.title}</h2>
              <p className="text-sm text-slate-400 mb-4">{post.date}</p>
              <p className="text-slate-300 mb-6">{post.content}</p>
              <a href="#" className="font-semibold text-brand-purple hover:text-brand-purple/80 transition-colors">
                Read More &rarr;
              </a>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
