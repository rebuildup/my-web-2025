import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import profileData from "@/../data/profile.json";
import socialLinks from "@/../data/social-links.json";

export const metadata: Metadata = {
  title: "About | samuido（木村友亮）",
  description: "Web開発者・デザイナーsamuido（木村友亮）のプロフィール、スキル、経歴について",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                About
              </span>
            </h1>
            <p className="text-xl text-white/70">
              {profileData.personalInfo.bio}
            </p>
          </div>

          {/* Profile Overview */}
          <Card variant="glass" className="mb-12">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-blue-400">
                {profileData.personalInfo.name}
              </CardTitle>
              <CardDescription className="text-lg">
                {profileData.personalInfo.realName} • {profileData.personalInfo.title}
              </CardDescription>
              <p className="text-white/60">
                📍 {profileData.personalInfo.location}
              </p>
            </CardHeader>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Link href="/about/profile">
              <Card variant="elevated" className="text-center hover:scale-105 transition-transform cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-blue-400">👤 詳細プロフィール</CardTitle>
                  <CardDescription>
                    スキル、経歴、実績について
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/about/card">
              <Card variant="elevated" className="text-center hover:scale-105 transition-transform cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-purple-400">💼 デジタル名刺</CardTitle>
                  <CardDescription>
                    印刷可能な名刺・連絡先
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/about/links">
              <Card variant="elevated" className="text-center hover:scale-105 transition-transform cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-green-400">🔗 リンク集</CardTitle>
                  <CardDescription>
                    SNS・外部サービス一覧
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>

          {/* Skills Overview */}
          <Card variant="glass" className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl text-center">スキル概要</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <h4 className="font-semibold text-blue-400 mb-3">フロントエンド</h4>
                  <ul className="space-y-1 text-sm text-white/70">
                    {profileData.skills.frontend.slice(0, 4).map((skill) => (
                      <li key={skill.name} className="flex justify-between">
                        <span>{skill.name}</span>
                        <span>{skill.level}%</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-purple-400 mb-3">バックエンド</h4>
                  <ul className="space-y-1 text-sm text-white/70">
                    {profileData.skills.backend.map((skill) => (
                      <li key={skill.name} className="flex justify-between">
                        <span>{skill.name}</span>
                        <span>{skill.level}%</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-green-400 mb-3">ツール</h4>
                  <ul className="space-y-1 text-sm text-white/70">
                    {profileData.skills.tools.slice(0, 4).map((skill) => (
                      <li key={skill.name} className="flex justify-between">
                        <span>{skill.name}</span>
                        <span>{skill.level}%</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-orange-400 mb-3">言語</h4>
                  <ul className="space-y-1 text-sm text-white/70">
                    {profileData.skills.languages.map((skill) => (
                      <li key={skill.name} className="flex justify-between">
                        <span>{skill.name}</span>
                        <span>{skill.level}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Experience Preview */}
          <Card variant="glass" className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl text-center">経歴</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {profileData.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-blue-500 pl-6">
                    <h4 className="font-semibold text-blue-400">{exp.position}</h4>
                    <p className="text-white/80">{exp.company}</p>
                    <p className="text-sm text-white/60 mb-2">{exp.period}</p>
                    <p className="text-sm text-white/70">{exp.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card variant="glass" className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl">お仕事のご依頼</CardTitle>
              <CardDescription>
                Web制作・デザインのお仕事をお探しですか？
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg" variant="primary">
                    お問い合わせ
                  </Button>
                </Link>
                <a href={`mailto:${profileData.contact.email}`}>
                  <Button size="lg" variant="outline">
                    メール送信
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
