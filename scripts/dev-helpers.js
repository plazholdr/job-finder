#!/usr/bin/env node

/**
 * Development Helper Scripts for Job Finder
 * Provides utilities to help with development workflow
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Helper functions
const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}[${type.toUpperCase()}]${colors.reset} ${message}`);
};

// Generate component template
const generateComponent = (componentName, type = 'functional') => {
  const componentDir = path.join(projectRoot, 'frontend', 'components', componentName);
  
  if (fs.existsSync(componentDir)) {
    log(`Component ${componentName} already exists!`, 'warning');
    return;
  }

  fs.mkdirSync(componentDir, { recursive: true });

  const componentTemplate = `import React from 'react';
import { Card } from 'antd';
import styles from './${componentName}.module.css';

/**
 * ${componentName} Component
 * 
 * @param {Object} props - Component props
 * @returns {JSX.Element} ${componentName} component
 */
const ${componentName} = (props) => {
  return (
    <Card className={styles.container}>
      <h3>${componentName}</h3>
      {/* Add your component content here */}
    </Card>
  );
};

export default ${componentName};
`;

  const styleTemplate = `.container {
  /* Add your styles here */
}
`;

  const indexTemplate = `export { default } from './${componentName}';
`;

  fs.writeFileSync(path.join(componentDir, `${componentName}.jsx`), componentTemplate);
  fs.writeFileSync(path.join(componentDir, `${componentName}.module.css`), styleTemplate);
  fs.writeFileSync(path.join(componentDir, 'index.js'), indexTemplate);

  log(`Component ${componentName} created successfully!`, 'success');
  log(`Location: frontend/components/${componentName}/`, 'info');
};

// Generate service template for backend
const generateService = (serviceName) => {
  const serviceDir = path.join(projectRoot, 'backend', 'src', 'services', serviceName);
  
  if (fs.existsSync(serviceDir)) {
    log(`Service ${serviceName} already exists!`, 'warning');
    return;
  }

  fs.mkdirSync(serviceDir, { recursive: true });

  const serviceTemplate = `import { ${serviceName}Hooks } from './${serviceName}.hooks.js';

export const ${serviceName}Path = '${serviceName}';
export const ${serviceName}Methods = ['find', 'get', 'create', 'patch', 'remove'];

export const ${serviceName} = (app) => {
  // Initialize the service
  app.use(${serviceName}Path, new ${serviceName}Service(), {
    methods: ${serviceName}Methods,
    events: []
  });

  // Initialize hooks
  app.service(${serviceName}Path).hooks(${serviceName}Hooks);
};

class ${serviceName}Service {
  async find(params) {
    // Implement find logic
    return [];
  }

  async get(id, params) {
    // Implement get logic
    return {};
  }

  async create(data, params) {
    // Implement create logic
    return data;
  }

  async patch(id, data, params) {
    // Implement patch logic
    return data;
  }

  async remove(id, params) {
    // Implement remove logic
    return { id };
  }
}
`;

  const hooksTemplate = `export const ${serviceName}Hooks = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
`;

  fs.writeFileSync(path.join(serviceDir, `${serviceName}.js`), serviceTemplate);
  fs.writeFileSync(path.join(serviceDir, `${serviceName}.hooks.js`), hooksTemplate);

  log(`Service ${serviceName} created successfully!`, 'success');
  log(`Location: backend/src/services/${serviceName}/`, 'info');
  log(`Don't forget to register the service in your app configuration!`, 'warning');
};

// CLI interface
const command = process.argv[2];
const name = process.argv[3];

switch (command) {
  case 'component':
    if (!name) {
      log('Please provide a component name: node scripts/dev-helpers.js component MyComponent', 'error');
      process.exit(1);
    }
    generateComponent(name);
    break;
    
  case 'service':
    if (!name) {
      log('Please provide a service name: node scripts/dev-helpers.js service my-service', 'error');
      process.exit(1);
    }
    generateService(name);
    break;
    
  default:
    log('Available commands:', 'info');
    log('  component <name> - Generate a new React component', 'info');
    log('  service <name>   - Generate a new FeathersJS service', 'info');
    log('', 'info');
    log('Examples:', 'info');
    log('  node scripts/dev-helpers.js component UserProfile', 'info');
    log('  node scripts/dev-helpers.js service notifications', 'info');
}
