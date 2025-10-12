# Web GUI - Technical Documentation

> Technical documentation for developers working on the Web GUI component.

**For end-user documentation, see:** [Complete Documentation](../docs/project-info.md)

---

## Overview

This directory contains the Web GUI for React Feature Discovery - a lightweight, modern browser interface built with pure HTML/CSS/JavaScript (no frameworks!).

## File Structure

```
gui/
├── index.html          # Single-page web interface
└── README.md           # This file
```

## Technology Stack

### Backend (`src/server.ts`)
- **Pure Node.js HTTP server** - No Express or other frameworks
- **TypeScript** - Type-safe server code
- **Job-based processing** - Async analysis with polling
- **In-memory storage** - Job tracking without database

### Frontend (`index.html`)
- **Pure HTML5** - Single file, no build process
- **CSS3** - Embedded styles, dark theme
- **Vanilla JavaScript** - No React, Vue, or Angular
- **~300KB total** - Ultra-lightweight

## Architecture

### Request Flow

```
Browser → HTTP Server → Analysis Engine → Results
   ↑                                          ↓
   └──────── Polling for Progress ───────────┘
```

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/` | Serve HTML interface |
| `POST` | `/api/validate-directory` | Validate project path before analysis |
| `POST` | `/api/analyze` | Start analysis job (returns job ID) |
| `GET` | `/api/job/:id` | Get job status and progress |
| `GET` | `/api/result/:path` | Retrieve generated result files |

### Job Processing

1. Client submits analysis request
2. Server validates configuration
3. Server creates job with unique ID
4. Server runs analysis asynchronously
5. Client polls for job status
6. Server returns results when complete

## Development

### Running Locally

```bash
# Start development server
npm run gui

# Or run server directly
node dist/server.js

# Custom port
PORT=8080 npm run gui
```

### Making Changes

**Frontend (index.html):**
- Edit `gui/index.html`
- Refresh browser to see changes
- No build step required!

**Backend (server.ts):**
1. Edit `src/server.ts`
2. Rebuild: `npm run build`
3. Restart server: `npm run gui`

## Customization

### Environment Variables

- `PORT` - Server port (default: `3000`)

```bash
# Use custom port
PORT=8080 npm run gui
```

### Styling

All styles are embedded in `index.html` using CSS variables:

```css
:root {
  --primary: #61dafb;
  --background: #0d1117;
  --surface: #161b22;
  /* ... more variables */
}
```

Edit these variables to customize the theme.

### API Extensions

To add new endpoints, edit `src/server.ts`:

```typescript
if (req.url === '/api/my-endpoint' && req.method === 'POST') {
  // Handle request
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true }));
  return;
}
```

## Security Considerations

### Path Validation
- All paths are validated before processing
- Prevents path traversal attacks
- Restricts access to specified directories

### CORS Headers
- Configured for localhost development
- Should be restricted in production deployment

### Input Sanitization
- All user inputs are validated
- Directory paths checked before analysis
- Configuration validated against schema

## Deployment

### Local Network Access

To allow access from other devices on your network:

```bash
# Listen on all interfaces
HOST=0.0.0.0 PORT=3000 npm run gui
```

Then access via: `http://your-ip-address:3000`

### Production Considerations

If deploying to a server:
1. **Add authentication** - Protect the interface
2. **Restrict CORS** - Limit allowed origins
3. **Use HTTPS** - Encrypt traffic
4. **Rate limiting** - Prevent abuse
5. **Input validation** - Enhanced security checks

## Contributing

### Code Style

- **HTML**: Semantic, accessible markup
- **CSS**: BEM naming convention, embedded in `<style>`
- **JavaScript**: ES6+, no external dependencies
- **TypeScript**: Strict mode, full type coverage

### Adding Features

1. **Frontend**: Edit `gui/index.html`
2. **Backend**: Edit `src/server.ts`
3. **Test**: Run `npm run gui` and test manually
4. **Document**: Update this README

### Testing

Manual testing checklist:
- [ ] GUI loads correctly
- [ ] Directory validation works
- [ ] Analysis starts and completes
- [ ] Progress updates in real-time
- [ ] Results display correctly
- [ ] Error handling works
- [ ] Works on different browsers
- [ ] Responsive on mobile devices

## Troubleshooting

### GUI Won't Load

```bash
# Check if server is running
# Look for "Server running at" message

# Check if port is available
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # macOS/Linux
```

### Analysis Not Starting

- Check browser console for errors
- Verify path exists and is accessible
- Check server terminal for error messages

### Styling Issues

- Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Check browser compatibility (modern browsers required)

## Performance

### Optimization Features

- **No framework overhead** - Pure HTML/CSS/JS
- **Single file** - One HTTP request for frontend
- **Minimal JavaScript** - Small bundle size
- **Async processing** - Non-blocking analysis
- **Polling interval** - 500ms (configurable)

### Benchmarks

- **Page load**: < 50ms
- **Initial render**: < 100ms
- **Memory usage**: ~10MB
- **Analysis speed**: Same as CLI

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE 11 not supported

## Related Documentation

- [Main README](../README.md) - Project overview
- [Complete Documentation](../docs/project-info.md) - Full user guide
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute
- [Server Source](../src/server.ts) - Backend implementation

---

**Built with ❤️ for simplicity and performance**
