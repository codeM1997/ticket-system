// ErrorMessage: accessible error display (role="alert", WCAG 2.1 AA contrast)
// Requirements: 10.1, 10.2, 10.3, 10.4

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.5rem",
    padding: "0.75rem 1rem",
    borderRadius: "4px",
    border: "1px solid #8a1f11",
    backgroundColor: "#fdecea",
    color: "#611a15", // contrast ratio vs #fdecea > 7:1 (AA/AAA compliant)
  },
  icon: {
    flexShrink: 0,
    fontWeight: 700,
  },
  message: {
    margin: 0,
    fontSize: "0.9rem",
    lineHeight: 1.4,
  },
};

export interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div role="alert" style={styles.container}>
      <span aria-hidden="true" style={styles.icon}>
        ⚠
      </span>
      <p style={styles.message}>{message}</p>
    </div>
  );
}

export default ErrorMessage;
