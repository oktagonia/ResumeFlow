# ResumeFlow

Because spending hours formatting a resume is for people who don't know better.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.0+-green)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue)](https://www.python.org/)

## Description

ResumeFlow is a modern, web-based resume editor that combines the power of rich text editing with LaTeX compilation to create professional, beautifully formatted resumes. Built with Next.js for the frontend and FastAPI for the backend, it offers a seamless editing experience with real-time PDF generation.

### Features

- **Rich Text Editor**: Intuitive WYSIWYG editor with support for formatting, links, and custom styling
- **LaTeX Integration**: Direct LaTeX editing for advanced formatting and mathematical expressions
- **Real-time PDF Generation**: Compile your resume to PDF instantly with professional LaTeX templates
- **Section Management**: Organize your resume with collapsible sections and items
- **Bullet Point Editor**: Rich text editing for bullet points with formatting options
- **Authentication**: Secure login system with GitHub OAuth integration
- **Docker Support**: Easy deployment with Docker and Docker Compose

## Installation

### Prerequisites

- Node.js 20+ 
- Python 3.8+
- Docker (optional, for containerized deployment)
- LaTeX distribution (for PDF compilation)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/oktagonia/ResumeFlow.git
   cd ResumeFlow
   ```

2. **Set up the backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Set up the frontend**
   ```bash
   cd ../resume-editor
   npm install
   # or
   pnpm install
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the `resume-editor` directory:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:8000
   AUTH_SECRET=your-secret-key-here
   AUTH_GITHUB_ID=your-github-oauth-id
   AUTH_GITHUB_SECRET=your-github-oauth-secret
   ```

5. **Start the development servers**
   
   Backend (from the `backend` directory):
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   Frontend (from the `resume-editor` directory):
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to start using ResumeFlow.

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Or build individual images**
   ```bash
   # Build frontend
   cd resume-editor
   docker build -t resume-flow/frontend:latest .
   
   # Build backend
   cd ../backend
   docker build -t resume-flow/backend:latest .
   ```

## Usage

### Getting Started

1. **Create a new resume section**
   - Click the "Add Section" button to create a new resume section
   - Choose between regular text sections or LaTeX sections

2. **Add content to sections**
   - Use the rich text editor for formatted content
   - Add items within sections for structured information
   - Include bullet points with rich text formatting

3. **Edit LaTeX sections**
   - Switch to LaTeX mode for advanced formatting
   - Write LaTeX code directly for mathematical expressions or custom styling

4. **Generate PDF**
   - Click the "Generate PDF" button to compile your resume
   - Download the professionally formatted PDF

### Advanced Features

- **Section Management**: Collapse/expand sections, toggle visibility
- **Item Organization**: Add multiple items within sections with organization details
- **Bullet Point Editing**: Rich text editing for bullet points with formatting
- **Real-time Preview**: See changes as you type

## API Reference

### Backend Endpoints

- `GET /sections` - Get all resume sections
- `POST /sections/add-section` - Add a new text section
- `POST /sections/add-latex` - Add a new LaTeX section
- `PATCH /sections/{id}/title` - Update section title
- `DELETE /sections/{id}` - Delete a section
- `POST /sections/{id}/items` - Add an item to a section
- `POST /pdf` - Generate PDF from resume data

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests** (if available)
   ```bash
   npm run test
   # or
   pnpm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## Project Status

This project is actively maintained and accepting contributions. We're working on:

- [ ] Enhanced LaTeX templates
- [ ] More export formats (DOCX, HTML)
- [ ] Template library
- [ ] Collaborative editing features
- [ ] Mobile app version

## Support

If you encounter any issues or have questions:

- **Issues**: [GitHub Issues](https://github.com/oktagonia/ResumeFlow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/oktagonia/ResumeFlow/discussions)
- **Email**: [Contact information if available]

## Authors and Acknowledgments

- **Maintainer**: [Your Name/Organization]
- **Contributors**: [List of contributors]

Special thanks to:
- [Next.js](https://nextjs.org/) for the amazing React framework
- [FastAPI](https://fastapi.tiangolo.com/) for the high-performance API framework
- [TipTap](https://tiptap.dev/) for the rich text editor
- [LaTeX](https://www.latex-project.org/) for professional document formatting

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## FAQ

**Q: Do I need to know LaTeX to use ResumeFlow?**
A: No! The rich text editor handles most formatting needs. LaTeX sections are optional for advanced users.

**Q: Can I export my resume in other formats?**
A: Currently, PDF export is supported. We're working on DOCX and HTML export options.

**Q: Is my data stored securely?**
A: ResumeFlow runs locally by default, so your data stays on your machine. For cloud deployments, ensure proper security measures.

**Q: Can I use custom LaTeX templates?**
A: Yes! You can modify the LaTeX template in the backend to match your preferred style.

---

**Made with ❤️ by the ResumeFlow team**
