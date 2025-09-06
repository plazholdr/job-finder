import re

# Read the file
with open('/home/ubuntu/job-finder-staging/backend/src/services/index.js', 'r') as f:
    content = f.read()

# Replace the import statement
content = re.sub(
    r'const StorageUtils = require\([\'\"]\.\./utils/storage[\'\"]\);',
    'const { S3StorageUtils } = require("../utils/s3-storage");',
    content
)

# Replace all StorageUtils. with S3StorageUtils.
content = content.replace('StorageUtils.', 'S3StorageUtils.')

# Remove any duplicate require statements in fileFilter
content = re.sub(
    r'const StorageUtils = require\([\'\"]\.\./utils/storage[\'\"]\);\s*',
    '',
    content
)

# Write the file back
with open('/home/ubuntu/job-finder-staging/backend/src/services/index.js', 'w') as f:
    f.write(content)

print('Services file fixed successfully')
