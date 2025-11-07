export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Tasky",
  description:
    "A minimal, LLM-friendly task management app with a beautiful kanban board.",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
  ],
  links: {
    github: "https://github.com/stumptowndoug/tasky",
    docs: "/docs/LLM_GUIDE.md",
  },
}
