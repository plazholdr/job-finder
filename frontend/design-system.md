# Job Finder Design System

## Overview
This design system is built on top of Ant Design 5.27.4 with custom theming and components specific to the Job Finder application.

## Theme Configuration

### Colors
- **Primary**: #1890ff (Ant Design default blue)
- **Success**: #52c41a (Green for success states)
- **Warning**: #faad14 (Orange for warnings)
- **Error**: #f5222d (Red for errors)
- **Text Primary**: rgba(0, 0, 0, 0.88)
- **Text Secondary**: rgba(0, 0, 0, 0.65)

### Typography
- **Font Family**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Base Font Size**: 14px
- **Headings**: 
  - H1: 38px (2.714em)
  - H2: 30px (2.143em)
  - H3: 24px (1.714em)
  - H4: 20px (1.429em)
  - H5: 16px (1.143em)

### Spacing
- **Base Unit**: 8px
- **Small**: 8px
- **Medium**: 16px
- **Large**: 24px
- **XLarge**: 32px

### Breakpoints
- **xs**: 480px
- **sm**: 576px
- **md**: 768px
- **lg**: 992px
- **xl**: 1200px
- **xxl**: 1600px

## Component Guidelines

### Buttons
- Use `type="primary"` for main actions
- Use `type="default"` for secondary actions
- Use `danger` prop for destructive actions
- Maintain consistent sizing with `size` prop

### Forms
- Use Ant Design Form components with validation
- Implement consistent error messaging
- Use proper field spacing and layout
- Follow multi-step form patterns for complex flows

### Navigation
- Use Ant Design Menu components
- Implement breadcrumbs for deep navigation
- Use consistent iconography
- Show user profile with circular avatar

### Cards
- Use for content grouping
- Maintain consistent padding and shadows
- Use hover effects appropriately
- Include proper loading states

### Tables
- Use Ant Design Table with pagination
- Implement sorting and filtering
- Use consistent column widths
- Include action columns where needed

### Modals
- Use for confirmations and forms
- Implement proper focus management
- Use consistent sizing
- Include proper close mechanisms

## Accessibility Guidelines
- Target WCAG 2.1 AA compliance
- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation
- Maintain color contrast ratios
- Use focus indicators

## Mobile Responsiveness
- Mobile-first approach
- Use Ant Design Grid system
- Implement touch-friendly interactions
- Optimize for various screen sizes
- Test on actual devices

## Custom Components Location
- Store in `frontend/components/`
- Use PascalCase naming
- Include PropTypes or TypeScript definitions
- Document component APIs
- Include usage examples

## State Management
- Use TanStack Query for server state
- Use React state for local component state
- Implement proper loading and error states
- Cache data appropriately

## Performance Guidelines
- Use Next.js Image component for images
- Implement code splitting
- Use proper caching strategies
- Optimize bundle sizes
- Monitor Core Web Vitals
