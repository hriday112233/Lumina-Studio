import React, { useEffect, useState } from "react";
import { Play, Sparkles, Heart } from "lucide-react";
import { motion } from "motion/react";

export const Showcase: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public-projects")
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch public projects:", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <section className="py-24 bg-[#f5f5f4]" id="showcase">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-serif font-bold italic mb-12">Community Showcase</h2>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-[#f5f5f4]" id="showcase">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-serif font-bold italic tracking-tight">Community Showcase</h2>
          <p className="text-black/40 max-w-xl mx-auto">
            Discover incredible cinematic stories created by the Lumina community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, i) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="aspect-video bg-black relative">
                <video 
                  src={project.video_url} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  controls
                  preload="metadata"
                />
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-lg truncate">{project.title || "Untitled Creation"}</h3>
                  <p className="text-xs text-black/40 mt-1">
                    By {project.user_email.split('@')[0]} • {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                {project.description && (
                  <p className="text-sm text-black/60 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2 py-1 bg-black/5 rounded-md text-[10px] font-bold uppercase tracking-wider text-black/60">
                    {project.style}
                  </span>
                  {project.face_enhancement === 1 && (
                    <span className="px-2 py-1 bg-indigo-50 rounded-md text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Enhanced
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
