import { db } from '@/lib/db';
import Link from 'next/link';

export default async function GalleryPage() {
  // Get public showcase projects
  const projects = await db.project.findMany({
    where: {
      showcaseInGallery: true,
      portfolioPublished: true,
    },
    include: {
      user: {
        select: {
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 12,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              ProjectLaunch
            </Link>
            <div className="flex gap-4">
              <Link
                href="/sign-in"
                className="rounded-xl px-6 py-2 font-semibold text-primary-600 hover:bg-primary-50"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-xl bg-primary-500 px-6 py-2 font-semibold text-white shadow-duo hover:bg-primary-600"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Gallery */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Student Project Gallery
          </h1>
          <p className="text-lg text-gray-600">
            Discover amazing passion projects from high school students
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-duo">
            <p className="mb-4 text-xl text-gray-600">
              No projects in the gallery yet.
            </p>
            <p className="text-gray-500">
              Be the first to showcase your passion project!
            </p>
            <Link
              href="/sign-up"
              className="mt-6 inline-block rounded-xl bg-primary-500 px-8 py-3 font-semibold text-white shadow-duo hover:bg-primary-600"
            >
              Start Your Project
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="overflow-hidden rounded-2xl bg-white shadow-duo transition-all hover:shadow-duo-hover"
              >
                <div className="p-6">
                  <div className="mb-2 inline-block rounded-lg bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-700">
                    {project.category}
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    {project.title}
                  </h3>
                  <p className="mb-4 line-clamp-3 text-gray-600">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-3">
                    {project.user.avatar && (
                      <img
                        src={project.user.avatar}
                        alt={project.user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    <span className="text-sm text-gray-700">
                      {project.user.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
