import Link from "next/link";
import siteConfig from "@/../data/site-config.json";
import portfolioData from "@/../data/portfolio.json";
import profileData from "@/../data/profile.json";

export default function HomePage() {
  const featuredProjects = portfolioData.projects
    .filter((p) => p.featured)
    .slice(0, 3);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <section className="py-16 md:py-24">
        <div className="max-w-3xl">
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tighter mb-4">
            {siteConfig.site.name}
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 mb-6">
            {profileData.personalInfo.title}
          </p>
          <p className="text-base text-foreground/70">
            {profileData.personalInfo.bio}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 border-t border-foreground/10">
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-8">
          Featured Projects
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredProjects.map((project) => (
            <Link
              href={`/portfolio/${project.id}`}
              key={project.id}
              className="group block"
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold group-hover:text-foreground/80 transition-colors">
                  {project.title}
                </h3>
                <p className="text-foreground/70 mt-2">{project.description}</p>
              </div>
              <div className="flex items-center text-sm text-foreground/60">
                <span>{project.projectPeriod}</span>
                <div className="flex flex-wrap gap-2 ml-4">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-foreground/10 text-foreground/80 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/portfolio"
            className="text-foreground/80 hover:text-white transition-colors"
          >
            全てのプロジェクトを見る
          </Link>
        </div>
      </section>

      <section className="py-16 md:py-24 border-t border-foreground/10">
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">
          Services
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {siteConfig.navigation.map((item) => (
            <Link href={item.href} key={item.id} className="text-center group">
              <h3 className="text-lg font-bold group-hover:text-foreground/80 transition-colors">
                {item.label}
              </h3>
              <p className="text-sm text-foreground/70">詳しく見る</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
