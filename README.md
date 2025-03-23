# Language AI - Spanish Learning Platform

A modern web application for learning Spanish through AI-powered interactions and structured lessons.

## Features

- Interactive Spanish lessons
- AI-powered conversation practice
- Progress tracking
- Personalized learning experience
- Modern and responsive UI

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Node.js

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/language-ai.git
cd language-ai
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your environment variables:
```bash
NEXT_PUBLIC_API_URL=your_api_url
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
language-ai/
├── app/                    # Next.js app directory
│   ├── components/        # Reusable UI components
│   ├── contexts/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and libraries
│   ├── styles/          # Global styles and Tailwind CSS
│   └── utils/           # Helper functions
├── public/               # Static files
├── .env.local           # Local environment variables
├── next.config.js       # Next.js configuration
├── package.json         # Project dependencies and scripts
├── postcss.config.js    # PostCSS configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Development

- Run tests: `npm test`
- Build for production: `npm run build`
- Start production server: `npm start`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 