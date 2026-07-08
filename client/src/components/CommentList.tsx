// CommentList: displays comments in chronological order (oldest first)
// Requirements: 6.4

import type { Comment, User } from "../types";

export interface CommentListProps {
  comments: Comment[];
  users?: User[];
}

export function CommentList({ comments, users = [] }: CommentListProps) {
  if (comments.length === 0) {
    return <p style={{ color: "#666", fontStyle: "italic" }}>No comments yet.</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {comments.map((comment) => (
        <li
          key={comment.id}
          style={{
            padding: "0.75rem",
            marginBottom: "0.5rem",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            backgroundColor: "#fafafa",
          }}
        >
          <p style={{ margin: "0 0 0.25rem" }}>{comment.message}</p>
          <small style={{ color: "#666" }}>
            By {users.find((u) => u.id === comment.createdBy)?.name ?? comment.createdBy} &middot;{" "}
            {new Date(comment.createdAt).toLocaleString()}
          </small>
        </li>
      ))}
    </ul>
  );
}

export default CommentList;
