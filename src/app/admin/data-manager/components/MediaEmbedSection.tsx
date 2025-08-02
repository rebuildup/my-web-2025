"use client";

import { MediaEmbed } from "@/types/content";
import { useState } from "react";

interface MediaEmbedSectionProps {
  videos: MediaEmbed[];
  onVideosChange: (videos: MediaEmbed[]) => void;
}

export function MediaEmbedSection({
  videos,
  onVideosChange,
}: MediaEmbedSectionProps) {
  const [newVideo, setNewVideo] = useState<MediaEmbed>({
    type: "youtube",
    url: "",
    title: "",
    description: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const addVideo = () => {
    if (!newVideo.url.trim()) {
      alert("URL is required");
      return;
    }

    const videoToAdd = {
      ...newVideo,
      url: newVideo.url.trim(),
      title: newVideo.title?.trim() || "",
      description: newVideo.description?.trim() || "",
    };

    console.log("Adding video:", videoToAdd);
    onVideosChange([...videos, videoToAdd]);

    // Reset form and close
    setNewVideo({
      type: "youtube",
      url: "",
      title: "",
      description: "",
    });
    setShowAddForm(false);
  };

  const cancelAdd = () => {
    setNewVideo({
      type: "youtube",
      url: "",
      title: "",
      description: "",
    });
    setShowAddForm(false);
  };

  const updateVideo = (
    index: number,
    field: keyof MediaEmbed,
    value: unknown,
  ) => {
    const updatedVideos = videos.map((video, i) =>
      i === index ? { ...video, [field]: value } : video,
    );
    onVideosChange(updatedVideos);
  };

  const removeVideo = (index: number) => {
    onVideosChange(videos.filter((_, i) => i !== index));
  };

  const extractVideoInfo = (url: string) => {
    // YouTube URL patterns
    const youtubeRegex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const youtubeMatch = url.match(youtubeRegex);

    if (youtubeMatch) {
      return {
        type: "youtube" as const,
        videoId: youtubeMatch[1],
        thumbnail: `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`,
      };
    }

    // Vimeo URL patterns
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);

    if (vimeoMatch) {
      return {
        type: "vimeo" as const,
        videoId: vimeoMatch[1],
      };
    }

    return null;
  };

  const handleUrlChange = (url: string) => {
    setNewVideo((prev) => ({ ...prev, url }));

    const videoInfo = extractVideoInfo(url);
    if (videoInfo) {
      setNewVideo((prev) => ({
        ...prev,
        type: videoInfo.type,
        thumbnail: videoInfo.thumbnail,
      }));
    }
  };

  const inputStyle =
    "w-full border border-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background";
  const labelStyle =
    "block noto-sans-jp-regular text-sm font-medium text-foreground mb-1";
  const buttonStyle =
    "border border-foreground px-3 py-1 text-xs hover:bg-foreground hover:text-background transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="neue-haas-grotesk-display text-xl text-primary leading-snug">
          Media Embeds
        </h3>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className={`${buttonStyle} bg-primary text-white border-primary hover:bg-primary-dark`}
          >
            + Add Media
          </button>
        )}
      </div>

      {/* Add New Video Form - 条件付きで表示 */}
      {showAddForm && (
        <div className="border border-gray-200 p-4 rounded space-y-3">
          <h4 className="noto-sans-jp-regular text-sm font-medium text-foreground">
            Add New Media
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelStyle}>Type</label>
              <select
                value={newVideo.type}
                onChange={(e) =>
                  setNewVideo((prev) => ({
                    ...prev,
                    type: e.target.value as MediaEmbed["type"],
                  }))
                }
                className={inputStyle}
              >
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="code">Code Embed</option>
                <option value="social">Social Media</option>
                <option value="iframe">Custom iFrame</option>
              </select>
            </div>

            <div>
              <label className={labelStyle}>Title</label>
              <input
                type="text"
                value={newVideo.title || ""}
                onChange={(e) =>
                  setNewVideo((prev) => ({ ...prev, title: e.target.value }))
                }
                className={inputStyle}
                placeholder="Video title"
              />
            </div>
          </div>

          <div>
            <label className={labelStyle}>URL *</label>
            <input
              type="url"
              value={newVideo.url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className={inputStyle}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div>
            <label className={labelStyle}>Description</label>
            <textarea
              value={newVideo.description || ""}
              onChange={(e) =>
                setNewVideo((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className={`${inputStyle} h-20 resize-vertical`}
              placeholder="Optional description"
              rows={2}
            />
          </div>

          {newVideo.type === "iframe" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelStyle}>Width</label>
                <input
                  type="number"
                  value={newVideo.width || ""}
                  onChange={(e) =>
                    setNewVideo((prev) => ({
                      ...prev,
                      width: parseInt(e.target.value) || undefined,
                    }))
                  }
                  className={inputStyle}
                  placeholder="560"
                />
              </div>
              <div>
                <label className={labelStyle}>Height</label>
                <input
                  type="number"
                  value={newVideo.height || ""}
                  onChange={(e) =>
                    setNewVideo((prev) => ({
                      ...prev,
                      height: parseInt(e.target.value) || undefined,
                    }))
                  }
                  className={inputStyle}
                  placeholder="315"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={cancelAdd} className={buttonStyle}>
              Cancel
            </button>
            <button
              type="button"
              onClick={addVideo}
              className={`${buttonStyle} bg-primary text-white border-primary hover:bg-primary-dark`}
              disabled={!newVideo.url.trim()}
            >
              Add Media
            </button>
          </div>
        </div>
      )}

      {/* Existing Videos */}
      {videos.length > 0 && (
        <div className="space-y-3">
          <h4 className="noto-sans-jp-regular text-sm font-medium text-foreground">
            Current Media ({videos.length})
          </h4>

          {videos.map((video, index) => (
            <div
              key={index}
              className="border border-gray-200 p-4 rounded space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelStyle}>Type</label>
                      <select
                        value={video.type}
                        onChange={(e) =>
                          updateVideo(index, "type", e.target.value)
                        }
                        className={inputStyle}
                      >
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                        <option value="code">Code Embed</option>
                        <option value="social">Social Media</option>
                        <option value="iframe">Custom iFrame</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelStyle}>Title</label>
                      <input
                        type="text"
                        value={video.title || ""}
                        onChange={(e) =>
                          updateVideo(index, "title", e.target.value)
                        }
                        className={inputStyle}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelStyle}>URL</label>
                    <input
                      type="url"
                      value={video.url}
                      onChange={(e) =>
                        updateVideo(index, "url", e.target.value)
                      }
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>Description</label>
                    <textarea
                      value={video.description || ""}
                      onChange={(e) =>
                        updateVideo(index, "description", e.target.value)
                      }
                      className={`${inputStyle} h-16 resize-vertical`}
                      rows={2}
                    />
                  </div>

                  {video.type === "iframe" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelStyle}>Width</label>
                        <input
                          type="number"
                          value={video.width || ""}
                          onChange={(e) =>
                            updateVideo(
                              index,
                              "width",
                              parseInt(e.target.value) || undefined,
                            )
                          }
                          className={inputStyle}
                        />
                      </div>
                      <div>
                        <label className={labelStyle}>Height</label>
                        <input
                          type="number"
                          value={video.height || ""}
                          onChange={(e) =>
                            updateVideo(
                              index,
                              "height",
                              parseInt(e.target.value) || undefined,
                            )
                          }
                          className={inputStyle}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeVideo(index)}
                  className="ml-4 text-red-500 hover:text-red-700 text-sm"
                  title="Remove media"
                >
                  Remove
                </button>
              </div>

              {/* Preview */}
              {video.url && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600 mb-2">Preview:</p>
                  <div className="text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-gray-200 text-gray-700 px-2 py-1 text-xs rounded">
                        {video.type}
                      </span>
                      {video.title && (
                        <span className="font-medium">{video.title}</span>
                      )}
                    </div>
                    <p className="text-xs text-blue-600 break-all">
                      {video.url}
                    </p>
                    {video.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {video.description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
