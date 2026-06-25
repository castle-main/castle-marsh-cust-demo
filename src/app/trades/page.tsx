export const metadata = { title: "Castle Internal — Trades" };

export default function TradesPage() {
  return (
    <iframe
      src="/tradebook.html"
      title="Castle Trade Book"
      style={{ display: "block", width: "100%", height: "100vh", border: "none", background: "#fff" }}
    />
  );
}
