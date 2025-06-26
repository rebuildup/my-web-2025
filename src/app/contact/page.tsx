import { Metadata } from "next";

export const metadata: Metadata = {
  title: "お問い合わせ | samuido",
  description:
    "samuidoへのお問い合わせ。プロジェクトのご相談、業務依頼、技術に関するご質問など。",
  keywords: ["お問い合わせ", "コンタクト", "相談", "依頼", "samuido"],
};

export default function ContactPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#222222",
        color: "#ffffff",
        padding: "2rem",
      }}
    >
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: "#ffffff",
              marginBottom: "1rem",
            }}
          >
            お問い合わせ
          </h1>
          <p
            style={{
              fontSize: "1.25rem",
              color: "#ffffff",
              opacity: 0.9,
              maxWidth: "40rem",
              margin: "0 auto",
            }}
          >
            プロジェクトのご相談、業務依頼、技術に関するご質問など、お気軽にお問い合わせください。
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "2rem",
            maxWidth: "72rem",
            margin: "0 auto",
          }}
        >
          {/* お問い合わせフォーム */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "1rem",
              padding: "2rem",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#ffffff",
                marginBottom: "1.5rem",
              }}
            >
              お問い合わせフォーム
            </h2>

            <form style={{ display: "grid", gap: "1.5rem" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#ffffff",
                    }}
                  >
                    お名前 <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="山田太郎"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid rgba(255,255,255,0.3)",
                      borderRadius: "8px",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      color: "#ffffff",
                      fontSize: "1rem",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#ffffff",
                    }}
                  >
                    メールアドレス <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="example@email.com"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid rgba(255,255,255,0.3)",
                      borderRadius: "8px",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      color: "#ffffff",
                      fontSize: "1rem",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#ffffff",
                  }}
                >
                  会社名・組織名
                </label>
                <input
                  type="text"
                  placeholder="株式会社サンプル"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: "#ffffff",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#ffffff",
                  }}
                >
                  お問い合わせ種別 <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: "#ffffff",
                    fontSize: "1rem",
                  }}
                >
                  <option value="">選択してください</option>
                  <option value="project">プロジェクトのご相談</option>
                  <option value="work">業務依頼</option>
                  <option value="technical">技術的なご質問</option>
                  <option value="collaboration">コラボレーション</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#ffffff",
                  }}
                >
                  件名 <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Webサイト制作のご相談"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: "#ffffff",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#ffffff",
                  }}
                >
                  メッセージ <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="プロジェクトの詳細、ご質問内容などをご記入ください。"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: "#ffffff",
                    fontSize: "1rem",
                    resize: "vertical",
                  }}
                />
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input
                  type="checkbox"
                  id="privacy"
                  required
                  style={{
                    accentColor: "#0000ff",
                  }}
                />
                <label
                  htmlFor="privacy"
                  style={{ fontSize: "0.875rem", color: "#ffffff" }}
                >
                  プライバシーポリシーに同意します{" "}
                  <span style={{ color: "#ef4444" }}>*</span>
                </label>
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "1rem",
                  backgroundColor: "#0000ff",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "opacity 0.2s ease",
                }}
              >
                送信する
              </button>
            </form>
          </div>

          {/* 連絡先情報 */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: "1rem",
              padding: "2rem",
              border: "1px solid rgba(255,255,255,0.1)",
              height: "fit-content",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#ffffff",
                marginBottom: "1.5rem",
              }}
            >
              連絡先情報
            </h2>

            <div style={{ display: "grid", gap: "2rem" }}>
              <div>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    color: "#0000ff",
                    marginBottom: "0.5rem",
                  }}
                >
                  📧 Email
                </h3>
                <p
                  style={{
                    color: "#ffffff",
                    fontSize: "1rem",
                  }}
                >
                  rebuild.up.up@gmail.com
                </p>
                <p
                  style={{
                    color: "#ffffff",
                    fontSize: "0.875rem",
                    opacity: 0.8,
                    marginTop: "0.25rem",
                  }}
                >
                  お問い合わせ・制作依頼（映像制作/デザイン等）・副業依頼はこちらからお願いします
                </p>
              </div>

              <div>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    color: "#0000ff",
                    marginBottom: "0.5rem",
                  }}
                >
                  𝕏 Twitter
                </h3>
                <p
                  style={{
                    color: "#ffffff",
                    fontSize: "1rem",
                  }}
                >
                  @361do_sleep
                </p>
              </div>

              <div>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    color: "#0000ff",
                    marginBottom: "0.5rem",
                  }}
                >
                  ⏰ 対応時間
                </h3>
                <p
                  style={{
                    color: "#ffffff",
                    fontSize: "1rem",
                  }}
                >
                  平日: 9:00 - 18:00
                </p>
                <p
                  style={{
                    color: "#ffffff",
                    fontSize: "0.875rem",
                    opacity: 0.8,
                    marginTop: "0.25rem",
                  }}
                >
                  通常24時間以内にご返信いたします
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
