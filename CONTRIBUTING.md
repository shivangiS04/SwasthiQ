# Contributing to SwasthiQ

Thank you for your interest in contributing to SwasthiQ! We welcome contributions from the healthcare technology community.

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm 8+
- Python 3.11+ and pip
- Git for version control
- Basic knowledge of React and Python/Flask

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/swasthiq-appointment-system.git`
3. Install dependencies: `npm install && cd backend && pip install -r requirements.txt`
4. Start development servers: `npm run dev` and `npm run start:api`

## 🛠 Development Workflow

### Branch Naming
- Feature branches: `feature/description-of-feature`
- Bug fixes: `bugfix/description-of-bug`
- Documentation: `docs/description-of-change`

### Commit Messages
Follow conventional commit format:
```
type(scope): description

feat(appointments): add recurring appointment support
fix(api): resolve conflict detection edge case
docs(readme): update installation instructions
```

### Code Standards

#### Frontend (React/JavaScript)
- Use functional components with hooks
- Follow ESLint configuration
- Write descriptive component and function names
- Add PropTypes for component props
- Maintain consistent file structure

#### Backend (Python)
- Follow PEP 8 style guide
- Use type hints for function parameters and returns
- Write docstrings for all functions and classes
- Maintain separation of concerns
- Add comprehensive error handling

#### Testing
- Write tests for all new features
- Maintain minimum 80% code coverage
- Include both unit and integration tests
- Use descriptive test names

## 📋 Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, documented code
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm test                    # Frontend tests
   npm run test:backend        # Backend tests
   npm run lint               # Code linting
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat(scope): description of changes"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a pull request on GitHub.

### PR Requirements
- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated (if applicable)
- [ ] No breaking changes (or clearly documented)
- [ ] Descriptive PR title and description

## 🧪 Testing Guidelines

### Frontend Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- AppointmentCard.test.jsx
```

### Backend Testing
```bash
# Run all backend tests
npm run test:backend

# Run specific test
cd tests/backend && python -m pytest test_appointment_service.py::TestClass::test_method -v
```

### Writing Tests
- Test user interactions, not implementation details
- Use descriptive test names that explain the scenario
- Mock external dependencies appropriately
- Test both success and error cases

## 🎨 UI/UX Guidelines

### Design System
- Follow the established black and blue color scheme
- Use consistent spacing and typography
- Ensure accessibility (WCAG 2.1 AA compliance)
- Test on multiple screen sizes
- Maintain professional healthcare aesthetic

### Component Guidelines
- Keep components focused and reusable
- Use semantic HTML elements
- Implement proper ARIA labels
- Follow React best practices for performance

## 🔒 Security Considerations

### Data Handling
- Never log sensitive patient information
- Validate all inputs on both client and server
- Use parameterized queries (when database is added)
- Implement proper error handling without data exposure

### Authentication (Future)
- Follow OWASP security guidelines
- Implement proper session management
- Use secure password hashing
- Consider HIPAA compliance requirements

## 📚 Documentation

### Code Documentation
- Write clear, concise comments
- Document complex business logic
- Update README for new features
- Include API documentation for new endpoints

### User Documentation
- Update user guides for new features
- Include screenshots for UI changes
- Provide clear installation instructions
- Document configuration options

## 🐛 Bug Reports

### Before Submitting
- Check existing issues for duplicates
- Test with the latest version
- Gather relevant system information

### Bug Report Template
```markdown
**Describe the Bug**
Clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Node.js version: [e.g. 16.14.0]
- Python version: [e.g. 3.11.0]
```

## 💡 Feature Requests

### Before Submitting
- Check if the feature aligns with project goals
- Consider if it benefits healthcare providers
- Review existing feature requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
Clear description of the problem.

**Describe the solution you'd like**
Clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions you've considered.

**Healthcare Context**
How this feature benefits healthcare providers or patients.

**Additional context**
Any other context, mockups, or examples.
```

## 🏥 Healthcare-Specific Guidelines

### Compliance Considerations
- Consider HIPAA requirements for patient data
- Ensure data privacy and security
- Follow healthcare UI/UX best practices
- Consider accessibility for healthcare workers

### Domain Knowledge
- Understand healthcare workflows
- Use appropriate medical terminology
- Consider real-world clinical scenarios
- Validate features with healthcare professionals

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers learn and contribute
- Maintain professional communication

### Getting Help
- Check documentation first
- Search existing issues and discussions
- Ask questions in GitHub Discussions
- Join our community Discord (link in README)

## 📈 Roadmap Contributions

We welcome contributions toward our roadmap items:

### High Priority
- Patient portal integration
- SMS/Email reminders
- Advanced reporting
- Multi-clinic support

### Medium Priority
- Mobile app development
- EMR system integrations
- Telehealth features
- AI-powered scheduling

### How to Contribute to Roadmap
1. Review the roadmap in README.md
2. Comment on related issues
3. Propose implementation approaches
4. Submit PRs for approved features

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Annual contributor highlights
- Community Discord recognition

## 📞 Questions?

- **General Questions**: GitHub Discussions
- **Bug Reports**: GitHub Issues
- **Security Issues**: Email security@swasthiq.com
- **Feature Discussions**: GitHub Discussions

Thank you for contributing to SwasthiQ and helping improve healthcare technology! 🏥✨