import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BaseUrl } from "../BaseUrl";

export default function PostModerationDashboard() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);

  const [selectedPost, setSelectedPost] = useState(null);
  const [deletePostId, setDeletePostId] = useState(null);

  const limit = 20;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        `${BaseUrl.baseurl}/post/get-all-posts/${skip}`,
      );

      if (res.data.status) {
        setPosts((prev) => [...prev, ...res.data.details]);
        setSkip((prev) => prev + limit);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const deletePost = async () => {
    try {
      await axios.delete(`${BaseUrl.baseurl}/post/delete-post/${deletePostId}`);

      setPosts(posts.filter((p) => p._id !== deletePostId));

      setDeletePostId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6  min-h-screen text-white">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700"
        >
          Back
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Post</th>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Likes</th>
              <th className="p-3 text-left">Comments</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {posts.map((post) => {
              const user = post.userId;

              const image =
                post.images?.[0] || user?.photos?.find((p) => p.isProfile)?.url;

              return (
                <tr
                  key={post._id}
                  className="border-b border-slate-700 hover:bg-slate-800"
                >
                  <td className="p-3 flex items-center gap-3">
                    <img
                      referrerPolicy="no-referrer"
                      src={
                        user.photos[0]?.url?.startsWith("http")
                          ? user.photos[0]?.url
                          : `https://${user.photos[0]?.url}`
                      }
                      className="w-10 h-10 rounded-full object-cover"
                      alt=""
                    />

                    <div>
                      <div className="font-semibold">{user?.name}</div>

                      <div className="text-xs text-slate-400">
                        ID {user?.userId}
                      </div>
                    </div>
                  </td>

                  <td className="p-3 max-w-xs truncate">{post.description}</td>
                  <td>
                    <div className="flex gap-2">
                      {post.images.length !== 0
                        ? post.images.map((value, j) => (
                            <img
                              key={j}
                              src={value.image_url}
                              className="w-10 h-10  object-cover"
                              alt=""
                            />
                          ))
                        : "----"}
                    </div>
                  </td>

                  <td className="p-3">❤️ {post.likesCount}</td>

                  <td className="p-3">💬 {post.commentsCount}</td>

                  <td className="p-3">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="px-3 py-1 text-xs bg-blue-600 rounded hover:bg-blue-700"
                    >
                      View
                    </button>

                    <button
                      onClick={() => setDeletePostId(post._id)}
                      className="px-3 py-1 text-xs bg-red-600 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* LOAD MORE */}

      <div className="flex justify-center mt-6">
        <button
          onClick={fetchPosts}
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      </div>

      {/* POST DETAILS MODAL */}

      {selectedPost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-slate-900 p-6 rounded-xl w-[600px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Post Details</h2>

            <div className="space-y-3 text-sm">
              <p>
                <b>User:</b> {selectedPost.userId.name}
              </p>

              <p>
                <b>Email:</b> {selectedPost.userId.email}
              </p>

              <p>
                <b>Phone:</b> {selectedPost.userId.phone}
              </p>

              <p>
                <b>Description:</b> {selectedPost.description}
              </p>

              <p>
                <b>Likes:</b> {selectedPost.likesCount}
              </p>

              <p>
                <b>Comments:</b> {selectedPost.commentsCount}
              </p>

              <p>
                <b>City:</b> {selectedPost.userId.city}
              </p>

              <p>
                <b>Country:</b> {selectedPost.userId.country_name}
              </p>

              <p>
                <b>Followers:</b> {selectedPost.userId.followers.length}
              </p>

              <p>
                <b>Coins:</b> {selectedPost.userId.coins}
              </p>

              <p>
                <b>Earning Coins:</b> {selectedPost.userId.earningCoins}
              </p>

              <p>
                <b>Created:</b>{" "}
                {new Date(selectedPost.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>
            {selectedPost.images.length !== 0 && (
              <div>
                {selectedPost.images.map((val, i) => (
                  <img key={i} src={val.image_url} alt="" />
                ))}
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 bg-slate-700 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}

      {deletePostId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-slate-900 p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>

            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to delete this post?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletePostId(null)}
                className="px-4 py-2 bg-slate-700 rounded"
              >
                Cancel
              </button>

              <button
                onClick={deletePost}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
