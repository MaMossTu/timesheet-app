# Time Tracking Application

A modern time tracking web application built with Next.js 14, TypeScript, and Tailwind CSS. This application allows users to log work hours, categorize tasks, view time entries in a calendar interface, and export data to various formats.

## ✨ Features

- **Time Entry Management**: Add, edit, and delete time entries with start/end times
- **Project Categories**: Organize work by projects and categories
- **Interactive Calendar**: FullCalendar integration showing time entries
- **Export Functionality**: Export to CSV, PDF, and Excel (.xlsx) formats
- **Statistics Dashboard**: View daily, weekly, and monthly time tracking stats
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Calendar**: FullCalendar React components
- **Database**: Prisma ORM with SQLite (development)
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Export**: jsPDF, csv-writer, xlsx
- **Date Handling**: date-fns

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd timesheet-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up the database:
```bash
npx prisma migrate dev --name init
```

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
timesheet-app/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js app router
│   ├── components/            # React components
│   └── lib/                   # Utility functions
├── public/                    # Static assets
└── package.json
```

## 🗄️ Database Schema

- **Users**: User authentication and profile information
- **Projects**: Project categories and details
- **Categories**: Work category classification
- **TimeEntries**: Individual time tracking records

## 🎯 Usage

1. **Add Time Entry**: Click the "Add Entry" button to log your work time
2. **View Calendar**: Switch between week, month, and day views
3. **Export Data**: Use the export button to download reports in CSV, PDF, or Excel format
4. **Track Statistics**: Monitor your daily, weekly, and monthly productivity

## 🚧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma database browser

### Environment Variables

Create a `.env` file in the root directory:

```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## 📄 Export Formats

- **CSV**: Comma-separated values for spreadsheet applications
- **PDF**: Formatted reports for printing and sharing
- **Excel (.xlsx)**: Full-featured spreadsheet format

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please:

1. Check the [documentation](docs/)
2. Search [existing issues](issues/)
3. Create a [new issue](issues/new) if needed

---

**Built with ❤️ using Next.js and TypeScript**
