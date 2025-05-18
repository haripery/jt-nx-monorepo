# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability within the Job Tracker application, please send an email to [hariprasath.periyasamy@gmail.com](mailto:hariprasath.periyasamy@gmail.com). All security vulnerabilities will be promptly addressed.

Please include the following information in your report:
- Type of issue
- Full paths of source file(s) related to the issue
- Location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

## Security Best Practices for This Repository

### Environment Variables

- Never commit `.env` files to the repository
- Use the provided `.env.example` as a template for required variables
- Always use environment variables for secrets, API keys, and connection strings
- For production, use a secure vault service rather than environment files

### Authentication

- The system uses JWT tokens for authentication
- Production deployments should use a strong, randomly generated JWT secret
- JWT expiration is set to 24 hours by default, adjust as needed for your security requirements
- Passwords are hashed using bcrypt with salt rounds

### API Security

- GraphQL endpoints are protected with authentication middleware
- CORS is configured to allow only necessary origins in production
- Rate limiting should be added for production deployments

### MongoDB Security

- Use strong, unique passwords for MongoDB instances
- Enable authentication for MongoDB
- For production, use a managed MongoDB service with proper security controls
- Consider encryption at rest for sensitive data

### Production Deployment Recommendations

1. Use HTTPS for all services
2. Add rate limiting to prevent abuse
3. Implement IP whitelisting where appropriate
4. Consider adding a Web Application Firewall (WAF)
5. Regularly update dependencies to address security vulnerabilities
6. Set up security scanning in your CI/CD pipeline
