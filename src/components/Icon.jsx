export default function Icon({ name, size = 20, className = "" }) {
  const paths = {
    calendar: (<> <path d="M7 3v3M17 3v3M4 9h16" /> <rect x="4" y="5" width="16" height="16" rx="3" /> </>),
    chevronDown: <path d="m8 10 4 4 4-4" />,
    chevronLeft: <path d="m15 18-6-6 6-6" />,
    chevronRight: <path d="m9 18 6-6-6-6" />,
    briefcase: (<> <rect x="3" y="7" width="18" height="13" rx="2" /> <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /> </>),
    palette: (<> <circle cx="12" cy="12" r="9" /> <circle cx="8.5" cy="9.5" r="1" fill="currentColor" /> <circle cx="12" cy="7.5" r="1" fill="currentColor" /> <circle cx="15.5" cy="9.5" r="1" fill="currentColor" /> <path d="M12 21a2.5 2.5 0 0 0 2.5-2.5c0-1.5-1-2-1-3.5" /> </>),
    edit: (<> <path d="m14 5 5 5" /> <path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4Z" /> </>),
    eye: (<> <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /> <circle cx="12" cy="12" r="2.5" /> </>),
    home: (<> <path d="m3 11 9-8 9 8" /> <path d="M5 10v10h14V10M9 20v-6h6v6" /> </>),
    lock: (<> <rect x="5" y="10" width="14" height="11" rx="2" /> <path d="M8 10V7a4 4 0 0 1 8 0v3" /> </>),
    logout: <path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" />,
    mail: (<> <rect x="3" y="5" width="18" height="14" rx="2" /> <path d="m4 7 8 6 8-6" /> </>),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    search: (<> <circle cx="11" cy="11" r="7" /> <path d="m20 20-4-4" /> </>),
    settings: (<> <circle cx="12" cy="12" r="3" /> <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /> </>),
    trash: (<> <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" /> </>),
    user: (<> <circle cx="12" cy="8" r="4" /> <path d="M4 21a8 8 0 0 1 16 0" /> </>),
    users: (<> <circle cx="9" cy="8" r="4" /> <path d="M2 21a7 7 0 0 1 14 0M16 5a4 4 0 0 1 0 7M18 15a6 6 0 0 1 4 6" /> </>),
    x: <path d="m6 6 12 12M18 6 6 18" />,
    theater: (<> <path d="M4 4h16v16H4z" /> <circle cx="9" cy="9" r="2" /> <circle cx="15" cy="9" r="2" /> <path d="M8 15c1.5 1.5 6.5 1.5 8 0" /> </>),
    ticket: (<> <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /> <path d="M13 5v2M13 11v2M13 17v2" /> </>),
    external: (<> <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /> <path d="M15 3h6v6" /> <path d="M10 14 21 3" /> </>),
    check: <path d="M20 6 9 17l-5-5" />,
    "map-pin": (<> <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" /> <circle cx="12" cy="10" r="3" /> </>),
    star: <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  )
}