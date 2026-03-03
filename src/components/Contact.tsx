import React from "react";
import { Mail, MessageSquare, Phone } from "lucide-react";

export const Contact: React.FC = () => {
  return (
    <section className="py-24 bg-white border-t border-black/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <h2 className="text-4xl font-sans font-bold tracking-tight mb-6">Get in touch.</h2>
            <p className="text-black/60 mb-12 leading-relaxed">
              Have questions about our AI technology or need help with your subscription? Our team is here to help you create your next masterpiece.
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-black/40">Email</p>
                  <p className="text-sm font-bold">support@lumina.studio</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-black/40">Live Chat</p>
                  <p className="text-sm font-bold">Available 24/7 for Elite users</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#f5f5f4] p-12 rounded-[32px]">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-black/5" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Email</label>
                  <input type="email" className="w-full px-4 py-3 rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-black/5" placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Message</label>
                <textarea className="w-full px-4 py-3 rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-black/5 min-h-[120px]" placeholder="How can we help?"></textarea>
              </div>
              <button className="w-full py-4 bg-black text-white rounded-xl font-bold hover:scale-[1.02] transition-transform">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
