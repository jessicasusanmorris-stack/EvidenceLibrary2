# Evidence Library

A forensic evidence management tool for legal matters. Upload files, view forensic specifications, and export court-ready PDF bundles.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jessicasusanmorris-stack/EvidenceLibrary2)

## Features

- Upload evidence files with automatic SHA-256 integrity hashing
- Forensic specifications panel with EV numbering
- Bundle Builder — group items into tabbed bundles with index page
- Export bundles as formatted PDF with cover page, index, and tab separators
- In-session memory (no database required)

## Getting Started

```bash
npm install
npm run dev
```

## Tech Stack

- React 19 + Vite
- Tailwind CSS
- jsPDF + jspdf-autotable
