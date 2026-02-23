"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { graphqlFetcher } from "../../lib/swr";
import { UPDATE_USER } from "../../lib/wordpress/queries/auth";
import type { UpdateUserResponse } from "../../lib/wordpress/types";

export function ProfileForm() {
  const { user, refreshUser } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setNickname(user.nickname || "");
      setDisplayName(user.name || "");
      setEmail(user.email || "");
      setWebsiteUrl(user.url || "");
      setDescription(user.description || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      await graphqlFetcher<UpdateUserResponse>([
        UPDATE_USER,
        {
          id: user.id,
          firstName,
          lastName,
          nickname,
          displayName,
          email,
          websiteUrl,
          description,
        },
      ]);

      await refreshUser();
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const emailChanged = email !== user.email;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar (read-only) */}
      <div className="flex items-center gap-4">
        {user.avatar?.url ? (
          <img src={user.avatar.url} alt="" className="w-16 h-16 rounded-full" />
        ) : (
          <span className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-medium">
            {(user.name || "U").charAt(0).toUpperCase()}
          </span>
        )}
        <div className="text-sm text-gray-500">
          Profile picture is managed via{" "}
          <a
            href="https://gravatar.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Gravatar
          </a>
        </div>
      </div>

      {/* Username (read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <input
          type="text"
          value={user.username}
          disabled
          className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-400">Usernames cannot be changed.</p>
      </div>

      {/* First / Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Nickname */}
      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
          Nickname
        </label>
        <input
          id="nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Display Name */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
          Display Name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {emailChanged && (
          <p className="mt-1 text-xs text-amber-600">
            Changing your email may require confirmation. Check your inbox after saving.
          </p>
        )}
      </div>

      {/* Website */}
      <div>
        <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Website
        </label>
        <input
          id="websiteUrl"
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Biographical Info
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      {/* Submit */}
      {message && (
        <p
          className={`text-sm ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
