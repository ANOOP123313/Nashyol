import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cmsAPI, uploadAPI } from "../services/api";
import HomePageSectionManager from "../components/HomePageSectionManager";

const TABS = ["Pages", "Banners", "Home Page", "Blog", "FAQ"];

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState("Pages");
  const [pageSearch, setPageSearch] = useState("");
  const [viewPage, setViewPage] = useState(null);
  const [editPage, setEditPage] = useState(null);
  const [createPage, setCreatePage] = useState(false);
  const [newPageData, setNewPageData] = useState({ title: "", slug: "", content: "", status: "Published" });
  
  const [pagesList, setPagesList] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [faqData, setFaqData] = useState([]);

  const [newPostData, setNewPostData] = useState({ title: "", excerpt: "", content: "", category: "Technology", status: "Published" });
  const [newFaqData, setNewFaqData] = useState({ question: "", answer: "", category: "Orders", status: "Active" });

  const [editBanner, setEditBanner] = useState(null);
  const [createBanner, setCreateBanner] = useState(false);
  const [banners, setBanners] = useState([]);
  const [bannerLoading, setBannerLoading] = useState(false);

  const fetchCMSData = async () => {
    try {
      const [pRes, bRes, fRes] = await Promise.allSettled([
        cmsAPI.getPages(),
        cmsAPI.getBlogs(),
        cmsAPI.getFaqs(),
      ]);
      if (pRes.status === "fulfilled" && Array.isArray(pRes.value)) {
        setPagesList(pRes.value.map(p => ({
          ...p,
          author: "Admin",
          modified: new Date(p.updatedAt || Date.now()).toLocaleDateString(),
        })));
      }
      if (bRes.status === "fulfilled" && Array.isArray(bRes.value)) {
        setBlogPosts(bRes.value.map(b => ({
          ...b,
          excerpt: b.content ? b.content.slice(0, 100) + "..." : "",
          date: new Date(b.createdAt || Date.now()).toLocaleDateString(),
          views: 0,
        })));
      }
      if (fRes.status === "fulfilled" && Array.isArray(fRes.value)) {
        setFaqData(fRes.value);
      }
    } catch (err) {
      console.error("CMS data fetch error:", err);
    }
  };

  const fetchBanners = async () => {
    setBannerLoading(true);
    try {
      const res = await cmsAPI.getBanners();
      const data = Array.isArray(res) ? res : res.banners || [];
      setBanners(data);
    } catch (err) {
      console.error("CMS banners fetch error:", err);
    } finally {
      setBannerLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchCMSData();
  }, []);

  const handleCreatePageSubmit = async () => {
    if (!newPageData.title) {
      toast.error("Title is required");
      return;
    }
    try {
      await cmsAPI.createPage(newPageData);
      toast.success("Page created successfully");
      setCreatePage(false);
      setNewPageData({ title: "", slug: "", content: "", status: "Published" });
      fetchCMSData();
    } catch (err) {
      toast.error("Failed to create page: " + err.message);
    }
  };

  const handleUpdatePageSubmit = async () => {
    if (!editPage) return;
    try {
      await cmsAPI.updatePage(editPage._id, editPage);
      toast.success("Page updated successfully");
      setEditPage(null);
      fetchCMSData();
    } catch (err) {
      toast.error("Failed to update page: " + err.message);
    }
  };

  const handleDeletePage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this page?")) return;
    try {
      await cmsAPI.deletePage(id);
      toast.success("Page deleted");
      fetchCMSData();
    } catch (err) {
      toast.error("Failed to delete page: " + err.message);
    }
  };

  const handleCreateBlogSubmit = async () => {
    if (!newPostData.title || !newPostData.content) {
      toast.error("Title and content are required");
      return;
    }
    try {
      await cmsAPI.createBlog(newPostData);
      toast.success("Blog post created successfully");
      setCreatePost(false);
      setNewPostData({ title: "", excerpt: "", content: "", category: "Technology", status: "Published" });
      fetchCMSData();
    } catch (err) {
      toast.error("Failed to create blog post: " + err.message);
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await cmsAPI.deleteBlog(id);
      toast.success("Blog post deleted");
      fetchCMSData();
    } catch (err) {
      toast.error("Failed to delete blog post: " + err.message);
    }
  };

  const handleCreateFaqSubmit = async () => {
    if (!newFaqData.question || !newFaqData.answer) {
      toast.error("Question and answer are required");
      return;
    }
    try {
      await cmsAPI.createFaq(newFaqData);
      toast.success("FAQ created successfully");
      setAddFaq(false);
      setNewFaqData({ question: "", answer: "", category: "Orders", status: "Active" });
      fetchCMSData();
    } catch (err) {
      toast.error("Failed to create FAQ: " + err.message);
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await cmsAPI.deleteFaq(id);
      toast.success("FAQ deleted");
      fetchCMSData();
    } catch (err) {
      toast.error("Failed to delete FAQ: " + err.message);
    }
  };

  const toggleBannerStatus = async (banner) => {
    try {
      await cmsAPI.updateBanner(banner._id, { isActive: !banner.isActive });
      toast.success("Banner status updated");
      fetchBanners();
    } catch (err) {
      toast.error("Failed to toggle banner status: " + err.message);
    }
  };

  const deleteBanner = async (bannerId) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      await cmsAPI.deleteBanner(bannerId);
      toast.success("Banner deleted");
      fetchBanners();
    } catch (err) {
      toast.error("Failed to delete banner: " + err.message);
    }
  };
  const [createPost, setCreatePost] = useState(false);
  const [viewPost, setViewPost] = useState(null);
  const [addFaq, setAddFaq] = useState(false);
  const [viewFaq, setViewFaq] = useState(null);

  const filteredPages = pagesList.filter(p =>
    p.title.toLowerCase().includes(pageSearch.toLowerCase()) ||
    (p.slug && p.slug.toLowerCase().includes(pageSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-6 sm:py-6 font-sans">

      {/* Create Page Modal */}
      {createPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 sm:p-8 relative" style={{ maxHeight: "95vh", overflowY: "auto" }}>
            <button onClick={() => setCreatePage(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Create New Page</h2>
            <p className="text-sm text-gray-400 mb-5">Add a new static page to your website</p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Page Title <span className="text-red-400">*</span></label>
              <input value={newPageData.title} onChange={e => setNewPageData({ ...newPageData, title: e.target.value })} placeholder="Enter page title" className="w-full border-2 border-orange-400 rounded-lg px-4 py-2.5 text-base text-gray-800 bg-white focus:outline-none placeholder-gray-300" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug <span className="text-red-400">*</span></label>
              <input value={newPageData.slug} onChange={e => setNewPageData({ ...newPageData, slug: e.target.value })} placeholder="page-slug" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder-gray-300" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content <span className="text-red-400">*</span></label>
              <textarea value={newPageData.content} onChange={e => setNewPageData({ ...newPageData, content: e.target.value })} placeholder="Page content..." rows={4} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none placeholder-gray-300" />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
              <div className="relative">
                <select value={newPageData.status} onChange={e => setNewPageData({ ...newPageData, status: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white focus:outline-none appearance-none">
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setCreatePage(false)} className="px-6 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900">Cancel</button>
              <button onClick={handleCreatePageSubmit} className="px-6 py-2.5 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors">Create Page</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 sm:p-8 relative" style={{ maxHeight: "95vh", overflowY: "auto" }}>
            <button onClick={() => setViewPage(null)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">View Page</h2>
            <p className="text-sm text-gray-400 mb-5">View the details of the selected page</p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Page Title</label>
              <input readOnly value={viewPage.title} className="w-full border-2 border-orange-400 rounded-lg px-4 py-2.5 text-base text-gray-800 bg-white focus:outline-none" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug</label>
              <input readOnly value={viewPage.slug} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white focus:outline-none" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content</label>
              <textarea readOnly value={viewPage.content} rows={4} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white focus:outline-none resize-none" />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
              <StatusDropdown status={viewPage.status} />
            </div>
            <div className="flex justify-end">
              <button onClick={() => setViewPage(null)} className="px-6 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 sm:p-8 relative" style={{ maxHeight: "95vh", overflowY: "auto" }}>
            <button onClick={() => setEditPage(null)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Edit Page</h2>
            <p className="text-sm text-gray-400 mb-5">Edit the details of the selected page</p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Page Title</label>
              <input value={editPage.title} onChange={e => setEditPage({ ...editPage, title: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug</label>
              <input value={editPage.slug} onChange={e => setEditPage({ ...editPage, slug: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content</label>
              <textarea value={editPage.content} onChange={e => setEditPage({ ...editPage, content: e.target.value })} rows={4} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
              <div className="relative">
                <select value={editPage.status} onChange={e => setEditPage({ ...editPage, status: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white focus:outline-none appearance-none">
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditPage(null)} className="px-6 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900">Cancel</button>
              <button onClick={handleUpdatePageSubmit} className="px-6 py-2.5 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors">Update Page</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Content Management</h1>
          <p className="text-sm sm:text-base text-gray-400 mt-1">Manage website content</p>
        </div>
        {activeTab === "Pages" && (
          <button onClick={() => setCreatePage(true)} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors self-start sm:self-auto">
            <span className="text-base font-bold">+</span>
            <span>Add Page</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto mb-6">
        <div className="inline-flex items-center bg-white border border-gray-200 rounded-full p-1 gap-1 min-w-max">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-5 py-2 text-sm rounded-full transition-colors ${activeTab === tab ? "text-gray-900 font-bold" : "text-gray-500 hover:text-gray-700 font-normal"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Pages Tab */}
      {activeTab === "Pages" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-5">
            <h2 className="text-xl font-semibold text-gray-800">Static Pages</h2>
            <div className="relative w-full sm:w-56">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search pages..."
                value={pageSearch}
                onChange={e => setPageSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: "750px" }}>
              <thead>
                <tr className="border-t border-b border-gray-100">
                  <th className="text-left px-4 py-4 text-sm font-medium text-gray-400">Page Title</th>
                  <th className="text-left px-4 py-4 text-sm font-medium text-gray-400">Slug</th>
                  <th className="text-left px-4 py-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left px-4 py-4 text-sm font-medium text-gray-400">Author</th>
                  <th className="text-left px-4 py-4 text-sm font-medium text-gray-400">Last Modified</th>
                  <th className="text-left px-4 py-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((page, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-orange-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-base font-semibold text-gray-800">
                        <PageIcon />
                        {page.title}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-base text-gray-500 whitespace-nowrap">{page.slug}</td>
                    <td className="px-4 py-4 whitespace-nowrap"><StatusBadge status={page.status} /></td>
                    <td className="px-4 py-4 text-base text-gray-700 whitespace-nowrap">{page.author}</td>
                    <td className="px-4 py-4 text-base text-gray-500 whitespace-nowrap">{page.modified}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ActionBtn icon={<EyeIcon />} label="View" onClick={() => setViewPage(page)} />
                        <ActionBtn icon={<EditIcon />} label="Edit" onClick={() => setEditPage(page)} />
                        <button onClick={() => handleDeletePage(page._id)} className="flex items-center border border-gray-200 hover:border-red-300 bg-white text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg">
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPages.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-base">No pages found</p>
            </div>
          )}
        </div>
      )}

      {/* Create Post Modal */}
      {createPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 sm:p-8 relative" style={{ maxHeight: "95vh", overflowY: "auto" }}>
            <button onClick={() => setCreatePost(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Create New Blog Post</h2>
            <p className="text-sm text-gray-400 mb-5">Write and publish a new blog post</p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Post Title <span className="text-red-400">*</span></label>
              <input value={newPostData.title} onChange={e => setNewPostData({ ...newPostData, title: e.target.value })} placeholder="Enter post title" className="w-full border-2 border-orange-400 rounded-lg px-4 py-2.5 text-base text-gray-800 bg-white focus:outline-none placeholder-gray-300" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Excerpt <span className="text-red-400">*</span></label>
              <textarea value={newPostData.excerpt} onChange={e => setNewPostData({ ...newPostData, excerpt: e.target.value })} placeholder="Short description..." rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none placeholder-gray-300" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content <span className="text-red-400">*</span></label>
              <textarea value={newPostData.content} onChange={e => setNewPostData({ ...newPostData, content: e.target.value })} placeholder="Post content..." rows={4} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none placeholder-gray-300" />
            </div>

            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                <div className="relative">
                  <select value={newPostData.category} onChange={e => setNewPostData({ ...newPostData, category: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white focus:outline-none appearance-none">
                    <option value="Technology">Technology</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Health">Health</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                <div className="relative">
                  <select value={newPostData.status} onChange={e => setNewPostData({ ...newPostData, status: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white focus:outline-none appearance-none">
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setCreatePost(false)} className="px-6 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900">Cancel</button>
              <button onClick={handleCreateBlogSubmit} className="px-6 py-2.5 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors">Create Post</button>
            </div>
          </div>
        </div>
      )}

      {/* View Post Modal */}
      {viewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 sm:p-8 relative" style={{ maxHeight: "95vh", overflowY: "auto" }}>
            <button onClick={() => setViewPost(null)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">View Blog Post</h2>
            <p className="text-sm text-gray-400 mb-5">View the details of the selected blog post</p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Post Title</label>
              <input readOnly value={viewPost.title} className="w-full border-2 border-orange-400 rounded-lg px-4 py-2.5 text-base text-gray-800 bg-white focus:outline-none" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Excerpt</label>
              <textarea readOnly value={viewPost.excerpt} rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white focus:outline-none resize-none" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content</label>
              <textarea readOnly value={viewPost.content} rows={4} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white focus:outline-none resize-none" />
            </div>

            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                <div className="relative">
                  <select defaultValue={viewPost.category} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white focus:outline-none appearance-none">
                    <option>Technology</option>
                    <option>Fashion</option>
                    <option>Lifestyle</option>
                    <option>Health</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                <div className="relative">
                  <select defaultValue={viewPost.status === "published" ? "Published" : "Draft"} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white focus:outline-none appearance-none">
                    <option>Draft</option>
                    <option>Published</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setViewPost(null)} className="px-6 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Banner Modal */}
      {createBanner && (
        <CreateBannerModal
          onClose={() => setCreateBanner(false)}
          onSuccess={() => { setCreateBanner(false); fetchBanners(); }}
        />
      )}

      {/* Edit Banner Modal */}
      {editBanner && (
        <EditBannerModal
          banner={editBanner}
          onClose={() => setEditBanner(null)}
          onSuccess={() => { setEditBanner(null); fetchBanners(); }}
        />
      )}

      {/* Banners Tab */}
      {activeTab === "Banners" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Promotional Banners</h2>
            <button onClick={() => setCreateBanner(true)} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors self-start sm:self-auto">
              <span className="text-base font-bold">+</span>
              <span>Add Banner</span>
            </button>
          </div>
          {bannerLoading ? (
            <div className="py-12 text-center text-gray-400">Loading banners...</div>
          ) : banners.length === 0 ? (
            <div className="py-12 text-center text-gray-400">No banners created yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {banners.map((banner, i) => (
                <BannerCard
                  key={banner._id || i}
                  banner={banner}
                  onEdit={() => setEditBanner(banner)}
                  onToggle={() => toggleBannerStatus(banner)}
                  onDelete={() => deleteBanner(banner._id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Home Page Tab */}
      {activeTab === "Home Page" && (
        <HomePageSectionManager />
      )}

      {/* Blog Tab */}
      {activeTab === "Blog" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Blog Posts</h2>
            <button onClick={() => setCreatePost(true)} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors self-start sm:self-auto">
              <span className="text-base font-bold">+</span>
              <span>New Post</span>
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {blogPosts.map((post, i) => (
              <div key={i} className="py-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-base font-bold text-gray-900">{post.title}</h3>
                    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${post.status === "published" ? "bg-green-500 text-white" : "bg-orange-400 text-white"}`}>
                      {post.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{post.excerpt}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                    <span>By {post.author}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {post.date}
                    </span>
                    <span>•</span>
                    <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">{post.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {post.views} views
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <ActionBtn icon={<EditIcon />} label="Edit" onClick={() => setViewPost(post)} />
                  <button className="flex items-center border border-gray-200 hover:border-red-300 bg-white text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View FAQ Modal */}
      {viewFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 sm:p-8 relative" style={{ maxHeight: "95vh", overflowY: "auto" }}>
            <button onClick={() => setViewFaq(null)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">View FAQ</h2>
            <p className="text-sm text-gray-400 mb-5">View the details of the selected FAQ</p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Question</label>
              <input readOnly value={viewFaq.question} className="w-full border-2 border-orange-400 rounded-lg px-4 py-2.5 text-base text-gray-800 bg-white focus:outline-none" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Answer</label>
              <textarea readOnly value={viewFaq.answer} rows={4} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white focus:outline-none resize-none" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
              <div className="relative">
                <select defaultValue={viewFaq.category} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white focus:outline-none appearance-none">
                  <option>Orders</option>
                  <option>Returns</option>
                  <option>Shipping</option>
                  <option>Support</option>
                  <option>Payments</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="text-base font-semibold text-gray-700">Active</label>
              <div className="relative w-12 h-6 rounded-full bg-orange-500 cursor-pointer">
                <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow" />
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setViewFaq(null)} className="px-6 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add FAQ Modal */}
      {addFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 sm:p-8 relative" style={{ maxHeight: "95vh", overflowY: "auto" }}>
            <button onClick={() => setAddFaq(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Add New FAQ</h2>
            <p className="text-sm text-gray-400 mb-5">Create a frequently asked question</p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Question <span className="text-red-400">*</span></label>
              <input value={newFaqData.question} onChange={e => setNewFaqData({ ...newFaqData, question: e.target.value })} placeholder="Enter question" className="w-full border-2 border-orange-400 rounded-lg px-4 py-2.5 text-base text-gray-800 bg-white focus:outline-none placeholder-gray-300" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Answer <span className="text-red-400">*</span></label>
              <textarea value={newFaqData.answer} onChange={e => setNewFaqData({ ...newFaqData, answer: e.target.value })} placeholder="Enter answer..." rows={4} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none placeholder-gray-300" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
              <div className="relative">
                <select value={newFaqData.category} onChange={e => setNewFaqData({ ...newFaqData, category: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white focus:outline-none appearance-none">
                  <option value="Orders">Orders</option>
                  <option value="Returns">Returns</option>
                  <option value="Shipping">Shipping</option>
                  <option value="Support">Support</option>
                  <option value="Payments">Payments</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="text-base font-semibold text-gray-700">Active</label>
              <div className="relative w-12 h-6 rounded-full bg-orange-500 cursor-pointer">
                <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow" />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setAddFaq(false)} className="px-6 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900">Cancel</button>
              <button onClick={handleCreateFaqSubmit} className="px-6 py-2.5 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors">Add FAQ</button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === "FAQ" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Frequently Asked Questions</h2>
            <button onClick={() => setAddFaq(true)} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors self-start sm:self-auto">
              <span className="text-base font-bold">+</span>
              <span>Add FAQ</span>
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {faqData.map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center mt-0.5">
                  <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900">{faq.question}</h3>
                        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-md">{faq.category}</span>
                        <span className="bg-green-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">Active</span>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => setViewFaq(faq)} className="flex items-center border border-gray-200 hover:border-orange-300 bg-white text-gray-500 hover:text-orange-600 transition-colors p-1.5 rounded-lg">
                        <EditIcon />
                      </button>
                      <button className="flex items-center border border-gray-200 hover:border-red-300 bg-white text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg">
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

function StatusDropdown({ status }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(status === "published" ? "Published" : "Draft");
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-700 bg-white flex items-center justify-between hover:border-gray-300 transition-colors"
      >
        <span>{selected}</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
          {["Draft", "Published"].map(option => (
            <button
              key={option}
              onClick={() => { setSelected(option); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 text-base transition-colors ${selected === option ? "bg-orange-50 text-orange-500 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
            >
              <span>{option}</span>
              {selected === option && (
                <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  return status === "published" ? (
    <span className="inline-flex items-center gap-2 bg-green-500 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.5" />
        <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      published
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 bg-orange-400 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.5" />
        <path d="M8 4.5V8l2.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      draft
    </span>
  );
}

function ActionBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-orange-600 border border-gray-200 hover:border-orange-300 bg-white px-3 py-1.5 rounded-lg transition-colors font-medium">
      {icon}
      <span>{label}</span>
    </button>
  );
}

function CreateBannerModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAPI.uploadImage(file);
      if (res?.url) setImage(res.url);
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload image: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !image) {
      toast.error("Please provide a title and image");
      return;
    }
    setLoading(true);
    try {
      await cmsAPI.createBanner({ title, link: link || "/", image, isActive });
      toast.success("Banner created successfully");
      onSuccess();
    } catch (err) {
      toast.error("Failed to create banner: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 sm:p-8 relative" style={{ maxHeight: "95vh", overflowY: "auto" }}>
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
        <h2 className="text-3xl font-bold text-gray-900 mb-1">Create New Banner</h2>
        <p className="text-sm text-gray-400 mb-5">Add a promotional banner to your website</p>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Banner Title <span className="text-red-400">*</span></label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter banner title"
            className="w-full border-2 border-orange-400 rounded-lg px-4 py-2.5 text-base text-gray-800 bg-white focus:outline-none placeholder-gray-300" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Banner Image <span className="text-red-400">*</span></label>
          <label className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white flex items-center gap-2 cursor-pointer hover:border-gray-300">
            <span>{uploading ? "Uploading..." : "Choose Image File"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
          </label>
          {image && (
            <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Link URL</label>
          <input value={link} onChange={e => setLink(e.target.value)} placeholder="/products"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder-gray-300" />
        </div>

        <div className="flex items-center justify-between mb-6">
          <label className="text-base font-semibold text-gray-700">Active</label>
          <button
            onClick={() => setIsActive(!isActive)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isActive ? "bg-orange-500" : "bg-gray-200"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900">Cancel</button>
          <button onClick={handleSubmit} disabled={loading || uploading} className="px-6 py-2.5 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors disabled:opacity-50">
            {loading ? "Creating..." : "Create Banner"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditBannerModal({ banner, onClose, onSuccess }) {
  const [title, setTitle] = useState(banner.title || "");
  const [link, setLink] = useState(banner.link || "");
  const [image, setImage] = useState(banner.image || "");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(banner.isActive !== false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAPI.uploadImage(file);
      if (res?.url) setImage(res.url);
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload image: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await cmsAPI.updateBanner(banner._id, { title, link, image, isActive });
      toast.success("Banner updated successfully");
      onSuccess();
    } catch (err) {
      toast.error("Failed to update banner: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 sm:p-8 relative" style={{ maxHeight: "95vh", overflowY: "auto" }}>
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
        <h2 className="text-3xl font-bold text-gray-900 mb-1">Edit Banner</h2>
        <p className="text-sm text-gray-400 mb-5">Update banner details</p>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Banner Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            className="w-full border-2 border-orange-400 rounded-lg px-4 py-2.5 text-base text-gray-800 bg-white focus:outline-none" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Banner Image</label>
          <label className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white flex items-center gap-2 cursor-pointer hover:border-gray-300">
            <span>{uploading ? "Uploading..." : "Change Image File"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
          </label>
          {image && (
            <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Link URL</label>
          <input value={link} onChange={e => setLink(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300" />
        </div>

        <div className="flex items-center justify-between mb-6">
          <label className="text-base font-semibold text-gray-700">Active</label>
          <button
            onClick={() => setIsActive(!isActive)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isActive ? "bg-orange-500" : "bg-gray-200"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900">Cancel</button>
          <button onClick={handleSubmit} disabled={loading || uploading} className="px-6 py-2.5 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors disabled:opacity-50">
            {loading ? "Updating..." : "Update Banner"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BannerCard({ banner, onEdit, onToggle, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const active = banner.isActive !== false && banner.status !== "inactive";
  return (
    <div className="border border-gray-200 rounded-xl overflow-visible relative">
      <div className="relative bg-gray-100 h-44 flex items-center justify-center rounded-t-xl overflow-hidden">
        {banner.image ? (
          <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-14 h-14 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
        <span className={`absolute top-3 right-3 text-white text-xs font-semibold px-3 py-1 rounded-full ${active ? "bg-green-500" : "bg-red-400"}`}>
          {active ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2 relative">
          <h3 className="text-base font-bold text-gray-900">{banner.title}</h3>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-400 hover:text-gray-600 p-1">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                <button onClick={() => { setMenuOpen(false); onEdit(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  Edit
                </button>
                <button onClick={() => { setMenuOpen(false); onToggle(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  {active ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => { setMenuOpen(false); onDelete(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1.5">
          <span className="font-mono">{banner.link || "/"}</span>
        </div>
      </div>
    </div>
  );
}

function PageIcon() {
  return (
    <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}